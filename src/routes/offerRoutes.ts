import { Router } from 'express';
import { createOffer, getOffers, updateOffer, deleteOffer } from '../controllers/offerController.js';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Rutas públicas
router.get('/', getOffers);

// Rutas exclusivas para ADMIN
router.post('/', authenticateJWT, authorizeRole(['ADMIN']), createOffer);
router.put('/:id', authenticateJWT, authorizeRole(['ADMIN']), updateOffer);
router.delete('/:id', authenticateJWT, authorizeRole(['ADMIN']), deleteOffer);

export default router;
