import { test, expect } from 'vitest';
import handler from '../enqueue.js';

function createMockRes() {
  return {
    statusCode: 0,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('GET returns 405 with { ok:false }', async () => {
  const req = { method: 'GET' };
  const res = createMockRes();
  await handler(req, res);
  expect(res.statusCode).toBe(405);
  expect(res.body).toEqual({ ok: false, error: 'Method not allowed' });
});

test('POST returns 200 with { ok:true, queued:true }', async () => {
  const req = { method: 'POST' };
  const res = createMockRes();
  await handler(req, res);
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ ok: true, queued: true });
});
