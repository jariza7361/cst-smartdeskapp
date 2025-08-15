import { test, expect } from '@playwright/test';
test('copilot generates and copies', async ({ page }) => {
  const url = process.env.CI ? 'http://127.0.0.1:4173/' : 'http://localhost:4173/';
  await page.goto(url);
  await expect(page.locator('#copilotSample option').first()).toBeVisible();

  await page.selectOption('#copilotSample', { index: 0 });
  await page.fill('#copilotInput', 'Customer needs resolution; add steps and ask for confirmation.');
  await page.click('#copilotRun');

  await expect(page.locator('#copilotEn')).toBeVisible();
});
