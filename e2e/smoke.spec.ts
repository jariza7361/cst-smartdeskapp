import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4173/index.html');
});

test('loads app and status panel', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'CST SmartDesk' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'System Status' })).toBeVisible();
});

test('highlights section toggles language', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Highlights' })).toBeVisible();
  await page.getByRole('button', { name: 'Language' }).click();
  await expect(page.getByRole('heading', { name: 'Aspectos destacados' })).toBeVisible();
});
