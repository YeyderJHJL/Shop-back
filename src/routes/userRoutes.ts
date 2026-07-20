import { Router } from 'express';
import { getProfile, getAllUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateJWT, authorizeRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJWT);

router.get('/profile', getProfile);
router.put('/:id', updateUser);

// Rutas exclusivas para ADMIN
router.get('/', authorizeRole(['ADMIN']), getAllUsers);
router.delete('/:id', authorizeRole(['ADMIN']), deleteUser);

export default router;
