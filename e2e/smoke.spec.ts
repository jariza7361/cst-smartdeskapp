import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:53124/');
});

test('loads app and status panel', async ({ page }) => {
  await expect(page.locator('header.topbar h1', { hasText: 'CST SmartDesk' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'System Status', exact: true })).toBeVisible();
});

test('highlights section toggles language', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Highlights', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Language' }).click();
  await expect(page.getByRole('heading', { name: 'Aspectos destacados', exact: true })).toBeVisible();
});
