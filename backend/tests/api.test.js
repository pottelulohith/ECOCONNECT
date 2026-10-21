import request from 'supertest';
import app from '../src/app.js';

describe('EcoConnect API Health & Public Routes', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('EcoConnect API');
  });

  it('GET /api/unknown-route should return 404', async () => {
    const res = await request(app).get('/api/some-undefined-endpoint');
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login with missing credentials should return 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
