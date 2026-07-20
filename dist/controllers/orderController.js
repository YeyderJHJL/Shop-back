import { prisma } from '../config/prisma.js';
export const createOrder = async (req, res) => {
    try {
        const { items } = req.body; // items: [{ productId, quantity }]
        const clientId = req.user?.id;
        if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ message: 'Datos de pedido inválidos' });
            return;
        }
        let totalAmount = 0;
        const orderItemsData = [];
        // Calcular el total y preparar los items
        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) {
                res.status(404).json({ message: `Producto no encontrado: ${item.productId}` });
                return;
            }
            if (product.stock < item.quantity) {
                res.status(400).json({ message: `Stock insuficiente para ${product.name}` });
                return;
            }
            totalAmount += product.currentPrice * item.quantity;
            orderItemsData.push({
                productId: product.id,
                quantity: item.quantity,
                priceAtPurchase: product.currentPrice
            });
        }
        // Usar transacción para crear la orden y descontar el stock
        const newOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    clientId,
                    totalAmount,
                    orderItems: {
                        create: orderItemsData
                    }
                },
                include: { orderItems: true }
            });
            // Descontar stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } }
                });
            }
            return order;
        });
        res.status(201).json({ message: 'Pedido creado exitosamente', order: newOrder });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creando pedido', error });
    }
};
export const getOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        const orders = await prisma.order.findMany({
            where: role === 'ADMIN' ? undefined : { clientId: userId },
            include: {
                client: { select: { name: true, email: true } },
                orderItems: {
                    include: { product: { select: { name: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error obteniendo pedidos', error });
    }
};
export const getOrderById = async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.user?.id;
        const role = req.user?.role;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                client: { select: { name: true, email: true } },
                orderItems: {
                    include: { product: true }
                }
            }
        });
        if (!order) {
            res.status(404).json({ message: 'Pedido no encontrado' });
            return;
        }
        if (role !== 'ADMIN' && order.clientId !== userId) {
            res.status(403).json({ message: 'No tienes permiso para ver este pedido' });
            return;
        }
        res.status(200).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Error obteniendo pedido', error });
    }
};
export const updateOrderStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
            res.status(400).json({ message: 'Estado inválido' });
            return;
        }
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
        });
        res.status(200).json({ message: 'Estado del pedido actualizado', order: updatedOrder });
    }
    catch (error) {
        res.status(500).json({ message: 'Error actualizando estado', error });
    }
};
