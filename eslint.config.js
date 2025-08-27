import js from '@eslint/js';
import globals from 'globals';
export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.vercel/**',
      'playwright-report/**',
      'test-results/**',
      // vendored/minified libs (lint noise)
      'libs/tesseract/**',
      'public/libs/tesseract/**',
      // exclude example subproject (typed, separate config)
      'search-next-playbooks/**',
    ],
  },
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
  },
  js.configs.recommended,
  { rules: { 'no-undef': 'error', 'no-implied-eval': 'error', 'no-alert': 'error' } },
  {
    files: ['src/app.js'],
    rules: {
      'no-unused-vars': 'warn',
      'no-alert': 'warn',
      'no-undef': 'warn',
    },
  },
  {
    files: ['e2e/**/*.{js,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: ['vitest', '@jest/globals', 'expect', '@vitest/expect'] },
      ],
    },
  },
];
