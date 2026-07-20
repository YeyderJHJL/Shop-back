import { Router } from 'express';
import { getProfile, getAllUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware.js';
const router = Router();
// Todas las rutas requieren autenticación
router.use(authenticateJWT);
/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     summary: Obtener el perfil del usuario actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 */
router.get('/profile', getProfile);
/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     tags: [Users]
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/:id', updateUser);
// Rutas exclusivas para ADMIN
/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Listar todos los usuarios (Solo Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/', authorizeRole(['ADMIN']), getAllUsers);
/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (Solo Admin)
 *     tags: [Users]
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
 *         description: Usuario eliminado
 */
router.delete('/:id', authorizeRole(['ADMIN']), deleteUser);
export default router;
