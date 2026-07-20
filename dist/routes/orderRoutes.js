import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware.js';
const router = Router();
// Todas las rutas de pedidos requieren estar autenticado
router.use(authenticateJWT);
// Rutas para todos los usuarios (Clientes y Admins)
/**
 * @openapi
 * /api/orders:
 *   post:
 *     summary: Crear un nuevo pedido
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *     responses:
 *       201:
 *         description: Pedido creado
 */
router.post('/', createOrder);
/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Listar pedidos (Cliente ve los suyos, Admin ve todos)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
router.get('/', getOrders);
/**
 * @openapi
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener detalle de un pedido
 *     tags: [Orders]
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
 *         description: Detalle del pedido
 */
router.get('/:id', getOrderById);
// Rutas exclusivas para ADMIN
/**
 * @openapi
 * /api/orders/{id}/status:
 *   put:
 *     summary: Actualizar estado de un pedido (Solo Admin)
 *     tags: [Orders]
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
 *               status:
 *                 type: string
 *                 enum: [PENDING, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.put('/:id/status', authorizeRole(['ADMIN']), updateOrderStatus);
export default router;
