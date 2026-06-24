import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from './app';

const app = createApp();

describe('Bundle API', () => {
  it('GET /api/health → ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('GET /api/bundle → validated bundle', async () => {
    const res = await request(app).get('/api/bundle');
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    expect(res.body.steps).toHaveLength(4);
  });

  it('GET /api/products/:id → product or 404', async () => {
    const ok = await request(app).get('/api/products/cam-v4');
    expect(ok.status).toBe(200);
    expect(ok.body.title).toBe('Wyze Cam v4');

    const missing = await request(app).get('/api/products/does-not-exist');
    expect(missing.status).toBe(404);
  });

  it('POST /api/quote → server-side totals match the seeded configuration', async () => {
    const res = await request(app)
      .post('/api/quote')
      .send({
        items: [
          { variantId: 'cam-v4-white', qty: 1 },
          { variantId: 'cam-pan-v3-white', qty: 2 },
          { variantId: 'motion-sensor-default', qty: 2 },
          { variantId: 'sense-hub-default', qty: 1 },
          { variantId: 'microsd-256-default', qty: 2 },
          { variantId: 'cam-unlimited-default', qty: 1 },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ activeTotal: 209.87, compareTotal: 260.79, savings: 50.92 });
  });

  it('POST /api/quote → 400 on invalid body', async () => {
    const res = await request(app)
      .post('/api/quote')
      .send({ items: [{ variantId: 5 }] });
    expect(res.status).toBe(400);
  });

  it('unknown route → 404', async () => {
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
  });
});
