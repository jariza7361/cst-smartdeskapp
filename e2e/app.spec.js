import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexPath = path.resolve(__dirname, '..', 'index.html');

test('home page title and script path', async ({ page }) => {
  await page.goto('file://' + indexPath);
  await expect(page).toHaveTitle('CST SmartDesk — Escalation Toolkit');
  const scriptSrc = await page.getAttribute('script[src]', 'src');
  expect(scriptSrc).toBe('/app.js');
});
