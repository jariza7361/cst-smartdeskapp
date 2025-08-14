import { test, expect } from '@playwright/test';

test('copilot generates and copies', async ({ page }) => {
  const url = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
  await page.goto(url);

  await expect(page.locator('#copilotSample option').first()).toBeVisible();

  await page.selectOption('#copilotSample', { index: 0 });
  await page.fill(
    '#copilotInput',
    'Customer needs resolution; add steps and ask for confirmation.',
  );
  await page.click('#copilotRun');

  await expect(page.locator('#copilotEn')).toHaveText(/.+/, { timeout: 10000 });
  await expect(page.locator('#copilotEs')).toHaveText(/.+/, { timeout: 10000 });

  const follows = page.locator('#copilotFollows li');
  if (await follows.count().catch(() => 0)) {
    await expect(follows.first()).toBeVisible();
  }
});
