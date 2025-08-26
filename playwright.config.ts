import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'e2e',
  timeout: 30000,
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.005 } },
  webServer: {
  command: 'npm run -s build && npm run -s preview',
  port: 53124,
  timeout: 60000,
  reuseExistingServer: true,
  },
  use: {
    headless: true,
    viewport: { width: 1280, height: 900 },
    colorScheme: 'dark',
    locale: 'en-US',
    timezoneId: 'America/New_York',
  baseURL: 'http://localhost:53124',
  },
});
