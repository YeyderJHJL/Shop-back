import request from 'supertest';
import { app } from '../app.js';
describe('App API', () => {
    it('Debería retornar status ok en el endpoint /api/health', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('message', 'Backend is running');
    });
});
