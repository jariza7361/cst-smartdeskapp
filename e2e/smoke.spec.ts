import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('loads app and dashboard', async ({ page }) => {
  await expect(page.locator('header.topbar h1', { hasText: 'CST SmartDesk' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My Toolkit', exact: true })).toBeVisible();
  await expect(page.locator('.dashboard-card').first()).toBeVisible();
});

test('copilot workspace is visible', async ({ page }) => {
  await expect(page.locator('.copilot-workspace h2')).toBeVisible();
  await expect(page.locator('#dashboardCopilotInput')).toBeVisible();
  await expect(page.locator('#dashboardCopilotGenerate')).toBeVisible();
});
