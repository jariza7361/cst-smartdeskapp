import { describe, it, expect } from 'vitest';

describe('i18n scaffolding', () => {
  it('has bilingual keys in JSON (spot-check)', async () => {
    const en = JSON.parse(await Bun.file ? await Bun.file('i18n/en.json').text() : require('fs').readFileSync('i18n/en.json','utf8'));
    const es = JSON.parse(await Bun.file ? await Bun.file('i18n/es.json').text() : require('fs').readFileSync('i18n/es.json','utf8'));
    for (const k of Object.keys(en)) {
      expect(es).toHaveProperty(k);
    }
  });
});
