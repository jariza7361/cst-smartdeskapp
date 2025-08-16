import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../public/utils/copilot.js';

describe('buildPrompt', () => {
  it('merges sample and user text', () => {
    const p = buildPrompt('sample', 'user');
    expect(p).toBe('sample\n\nuser');
  });
  it('prepends context JSON', () => {
    const ctx = { a: 1 };
    const p = buildPrompt('sample', 'user', ctx);
    expect(p.startsWith('CONTEXT_JSON=')).toBe(true);
    expect(p.includes('sample')).toBe(true);
  });
});
