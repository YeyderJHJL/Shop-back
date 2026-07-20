import { Router } from 'express';
import { createOffer, getOffers, updateOffer, deleteOffer } from '../controllers/offerController.js';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware.js';
const router = Router();
// Rutas públicas
/**
 * @openapi
 * /api/offers:
 *   get:
 *     summary: Obtener lista de ofertas activas
 *     tags: [Offers]
 *     responses:
 *       200:
 *         description: Lista de ofertas
 */
router.get('/', getOffers);
// Rutas exclusivas para ADMIN
/**
 * @openapi
 * /api/offers:
 *   post:
 *     summary: Crear una oferta (Solo Admin)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               discountPercentage:
 *                 type: number
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Oferta creada
 */
router.post('/', authenticateJWT, authorizeRole(['ADMIN']), createOffer);
/**
 * @openapi
 * /api/offers/{id}:
 *   put:
 *     summary: Modificar una oferta (Solo Admin)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               discountPercentage:
 *                 type: number
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Oferta actualizada
 */
router.put('/:id', authenticateJWT, authorizeRole(['ADMIN']), updateOffer);
/**
 * @openapi
 * /api/offers/{id}:
 *   delete:
 *     summary: Eliminar una oferta (Solo Admin)
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Oferta eliminada
 */
router.delete('/:id', authenticateJWT, authorizeRole(['ADMIN']), deleteOffer);
export default router;
