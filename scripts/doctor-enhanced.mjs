#!/usr/bin/env node

/**
 * Enhanced doctor script with corruption detection
 * Extends the existing doctor functionality with file validation
 */

import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Import the existing doctor script
const doctorScript = join(ROOT_DIR, 'doctor.mjs');

async function runCorruptionCheck() {
  console.log('🔍 Running corruption detection...');

  try {
    execSync('node scripts/pre-commit-check.mjs', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
    console.log('✅ No file corruption detected');
    return true;
  } catch {
    console.error('❌ File corruption detected - see errors above');
    return false;
  }
}

async function runFormatCheck() {
  console.log('🎨 Checking code formatting...');

  try {
    execSync('npm run format:check', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
    console.log('✅ Code formatting is correct');
    return true;
  } catch {
    console.error('❌ Code formatting issues detected');
    console.log('💡 Run "npm run format" to fix formatting issues');
    return false;
  }
}

async function runLintCheck() {
  console.log('🔧 Running linting checks...');

  try {
    execSync('npm run lint', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    });
    console.log('✅ No linting issues detected');
    return true;
  } catch {
    console.error('❌ Linting issues detected');
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const writeMode = args.includes('--write');
  const skipValidation = args.includes('--skip-validation');

  console.log('🏥 Enhanced Doctor Script');
  console.log('========================');

  let allPassed = true;

  // Run original doctor script if it exists
  if (existsSync(doctorScript)) {
    console.log('🏥 Running original doctor checks...');
    try {
      execSync(`node ${doctorScript} ${args.join(' ')}`, {
        cwd: ROOT_DIR,
        stdio: 'inherit',
      });
      console.log('✅ Original doctor checks passed');
    } catch {
      console.error('❌ Original doctor checks failed');
      allPassed = false;
    }
    console.log('');
  }

  if (!skipValidation) {
    // Run enhanced validation checks
    const corruptionPassed = await runCorruptionCheck();
    console.log('');

    const formatPassed = await runFormatCheck();
    console.log('');

    const lintPassed = await runLintCheck();
    console.log('');

    allPassed = allPassed && corruptionPassed && formatPassed && lintPassed;
  }

  if (allPassed) {
    console.log('🎉 All health checks passed!');
    console.log('✅ Repository is healthy and ready for deployment');
  } else {
    console.log('❌ Some health checks failed');
    console.log('🔧 Please address the issues above before proceeding');

    if (writeMode) {
      console.log('');
      console.log('🔧 Auto-fixing formatting issues...');
      try {
        execSync('npm run format', { cwd: ROOT_DIR, stdio: 'inherit' });
        console.log('✅ Formatting issues fixed');
      } catch {
        console.error('❌ Could not auto-fix formatting issues');
      }
    }
  }

  process.exit(allPassed ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
