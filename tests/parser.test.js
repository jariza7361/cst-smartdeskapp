// tests/parser.test.js
import { describe, it, expect } from 'vitest';
import { parseText } from '../public/utils/parser.js';

describe('parseText()', () => {
  it('extracts carrier, sections, and links', () => {
    const sample = `
      VERIZON Wireless Terms of Service
      Effective date: 2025-01-01
      A re-stocking fee may apply. See https://example.com/policy
      Certain actions are prohibited by policy.
    `;
    const out = parseText(sample);
    expect(out.carrier).toBe('verizon');
    expect(out.dates?.toLowerCase()).toContain('effective');
    expect(out.fees?.toLowerCase()).toContain('fee');
    expect(out.prohibited?.toLowerCase()).toContain('prohibit');
    expect(out.links).toContain('https://example.com/policy');
    expect(out.rawLength).toBeGreaterThan(20);
  });

  it('normalizes carrier names like att/tmobile', () => {
    expect(parseText('ATT policy').carrier).toBe('at&t');
    expect(parseText('TMobile notice').carrier).toBe('t-mobile');
  });

  it('returns unknown when no carrier is present', () => {
    expect(parseText('hello world').carrier).toBe('unknown');
  });
});
