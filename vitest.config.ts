import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{js,ts}', 'api/**/__tests__/**/*.{test,spec}.{js,ts}'],
    environment: 'node',
  },
});
