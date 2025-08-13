import test from 'node:test';
import assert from 'node:assert/strict';
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
  assert.equal(res.statusCode, 405);
  assert.deepEqual(res.body, { ok: false, error: 'Method not allowed' });
});

test('POST returns 200 with { ok:true, queued:true }', async () => {
  const req = { method: 'POST' };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true, queued: true });
});
