import { test, expect } from '@playwright/test';

const url = '/';

test.skip('copilot generates and copies', async ({ page, context }) => {
  // grant clipboard permissions for this origin
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: 'http://127.0.0.1:5174',
  });
  // Register API route before navigation to catch any early calls
  await page.route('**/api/copilot', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ en: 'OK EN', es: 'OK ES' }),
    });
  });
  // Ensure both language columns are visible in tests
  await page.addInitScript(() => {
    try {
      localStorage.setItem('cst_output_mode', 'both');
      localStorage.setItem('cst_bilingual', '1');
      localStorage.setItem('welcomeSeen', '1');
      localStorage.setItem('onboarded', '1');
    } catch {
      /* noop */
    }
  });
  await page.goto(url);
  // Wait for copilot UI to render
  await page.getByTestId('copilot-run').waitFor({ state: 'visible' });
  await page.locator('#app, .content').first().scrollIntoViewIfNeeded();
  await page.selectOption('[data-testid="copilot-sample"]', { index: 0 });
  await page.fill('[data-testid="copilot-input"]', 'hi');
  await page.getByTestId('copilot-run').click();
  await expect(page.getByTestId('copilot-en')).toHaveText('OK EN');
  await expect(page.getByTestId('copilot-es')).toHaveText('OK ES');
  await page.getByTestId('copilot-copy-en').click();
  const clipEn = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipEn).toBe('OK EN');
  await page.getByTestId('copilot-copy-es').waitFor({ state: 'visible' });
  await page.getByTestId('copilot-copy-es').click();
  const clipEs = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipEs).toBe('OK ES');
});
