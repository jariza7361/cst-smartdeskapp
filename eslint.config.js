import js from '@eslint/js';
import globals from 'globals';

export default [
  // Ignore build/output and reports
  { ignores: ['node_modules/**', 'dist/**', '.vercel/**', 'playwright-report/**', 'test-results/**'] },

  // Base language options (ESM, browser+node globals)
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    }
  },

  // Recommended rules
  js.configs.recommended,

  // Project rules
  {
    rules: {
      'no-undef': 'error',
      'no-implied-eval': 'error',
      'no-alert': 'error'
    }
  },

  // E2E: forbid Vitest/Jest/standalone expect imports
  {
    files: ['e2e/**/*.{js,ts}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: ['vitest', '@jest/globals', 'expect', '@vitest/expect']
      }]
    }
  }
];
