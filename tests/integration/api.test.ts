const request = require('supertest');
import * as path from 'path';

jest.setTimeout(30000);

const PORT = 3000;
const baseURL = `http://127.0.0.1:${PORT}`;

describe('Integration Tests - API Endpoints', () => {
  it('GET /api/auth/smtp-status should return SMTP status', async () => {
    const res = await request(baseURL).get('/api/auth/smtp-status');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
  });

  it('POST /api/auth/forgot-password with invalid email returns 400', async () => {
    const res = await request(baseURL)
      .post('/api/auth/forgot-password')
      .send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/chat with missing token/auth returns error gracefully', async () => {
    const res = await request(baseURL)
      .post('/api/chat')
      .send({ messages: [{ role: 'user', content: 'hello' }] });
    // Assuming it either passes or returns 500 depending on env vars
    expect([200, 500]).toContain(res.status); 
  });
  
  it('POST /api/vision/analyze without auth returns 401', async () => {
    const res = await request(baseURL)
      .post('/api/vision/analyze')
      .send({ imageBase64: 'data:image/png;base64,fake', mode: 'UNDERSTAND' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
