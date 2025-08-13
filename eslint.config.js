import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules", "dist", ".vercel", "playwright-report", "test-results"],
  },
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  {
    rules: {
      "no-undef": "error",
      "no-implied-eval": "error",
      "no-alert": "error"
    }
  },
  {
    files: ['e2e/**/*.{js,ts}'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: ['vitest', '@jest/globals', 'expect', '@vitest/expect']
      }]
    }
  }
];
