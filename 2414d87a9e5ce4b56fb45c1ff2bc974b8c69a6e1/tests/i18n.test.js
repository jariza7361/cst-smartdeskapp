// tests/i18n.test.js
import { readFileSync } from 'node:fs';
import { describe, test, expect } from 'vitest';

function loadJSON(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

describe('i18n scaffolding', () => {
  test('en and es have matching keys', () => {
    const en = loadJSON('src/public/i18n/en.json');
    const es = loadJSON('src/public/i18n/es.json');
    const enKeys = Object.keys(en).sort();
    const esKeys = Object.keys(es).sort();
    expect(esKeys).toEqual(enKeys);
  });
});
