import { describe, it, expect } from 'vitest';
import handler from '../copilot.js';

function mockReqRes(body) {
  const req = new (class {
    method = 'POST';
    on(ev, cb) {
      if (ev === 'data') {
        cb(JSON.stringify(body));
      }
      if (ev === 'end') {
        setTimeout(cb, 0);
      }
    }
  })();
  const res = {
    statusCode: 0,
    jsonPayload: null,
    status(c) {
      this.statusCode = c;
      return this;
    },
    json(o) {
      this.jsonPayload = o;
      return this;
    },
  };
  return { req, res };
}

describe('local copilot (no key)', () => {
  it('returns EN/ES text when no OPENAI_API_KEY', async () => {
    const { req, res } = mockReqRes({ prompt: 'serve solve sell and ask for confirmation' });
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toHaveProperty('en');
    expect(res.jsonPayload).toHaveProperty('es');
  });
});
