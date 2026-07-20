import { prisma } from '../config/prisma.js';
export const getDashboardMetrics = async (req, res) => {
    try {
        // 1. Total de ingresos (solo pedidos completados)
        const completedOrders = await prisma.order.findMany({
            where: { status: 'COMPLETED' },
            select: { totalAmount: true },
        });
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        // 2. Total de pedidos
        const totalOrders = await prisma.order.count();
        // 3. Productos con menos stock (Top 5 con menos stock, ideal para reponer)
        const lowStockProducts = await prisma.product.findMany({
            orderBy: { stock: 'asc' },
            take: 5,
            select: { id: true, name: true, stock: true },
        });
        // 4. Productos con más stock (Top 5 con más stock, ideal para crear ofertas)
        const highStockProducts = await prisma.product.findMany({
            orderBy: { stock: 'desc' },
            take: 5,
            select: { id: true, name: true, stock: true, originalPrice: true, currentPrice: true },
        });
        // 5. Productos más vendidos
        // Agrupamos los orderItems por productId
        const mostSold = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5,
        });
        // Necesitamos obtener los nombres de esos productos
        const topSellingProducts = await Promise.all(mostSold.map(async (item) => {
            const product = await prisma.product.findUnique({
                where: { id: item.productId },
                select: { name: true },
            });
            return {
                productId: item.productId,
                name: product?.name || 'Producto Desconocido',
                totalSold: item._sum.quantity,
            };
        }));
        res.status(200).json({
            totalRevenue,
            totalOrders,
            lowStockProducts,
            highStockProducts,
            topSellingProducts,
        });
    }
    catch (error) {
        console.error('Error obteniendo métricas del dashboard:', error);
        res.status(500).json({ message: 'Error interno obteniendo métricas' });
    }
};
