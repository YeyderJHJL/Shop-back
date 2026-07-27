import { Router } from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct, uploadProductImage } from '../controllers/productController.js';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

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
 *         multipart/form-data:
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
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post('/', authenticateJWT, authorizeRole(['ADMIN']), upload.single('image'), createProduct);
router.put('/:id', authenticateJWT, authorizeRole(['ADMIN']), updateProduct);
router.delete('/:id', authenticateJWT, authorizeRole(['ADMIN']), deleteProduct);

/**
 * @openapi
 * /api/products/{id}/image:
 *   post:
 *     summary: Subir o actualizar la imagen de un producto existente (Solo Admin)
 *     tags: [Products]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagen actualizada
 */
router.post('/:id/image', authenticateJWT, authorizeRole(['ADMIN']), upload.single('image'), uploadProductImage);

export default router;
