import { test, expect } from '@playwright/test';

test('app loads core shells', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CST SmartDesk/i);

  // core containers should exist
  await expect(page.locator('#app')).toHaveCount(1);
  await expect(page.locator('#setup-wizard')).toHaveCount(1);
});
