import { Router } from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Obtener lista de todos los productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get('/', getProducts);

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Obtener detalle de un producto
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del producto
 */
router.get('/:id', getProductById);

// Rutas exclusivas para ADMIN
/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto (Solo Admin)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               originalPrice:
 *                 type: number
 *               currentPrice:
 *                 type: number
 *               stock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post('/', authenticateJWT, authorizeRole(['ADMIN']), createProduct);
router.put('/:id', authenticateJWT, authorizeRole(['ADMIN']), updateProduct);
router.delete('/:id', authenticateJWT, authorizeRole(['ADMIN']), deleteProduct);

export default router;
