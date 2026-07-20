import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middlewares/authMiddleware.js';

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, originalPrice, currentPrice, stock, expirationDate } = req.body;
    const adminId = req.user?.id;

    if (!adminId || !name || originalPrice === undefined || currentPrice === undefined || stock === undefined) {
      res.status(400).json({ message: 'Faltan datos requeridos' });
      return;
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        originalPrice: Number(originalPrice),
        currentPrice: Number(currentPrice),
        stock: Number(stock),
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        adminId,
      },
    });

    res.status(201).json({ message: 'Producto creado', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error creando producto', error });
  }
};

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        admin: { select: { name: true } },
        offers: true
      }
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo productos', error });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { offers: true }
    });

    if (!product) {
      res.status(404).json({ message: 'Producto no encontrado' });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo producto', error });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, description, originalPrice, currentPrice, stock, expirationDate } = req.body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        currentPrice: currentPrice ? Number(currentPrice) : undefined,
        stock: stock !== undefined ? Number(stock) : undefined,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      },
    });

    res.status(200).json({ message: 'Producto actualizado', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando producto', error });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando producto', error });
  }
};
