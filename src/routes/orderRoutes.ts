import { Router } from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de pedidos requieren estar autenticado
router.use(authenticateJWT);

// Rutas para todos los usuarios (Clientes y Admins)
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

// Rutas exclusivas para ADMIN
router.put('/:id/status', authorizeRole(['ADMIN']), updateOrderStatus);

export default router;
