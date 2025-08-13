import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test, expect } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadLocale(name) {
  const file = path.join(__dirname, '..', 'locales', `${name}.json`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

test('locales have same keys', () => {
  const en = loadLocale('en');
  const es = loadLocale('es');
  expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
});
