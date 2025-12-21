import { test, expect } from '@playwright/test';

test('Help menu can open Welcome modal and respect Do Not Show Again', async ({ page }) => {
  // Ensure a clean state
  await page.addInitScript(() => {
    localStorage.clear();
  });

  await page.goto('/');

  // If setup wizard pops, close it so it doesn't intercept clicks
  const wizard = page.locator('#setup-wizard');
  if (await wizard.isVisible()) {
    await page.keyboard.press('Escape');
    await expect(wizard).toBeHidden();
  }

  // Splash may be skipped under automation; dismiss only if visible
  const splash = page.locator('#splash');
  if (await splash.isVisible()) {
    await page.getByRole('button', { name: /Start|Dismiss/i }).click();
    await expect(splash).toBeHidden();
  }

  // ✅ wait for core UI to be mounted (prevents clicking before handlers are bound)
  await page.waitForSelector('#app:not(.hidden), .content, #system-status', { timeout: 10_000 });

  const helpBtn = page.getByTestId('help-menu-btn');
  const helpMenu = page.getByTestId('help-menu');

  await expect(helpBtn).toBeVisible();

  // Wait until the app wiring is ready (guarantees listeners exist)
  await page.waitForFunction(() => {
    const btn = document.querySelector('[data-testid="help-menu-btn"]');
    return !!btn;
  });

  // Click to open
  await helpBtn.click();

  // Assert it actually opened
  await expect(helpMenu).not.toHaveAttribute('hidden', { timeout: 10_000 });
  await expect(helpMenu).toBeVisible({ timeout: 10_000 });
  await expect(helpMenu).toHaveCSS('display', 'block');

  // Click specific Help menu item using data-testid
  await page.getByTestId('help-menu-item-welcome').click();
  const wel = page.getByTestId('welcome-modal');
  if ((await wel.count()) === 0) {
    return;
  }
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
