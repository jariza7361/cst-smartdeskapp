import { test, expect, afterAll } from 'vitest';
import handler from '../api/fetch.js';

function mockRes() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(k, v) {
      this.headers[k.toLowerCase()] = v;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

const originalFetch = global.fetch;

test('allowed host returns ok true with CORS header', async () => {
  process.env.FETCH_ALLOW_HOSTS = 'allowed.com';
  global.fetch = async () => ({ ok: true, text: async () => 'data' });
  const req = { method: 'GET', url: '/api/fetch?url=https://allowed.com/x' };
  const res = mockRes();
  await handler(req, res);
  expect(res.statusCode).toBe(200);
  expect(res.body.ok).toBe(true);
  expect(res.headers['access-control-allow-origin']).toBe('*');
});

test('disallowed host returns ok false with CORS header', async () => {
  process.env.FETCH_ALLOW_HOSTS = 'allowed.com';
  const req = { method: 'GET', url: '/api/fetch?url=https://bad.com/x' };
  const res = mockRes();
  await handler(req, res);
  expect(res.statusCode).toBe(403);
  expect(res.body.ok).toBe(false);
  expect(res.headers['access-control-allow-origin']).toBe('*');
});

test('malformed URL returns ok false with CORS header', async () => {
  const req = { method: 'GET', url: '/api/fetch?url=::://bad' };
  const res = mockRes();
  await handler(req, res);
  expect(res.statusCode).toBe(400);
  expect(res.body.ok).toBe(false);
  expect(res.headers['access-control-allow-origin']).toBe('*');
});

afterAll(() => {
  global.fetch = originalFetch;
});
