import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4173/index.html');
});

test('loads app and status panel', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'CST SmartDesk' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'System Status' })).toBeVisible();
});
