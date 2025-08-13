import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Pick up unit tests in both locations; keep E2E out of Vitest.
    include: ['tests/**/*.{test,spec}.{js,ts}', 'api/**/__tests__/**/*.{test,spec}.{js,ts}'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    environment: 'node'
  }
});
