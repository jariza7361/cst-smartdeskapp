import { test, expect } from '@playwright/test';

test('hello world feature', async ({ page }) => {
  await page.goto('http://localhost:3000'); // Adjust the URL as needed
  const helloWorldElement = await page.locator('text=Hello World');
  await expect(helloWorldElement).toBeVisible();
});
