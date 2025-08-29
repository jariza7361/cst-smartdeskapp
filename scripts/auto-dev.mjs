#!/usr/bin/env node
/**
 * Auto-Development Pipeline
 * Automates: build → test → deploy → validate → report
 */

import { execSync, spawn } from 'child_process';
import { createServer } from 'http';

const CONFIG = {
  port: 53124,
  previewTimeout: 5000,
  testTimeout: 30000,
  deployUrl: 'https://cst-smartdeskapp-jariza7361s-projects.vercel.app', // Update with your actual URL
};

class AutoDevPipeline {
  constructor() {
    this.results = {
      build: null,
      tests: { unit: null, e2e: null },
      preview: null,
      deployment: null,
      validation: null,
      recommendations: [],
    };
  }

  log(step, message, status = 'info') {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: '📋',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        working: '🔄',
      }[status] || '📋';

    console.log(`[${timestamp}] ${prefix} ${step}: ${message}`);
  }

  async run(commitMessage) {
    this.log('Pipeline', 'Starting auto-development pipeline...', 'working');

    try {
      // Step 1: Commit and Push
      await this.commitAndPush(commitMessage);

      // Step 2: Build
      await this.build();

      // Step 3: Run Tests
      await this.runTests();

      // Step 4: Start Preview
      await this.startPreview();

      // Step 5: Validate Functionality
      await this.validateFunctionality();

      // Step 6: Check Deployment
      await this.checkDeployment();

      // Step 7: Generate Report
      this.generateReport();
    } catch (error) {
      this.log('Pipeline', `Failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async commitAndPush(message) {
    this.log('Git', 'Committing and pushing changes...', 'working');
    try {
      execSync('git add -A', { stdio: 'inherit' });
      execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
      execSync('git push', { stdio: 'inherit' });
      this.log('Git', 'Changes committed and pushed successfully', 'success');
    } catch (error) {
      throw new Error(`Git operations failed: ${error.message}`);
    }
  }

  async build() {
    this.log('Build', 'Building application...', 'working');
    try {
      const output = execSync('npm run build', { encoding: 'utf8' });
      this.results.build = { success: true, output };
      this.log('Build', 'Build completed successfully', 'success');
    } catch (error) {
      this.results.build = { success: false, error: error.message };
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async runTests() {
    this.log('Tests', 'Running unit tests...', 'working');
    try {
      const unitOutput = execSync('npm run test', { encoding: 'utf8' });
      this.results.tests.unit = { success: true, output: unitOutput };
      this.log('Tests', 'Unit tests passed', 'success');
    } catch (error) {
      this.results.tests.unit = { success: false, error: error.message };
      this.log('Tests', 'Unit tests failed - continuing...', 'warning');
    }

    // E2E tests (non-blocking)
    this.log('Tests', 'Running E2E tests...', 'working');
    try {
      const e2eOutput = execSync('npm run e2e', { encoding: 'utf8', timeout: CONFIG.testTimeout });
      this.results.tests.e2e = { success: true, output: e2eOutput };
      this.log('Tests', 'E2E tests passed', 'success');
    } catch (error) {
      this.results.tests.e2e = { success: false, error: error.message };
      this.log('Tests', 'E2E tests failed - continuing...', 'warning');
    }
  }

  async startPreview() {
    this.log('Preview', 'Starting preview server...', 'working');
    return new Promise((resolve) => {
      const preview = spawn('npm', ['run', 'preview'], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let output = '';
      preview.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('Local:')) {
          this.results.preview = { success: true, port: CONFIG.port };
          this.log('Preview', `Server running on http://localhost:${CONFIG.port}`, 'success');
          resolve();
        }
      });

      setTimeout(() => {
        if (!this.results.preview) {
          this.results.preview = { success: false, error: 'Preview server timeout' };
          this.log('Preview', 'Server start timeout', 'warning');
          resolve();
        }
      }, CONFIG.previewTimeout);
    });
  }

  async validateFunctionality() {
    this.log('Validation', 'Validating core functionality...', 'working');

    const tests = [
      { name: 'Homepage Load', test: () => this.testPageLoad('/') },
      { name: 'Doctor API', test: () => this.testApi('/api/doctor') },
      { name: 'Search Functionality', test: () => this.testSearch() },
      { name: 'Theme System', test: () => this.testThemes() },
    ];

    const results = [];
    for (const { name, test } of tests) {
      try {
        const result = await test();
        results.push({ name, success: true, result });
        this.log('Validation', `${name} - OK`, 'success');
      } catch (error) {
        results.push({ name, success: false, error: error.message });
        this.log('Validation', `${name} - FAILED: ${error.message}`, 'error');
      }
    }

    this.results.validation = results;
  }

  async testPageLoad(path = '/') {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: CONFIG.port,
        path,
        method: 'GET',
      };

      const req = createServer.request
        ? createServer.request(options, (res) => {
            if (res.statusCode !== 200) {
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
              return;
            }

            let html = '';
            res.on('data', (chunk) => (html += chunk));
            res.on('end', () => {
              if (!html.includes('CST SmartDesk')) {
                reject(new Error('Page content validation failed'));
                return;
              }
              resolve({ status: res.statusCode, size: html.length, result: html });
            });
          })
        : null;

      if (!req) {
        // Fallback using curl
        try {
          const html = execSync(`curl -s http://localhost:${CONFIG.port}${path}`, {
            encoding: 'utf8',
          });
          if (!html.includes('CST SmartDesk')) {
            reject(new Error('Page content validation failed'));
            return;
          }
          resolve({ status: 200, size: html.length, result: html });
        } catch (error) {
          reject(new Error(`Failed to fetch page: ${error.message}`));
        }
        return;
      }

      req.on('error', reject);
      req.end();
    });
  }

  async testApi(endpoint) {
    return new Promise((resolve, reject) => {
      // Fallback using curl for API testing
      try {
        const output = execSync(`curl -s http://localhost:${CONFIG.port}${endpoint}`, {
          encoding: 'utf8',
        });
        const data = JSON.parse(output);
        resolve(data);
      } catch (error) {
        reject(new Error(`API test failed: ${error.message}`));
      }
    });
  }

  async testSearch() {
    // Test if search suggestions are available
    const html = await this.testPageLoad('/');
    if (!html.result || !html.result.includes('searchSuggest')) {
      throw new Error('Search functionality not found');
    }
    return { searchImplemented: true };
  }

  async testThemes() {
    // Test if theme system is available
    const html = await this.testPageLoad('/');
    if (!html.result || !html.result.includes('themeToggle')) {
      throw new Error('Theme system not found');
    }
    return { themingImplemented: true };
  }

  async checkDeployment() {
    this.log('Deployment', 'Checking live deployment...', 'working');
    try {
      const output = execSync(`curl -s -o /dev/null -w "%{http_code}" ${CONFIG.deployUrl}`, {
        encoding: 'utf8',
      });
      const statusCode = parseInt(output.trim());

      if (statusCode === 200) {
        this.results.deployment = { success: true, url: CONFIG.deployUrl };
        this.log('Deployment', 'Live site is accessible', 'success');
      } else {
        throw new Error(`HTTP ${statusCode}`);
      }
    } catch (error) {
      this.results.deployment = { success: false, error: error.message };
      this.log('Deployment', `Live site check failed: ${error.message}`, 'warning');
    }
  }

  generateReport() {
    this.log('Report', 'Generating development report...', 'working');

    console.log('\n' + '='.repeat(60));
    console.log('🚀 AUTO-DEVELOPMENT PIPELINE REPORT');
    console.log('='.repeat(60));

    // Build Status
    console.log(`\n📦 BUILD: ${this.results.build?.success ? '✅ PASSED' : '❌ FAILED'}`);

    // Tests Status
    const unitStatus = this.results.tests.unit?.success ? '✅' : '❌';
    const e2eStatus = this.results.tests.e2e?.success ? '✅' : '❌';
    console.log(`\n🧪 TESTS:`);
    console.log(
      `   Unit Tests: ${unitStatus} ${this.results.tests.unit?.success ? 'PASSED' : 'FAILED'}`,
    );
    console.log(
      `   E2E Tests: ${e2eStatus} ${this.results.tests.e2e?.success ? 'PASSED' : 'FAILED'}`,
    );

    // Preview Status
    console.log(`\n👀 PREVIEW: ${this.results.preview?.success ? '✅ RUNNING' : '❌ FAILED'}`);
    if (this.results.preview?.success) {
      console.log(`   URL: http://localhost:${CONFIG.port}`);
    }

    // Validation Results
    console.log(`\n🔍 VALIDATION:`);
    this.results.validation?.forEach(({ name, success, error }) => {
      console.log(`   ${name}: ${success ? '✅ PASSED' : '❌ FAILED'}`);
      if (error) console.log(`      Error: ${error}`);
    });

    // Deployment Status
    console.log(
      `\n🌍 DEPLOYMENT: ${this.results.deployment?.success ? '✅ LIVE' : '⚠️ CHECK NEEDED'}`,
    );
    if (this.results.deployment?.success) {
      console.log(`   URL: ${CONFIG.deployUrl}`);
    }

    // Recommendations
    this.generateRecommendations();
    if (this.results.recommendations.length > 0) {
      console.log(`\n💡 RECOMMENDATIONS:`);
      this.results.recommendations.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ PIPELINE COMPLETE - Review the results above');
    console.log('='.repeat(60) + '\n');
  }

  generateRecommendations() {
    const recs = this.results.recommendations;

    // Build recommendations
    if (!this.results.build?.success) {
      recs.push('Fix build errors before proceeding with UI changes');
    }

    // Test recommendations
    if (!this.results.tests.unit?.success) {
      recs.push('Unit tests failing - review test coverage for new features');
    }
    if (!this.results.tests.e2e?.success) {
      recs.push('E2E tests failing - may indicate UI/UX issues');
    }

    // Validation recommendations
    const failedValidations = this.results.validation?.filter((v) => !v.success) || [];
    if (failedValidations.length > 0) {
      recs.push(`${failedValidations.length} functionality test(s) failed - review implementation`);
    }

    // Deployment recommendations
    if (!this.results.deployment?.success) {
      recs.push('Live deployment unreachable - verify Vercel deployment status');
    }

    // Success recommendations
    if (this.results.build?.success && this.results.preview?.success) {
      recs.push('🎉 Ready for UI review! Check the preview URL above');
    }
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const commitMessage = process.argv[2] || 'feat: automated development pipeline update';
  const pipeline = new AutoDevPipeline();
  pipeline.run(commitMessage);
}

export default AutoDevPipeline;
