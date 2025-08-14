import { readFileSync } from 'node:fs';
import { test, expect } from 'vitest';

test('index.html seeds a default copilot option', () => {
  const html = readFileSync('index.html', 'utf8');
  expect(html).toMatch(
    /<select[^>]*id=["']copilotSample["'][\s\S]*?<option[^>]*value=["']serve_solve_sell["']/,
  );
});
