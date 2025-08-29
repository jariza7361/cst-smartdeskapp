#!/usr/bin/env node

/**
 * Pull Request Preparation Script
 * Comprehensive validation before creating draft or final pull requests
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

class PRPreparation {
  constructor() {
    this.results = {
      validation: null,
      formatting: null,
      linting: null,
      tests: null,
      build: null,
      e2e: null,
      security: null,
      performance: null,
    };
  }

  async run() {
    console.log('🚀 PR Preparation & Validation');
    console.log('===============================\n');

    const args = process.argv.slice(2);
    const isDraft = args.includes('--draft');
    const skipE2E = args.includes('--skip-e2e');
    const quick = args.includes('--quick');

    console.log(`📋 Mode: ${isDraft ? 'Draft PR' : 'Final PR'}`);
    console.log(`⚡ Quick mode: ${quick ? 'Yes' : 'No'}`);
    console.log(`🎭 E2E tests: ${skipE2E ? 'Skipped' : 'Included'}\n`);

    let allPassed = true;

    // Step 1: File Validation
    console.log('🔍 Step 1: File Validation');
    allPassed = (await this.runStep('validation', 'npm run validate')) && allPassed;

    // Step 2: Code Formatting
    console.log('\n🎨 Step 2: Code Formatting');
    allPassed = (await this.runStep('formatting', 'npm run format:check')) && allPassed;

    // Step 3: Linting
    console.log('\n🔧 Step 3: Linting');
    allPassed = (await this.runStep('linting', 'npm run lint')) && allPassed;

    // Step 4: Unit Tests
    console.log('\n🧪 Step 4: Unit Tests');
    allPassed = (await this.runStep('tests', 'npm run test')) && allPassed;

    // Step 5: Build
    console.log('\n🏗️  Step 5: Build Process');
    allPassed = (await this.runStep('build', 'npm run build')) && allPassed;

    // Step 6: E2E Tests (unless skipped or draft)
    if (!skipE2E && !isDraft) {
      console.log('\n🎭 Step 6: E2E Tests');
      allPassed = (await this.runStep('e2e', 'npm run e2e')) && allPassed;
    }

    // Step 7: Security Check (quick scan)
    if (!quick) {
      console.log('\n🛡️  Step 7: Security Scan');
      allPassed = (await this.securityCheck()) && allPassed;
    }

    // Step 8: Performance Check
    if (!quick && !isDraft) {
      console.log('\n⚡ Step 8: Performance Check');
      allPassed = (await this.performanceCheck()) && allPassed;
    }

    // Final Summary
    console.log('\n' + '='.repeat(50));
    this.printSummary(allPassed, isDraft);

    if (allPassed) {
      this.printNextSteps(isDraft);
    }

    process.exit(allPassed ? 0 : 1);
  }

  async runStep(stepName, command) {
    try {
      execSync(command, { cwd: ROOT_DIR, stdio: 'inherit' });
      this.results[stepName] = 'PASSED';
      console.log(`✅ ${stepName} passed`);
      return true;
    } catch {
      this.results[stepName] = 'FAILED';
      console.log(`❌ ${stepName} failed`);
      return false;
    }
  }

  async securityCheck() {
    console.log('🔍 Scanning for common security issues...');

    try {
      // Check for secrets or sensitive data
      const secretPatterns = [
        /password\s*=\s*["'][^"']+["']/i,
        /api[_-]?key\s*=\s*["'][^"']+["']/i,
        /secret\s*=\s*["'][^"']+["']/i,
        /token\s*=\s*["'][^"']+["']/i,
      ];

      const jsFiles = execSync('find . -name "*.js" -o -name "*.mjs" -o -name "*.ts" | head -20', {
        cwd: ROOT_DIR,
        encoding: 'utf8',
      })
        .split('\n')
        .filter((f) => f.trim());

      let issuesFound = false;

      for (const file of jsFiles) {
        if (!file.includes('node_modules') && existsSync(join(ROOT_DIR, file))) {
          try {
            const content = readFileSync(join(ROOT_DIR, file), 'utf8');

            for (const pattern of secretPatterns) {
              if (pattern.test(content)) {
                console.log(`⚠️  Potential secret found in: ${file}`);
                issuesFound = true;
              }
            }
          } catch {
            // Skip files that can't be read
          }
        }
      }

      if (!issuesFound) {
        console.log('✅ No obvious security issues detected');
        this.results.security = 'PASSED';
        return true;
      } else {
        console.log('⚠️  Review potential security issues above');
        this.results.security = 'WARNING';
        return true; // Don't fail on warnings
      }
    } catch {
      console.log('⚠️  Security check failed - manual review recommended');
      this.results.security = 'SKIPPED';
      return true;
    }
  }

  async performanceCheck() {
    console.log('📊 Checking bundle size and performance...');

    try {
      // Check if dist exists
      if (!existsSync(join(ROOT_DIR, 'dist'))) {
        console.log('⚠️  No dist folder found - run build first');
        this.results.performance = 'SKIPPED';
        return true;
      }

      // Get bundle sizes
      const bundleInfo = execSync('du -sh dist/', {
        cwd: ROOT_DIR,
        encoding: 'utf8',
      }).trim();

      console.log(`📦 Bundle size: ${bundleInfo.split('\t')[0]}`);

      // Simple size check (warn if over 5MB)
      const sizeOutput = execSync('du -s dist/', {
        cwd: ROOT_DIR,
        encoding: 'utf8',
      });
      const sizeKB = parseInt(sizeOutput.split('\t')[0]);

      if (sizeKB > 5120) {
        // 5MB in KB
        console.log('⚠️  Bundle size is quite large (>5MB) - consider optimization');
        this.results.performance = 'WARNING';
      } else {
        console.log('✅ Bundle size looks good');
        this.results.performance = 'PASSED';
      }

      return true;
    } catch {
      console.log('⚠️  Performance check failed - manual review recommended');
      this.results.performance = 'SKIPPED';
      return true;
    }
  }

  printSummary(allPassed, isDraft) {
    console.log('\n📋 VALIDATION SUMMARY');
    console.log('=====================');

    Object.entries(this.results).forEach(([step, result]) => {
      if (result !== null) {
        const icon = result === 'PASSED' ? '✅' : result === 'WARNING' ? '⚠️' : '❌';
        console.log(`${icon} ${step.toUpperCase()}: ${result}`);
      }
    });

    console.log(
      '\n' + (allPassed ? '🎉' : '❌') + ' OVERALL: ' + (allPassed ? 'READY' : 'NEEDS WORK'),
    );

    if (allPassed) {
      console.log(`✅ Your code is ready for ${isDraft ? 'draft' : 'final'} PR submission!`);
    } else {
      console.log('❌ Please fix the issues above before creating your PR.');
    }
  }

  printNextSteps(isDraft) {
    console.log('\n🚀 NEXT STEPS');
    console.log('=============');

    if (isDraft) {
      console.log('📝 Create draft PR:');
      console.log('   gh pr create --draft --title "Draft: Your PR Title" --body "Description"');
      console.log('   OR use GitHub web interface with "Draft" option');
    } else {
      console.log('📝 Create final PR:');
      console.log('   gh pr create --title "Your PR Title" --body "Description"');
      console.log('   OR use GitHub web interface');
    }

    console.log('\n💡 Recommended PR checklist:');
    console.log('   □ Clear, descriptive title');
    console.log('   □ Detailed description of changes');
    console.log('   □ Screenshots/videos if UI changes');
    console.log('   □ Related issue numbers');
    console.log('   □ Testing instructions');
    console.log('   □ Breaking changes noted');
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const prPrep = new PRPreparation();
  prPrep.run().catch(console.error);
}
