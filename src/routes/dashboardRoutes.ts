import { Router } from 'express';
import { getDashboardMetrics } from '../controllers/dashboardController.js';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @openapi
 * /api/dashboard/metrics:
 *   get:
 *     summary: Obtener métricas principales para el dashboard (Solo Admin)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del dashboard obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                 totalOrders:
 *                   type: number
 *                 lowStockProducts:
 *                   type: array
 *                 highStockProducts:
 *                   type: array
 *                 topSellingProducts:
 *                   type: array
 */
router.get('/metrics', authenticateJWT, authorizeRole(['ADMIN']), getDashboardMetrics);

export default router;
