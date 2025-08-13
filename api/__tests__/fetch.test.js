import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../fetch.js';

function createMockRes() {
  return {
    statusCode: 0,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
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

test('non-GET returns 405 with CORS header', async () => {
  const req = { method: 'POST' };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers['access-control-allow-origin'], '*');
});

test('missing url returns 400 with CORS header', async () => {
  const req = { method: 'GET', query: {} };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.headers['access-control-allow-origin'], '*');
});

test('invalid url returns 400 with CORS header', async () => {
  const req = { method: 'GET', query: { url: 'ht!tp://bad' } };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.headers['access-control-allow-origin'], '*');
});

test('disallowed host returns 400 with CORS header', async () => {
  const req = { method: 'GET', query: { url: 'https://example.com' } };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.headers['access-control-allow-origin'], '*');
});

test('fetch failure returns 500 with CORS header', async () => {
  const req = { method: 'GET', query: { url: 'https://asurion.com' } };
  const res = createMockRes();
  const origFetch = global.fetch;
  global.fetch = () => {
    throw new Error('boom');
  };
  await handler(req, res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.headers['access-control-allow-origin'], '*');
  global.fetch = origFetch;
});
