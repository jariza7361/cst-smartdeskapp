import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules", "dist", ".vercel", "playwright-report", "test-results"],
  },
  {
    files: ["**/*.js"],
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
  }
];
