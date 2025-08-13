import { test, expect } from '@playwright/test';
const url = 'http://localhost:4173/index.html';

test('home page title and script path', async ({ page }) => {
  await page.goto(url);
  await expect(page).toHaveTitle('CST SmartDesk — Escalation Toolkit');
  const scriptSrc = await page.getAttribute('script[src]', 'src');
  expect(scriptSrc).toBe('/app.js');
});
