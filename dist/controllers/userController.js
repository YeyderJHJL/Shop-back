import { prisma } from '../config/prisma.js';
export const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        if (!user) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error obteniendo perfil', error });
    }
};
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Error obteniendo usuarios', error });
    }
};
export const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, email } = req.body;
        // Un usuario normal solo puede actualizarse a sí mismo
        if (req.user?.role !== 'ADMIN' && req.user?.id !== id) {
            res.status(403).json({ message: 'No tienes permiso para actualizar este usuario' });
            return;
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email },
            select: { id: true, email: true, name: true, role: true },
        });
        res.status(200).json({ message: 'Usuario actualizado', user: updatedUser });
    }
    catch (error) {
        res.status(500).json({ message: 'Error actualizando usuario', error });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.user.delete({ where: { id } });
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error eliminando usuario', error });
    }
};
