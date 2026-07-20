import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export const createOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, discountPercentage, endDate } = req.body;

    if (!productId || discountPercentage === undefined || !endDate) {
      res.status(400).json({ message: 'Faltan datos requeridos' });
      return;
    }

    const newOffer = await prisma.offer.create({
      data: {
        productId,
        discountPercentage: Number(discountPercentage),
        endDate: new Date(endDate),
      },
      include: { product: true }
    });

    res.status(201).json({ message: 'Oferta creada', offer: newOffer });
  } catch (error) {
    res.status(500).json({ message: 'Error creando oferta', error });
  }
};

export const getOffers = async (req: Request, res: Response): Promise<void> => {
  try {
    const offers = await prisma.offer.findMany({
      include: {
        product: true
      }
    });
    res.status(200).json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo ofertas', error });
  }
};

export const updateOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { discountPercentage, endDate } = req.body;

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    res.status(200).json({ message: 'Oferta actualizada', offer: updatedOffer });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando oferta', error });
  }
};

export const deleteOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.offer.delete({ where: { id } });
    res.status(200).json({ message: 'Oferta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando oferta', error });
  }
};
