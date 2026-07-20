import request from 'supertest';
import { app } from '../app.js';
import { prisma } from '../config/prisma.js';
describe('Auth API', () => {
    const testUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
    };
    beforeAll(async () => {
        // Limpiar tabla de usuarios antes de las pruebas
        await prisma.user.deleteMany({ where: { email: testUser.email } });
    });
    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: testUser.email } });
        await prisma.$disconnect();
    });
    it('Debería registrar un nuevo usuario', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toBe('Usuario registrado exitosamente');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user.email).toBe(testUser.email);
    });
    it('No debería permitir registrar el mismo usuario dos veces', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(testUser);
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toBe('El correo ya está registrado');
    });
    it('Debería permitir iniciar sesión con las credenciales correctas', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toBe('Inicio de sesión exitoso');
        expect(res.body).toHaveProperty('token');
    });
    it('No debería permitir iniciar sesión con contraseña incorrecta', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'wrongpassword' });
        expect(res.statusCode).toEqual(401);
        expect(res.body.message).toBe('Credenciales inválidas');
    });
});
