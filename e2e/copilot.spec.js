import { test, expect } from '@playwright/test';

const url = 'http://127.0.0.1:53124/';

test('copilot generates and copies', async ({ page, context }) => {
  // grant clipboard permissions for this origin
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
  origin: 'http://127.0.0.1:53124',
  });
  await page.route('**/api/copilot', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ en: 'OK EN', es: 'OK ES' }),
    });
  });
  await page.goto(url);
  await page.selectOption('#copilotSample', { index: 0 });
  await page.fill('#copilotInput', 'hi');
  await page.click('#copilotRun');
  await expect(page.locator('#copilotEn')).toHaveText('OK EN');
  await expect(page.locator('#copilotEs')).toHaveText('OK ES');
  await page.click('#copilotCopyEn');
  const clipEn = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipEn).toBe('OK EN');
  await page.click('#copilotCopyEs');
  const clipEs = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipEs).toBe('OK ES');
});
