import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4173/index.html');
});

test('loads stub app message', async ({ page }) => {
  await expect(page.locator('#app')).toHaveText('CST SmartDesk is up ✅');
});
