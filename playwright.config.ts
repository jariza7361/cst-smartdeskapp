import { defineConfig, devices } from '@playwright/test';

const SKIP_WEBSERVER = process.env.PW_SKIP_WEBSERVER === '1';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,

  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  ...(SKIP_WEBSERVER
    ? {}
    : {
        webServer: {
          command: 'npm run dev',
          url: 'http://127.0.0.1:5174',
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
});
