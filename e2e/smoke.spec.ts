import { test, expect } from '@playwright/test';

test('home loads + title ok', async ({ page }) => {
  // Change this URL if your dev server runs on a different port
  await page.goto('/');
  await expect(page).toHaveTitle(/CST SmartDesk/i);
  // quick DOM sanity for required IDs
  for (const id of ['system-status','panels','ingest','setup-wizard','tests-modal','btn-fetch-verizon']) {
    await expect(page.locator('#' + id)).toHaveCount(1);
  }
});
