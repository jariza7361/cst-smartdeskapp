module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: ['eslint:recommended'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  rules: {
    'no-console': 'off',
    'no-undef': 'error',
    'no-implied-eval': 'error',
    'no-alert': 'error',
  },
  ignorePatterns: ['node_modules', 'dist', '.vercel'],
};
