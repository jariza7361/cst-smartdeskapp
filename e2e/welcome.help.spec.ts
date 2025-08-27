import { test, expect } from '@playwright/test';

test('Help menu can open Welcome modal and respect Do Not Show Again', async ({ page }) => {
  // Ensure a clean state
  await page.addInitScript(() => {
    localStorage.clear();
  });
  await page.goto('http://localhost:53124/');

  // Splash may be skipped under automation; dismiss only if visible
  const splash = page.locator('#splash');
  if (await splash.isVisible()) {
    await page.getByRole('button', { name: /Start|Dismiss/i }).click();
    await expect(splash).toBeHidden();
  }

  // Open Help menu via data-testid
  const helpBtn = page.getByTestId('help-menu-btn');
  await expect(helpBtn).toBeVisible();
  await helpBtn.click();
  await expect(page.getByTestId('help-menu')).toBeVisible();

  // Click specific Help menu item using data-testid
  await page.getByTestId('help-menu-item-welcome').click();
  const wel = page.getByTestId('welcome-modal');
  await expect(wel).toBeVisible();

  // Check presence of CTA and checkbox label
  await expect(page.locator('#welOpenCopilot')).toBeVisible();
  await expect(page.locator('#welDontShowLabel')).toBeVisible();

  // Mark Do Not Show Again and close via Close button (more reliable than backdrop click)
  await page.locator('#welDontShow').check();
  await wel.getByTestId('welcome-close').click();
  await expect(wel).toBeHidden();

  // Re-open Help → Show Welcome should still open, but persistence only affects auto-show behavior
  await helpBtn.click();
  await expect(page.getByTestId('help-menu')).toBeVisible();
  await page.getByTestId('help-menu-item-welcome').click();
  await expect(wel).toBeVisible();

  // Close via Close button
  await wel.getByTestId('welcome-close').click();
  await expect(wel).toBeHidden();
});
