import { describe, it, expect, beforeEach } from 'vitest';
import handler from '../fetch.js';

function makeRes() {
  const result = { status: 0, body: null };
  return {
    status(code) {
      result.status = code;
      return this;
    },
    json(body) {
      result.body = body;
    },
    setHeader() {},
    get _() {
      return result;
    },
  };
}

describe('GET /api/fetch', () => {
  beforeEach(() => {
    delete process.env.TOS_URL;
  });

  it('returns normalized payload when TOS_URL is unset', async () => {
    const req = { method: 'GET' };
    const res = makeRes();
    await handler(req, res);
    expect(res._.status).toBe(200);
    expect(res._.body.ok).toBe(true);
    expect(res._.body).toHaveProperty('carrier');
    expect(res._.body).toHaveProperty('normalized');
  });

  it('rejects non-GET methods', async () => {
    const req = { method: 'POST' };
    const res = makeRes();
    await handler(req, res);
    expect(res._.status).toBe(405);
  });
});
