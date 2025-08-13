import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  webServer: {
    command: 'npm run serve',
    port: 4173,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
  },
  use: { headless: true },
});
