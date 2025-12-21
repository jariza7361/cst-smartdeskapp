import { test, expect } from '@playwright/test';
test('home page title and script path', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle('CST SmartDesk — Escalation Toolkit');
  const wizard = page.locator('#setup-wizard');
  if (await wizard.isVisible()) {
    await page.keyboard.press('Escape');
    await expect(wizard).toBeHidden();
  }
  const appScript = page.locator('script[src="/app.js"]');
  await expect(appScript).toHaveCount(1);
});
