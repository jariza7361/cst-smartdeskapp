import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30_000,
  use: { baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4173' },
  webServer: {
    command: 'node scripts/dev-server.mjs',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000
  },
  testDir: 'e2e'
});

