#!/usr/bin/env node

/**
 * GitHub CLI Setup Helper
 * Helps configure GitHub CLI for easy PR creation
 */

import { execSync } from 'child_process';

function checkGitHubCLI() {
  console.log('🔍 Checking GitHub CLI setup...\n');

  try {
    // Check if gh is installed
    execSync('gh --version', { stdio: 'pipe' });
    console.log('✅ GitHub CLI is installed');

    // Check if authenticated
    try {
      execSync('gh auth status', { stdio: 'pipe' });
      console.log('✅ GitHub CLI is authenticated');

      // Get current repo info
      try {
        const repo = execSync('gh repo view --json name,owner', { encoding: 'utf8' });
        const repoInfo = JSON.parse(repo);
        console.log(`✅ Repository: ${repoInfo.owner.login}/${repoInfo.name}`);

        console.log('\n🎉 GitHub CLI is ready for PR creation!');
        console.log('\n📝 Quick PR commands:');
        console.log('   npm run pr-prep          # Full validation + PR prep');
        console.log('   npm run pr-prep:draft     # Draft PR validation');
        console.log('   npm run pr-prep:quick     # Quick validation');
        console.log('');
        console.log('   gh pr create              # Create PR interactively');
        console.log('   gh pr create --draft      # Create draft PR');
        console.log('   gh pr create --web        # Open web interface');

        return true;
      } catch {
        console.log('⚠️  Not in a GitHub repository or remote not set');
        console.log('💡 Run: git remote add origin <your-repo-url>');
        return false;
      }
    } catch {
      console.log('❌ GitHub CLI is not authenticated');
      console.log('💡 Run: gh auth login');
      return false;
    }
  } catch {
    console.log('❌ GitHub CLI is not installed');
    console.log('💡 Install with:');
    console.log('   brew install gh          # macOS');
    console.log('   winget install GitHub.cli # Windows');
    console.log('   apt install gh           # Ubuntu/Debian');
    console.log('');
    console.log('   Or download from: https://cli.github.com/');
    return false;
  }
}

function showWorkflow() {
  console.log('\n🚀 RECOMMENDED PR WORKFLOW');
  console.log('===========================');
  console.log('');
  console.log('1. 📝 Make your changes');
  console.log('   git add .');
  console.log('   git commit -m "your changes"');
  console.log('');
  console.log('2. 🔍 Validate before push');
  console.log('   npm run pr-prep          # Full validation');
  console.log('   # OR');
  console.log('   npm run pr-prep:draft     # For draft PRs');
  console.log('');
  console.log('3. 📤 Push changes');
  console.log('   git push');
  console.log('   # Pre-push hooks will run automatically');
  console.log('');
  console.log('4. 🎯 Create PR');
  console.log('   gh pr create --draft      # Draft PR');
  console.log('   # OR');
  console.log('   gh pr create              # Final PR');
  console.log('');
  console.log('💡 The hooks will automatically run:');
  console.log('   - Pre-commit: File validation, formatting, linting');
  console.log('   - Pre-push: Tests, build, comprehensive validation');
}

function main() {
  console.log('🚀 GitHub PR Setup Assistant');
  console.log('=============================\n');

  const isReady = checkGitHubCLI();
  showWorkflow();

  if (isReady) {
    console.log("\n✅ You're all set for creating PRs!");
  } else {
    console.log('\n⚠️  Complete the setup steps above first.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
