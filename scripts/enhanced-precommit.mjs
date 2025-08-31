#!/usr/bin/env node

/**
 * Pre-commit hook to ensure CSS files are properly linked
 * This prevents breaking the UI when CSS files are moved or deleted
 */

import { execSync } from 'child_process';

console.log('🔧 Running pre-commit validations...\n');

const checks = [
  {
    name: 'CSS Links Validation',
    command: 'node scripts/validate-css-links.mjs',
    description: 'Ensuring all CSS files referenced in HTML exist'
  },
  {
    name: 'HTML Validation',
    command: 'npx html-validate index.html',
    description: 'Validating HTML structure and accessibility'
  },
  {
    name: 'ESLint',
    command: 'npm run lint',
    description: 'Checking JavaScript code quality'
  }
];

let allPassed = true;

for (const check of checks) {
  console.log(`⏳ ${check.description}...`);
  
  try {
    execSync(check.command, { stdio: 'pipe' });
    console.log(`✅ ${check.name} passed\n`);
  } catch (error) {
    console.error(`❌ ${check.name} failed:`);
    console.error(error.stdout?.toString() || error.message);
    console.error('');
    allPassed = false;
  }
}

if (allPassed) {
  console.log('🎉 All pre-commit checks passed!');
  process.exit(0);
} else {
  console.error('💥 Some pre-commit checks failed. Please fix the issues above.');
  process.exit(1);
}
