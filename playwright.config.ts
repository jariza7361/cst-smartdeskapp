import { defineConfig } from '@playwright/test';
export default defineConfig({
  webServer: {
    command: 'npm run serve',
    port: 4173,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI
  },
  use: { headless: true }
});
