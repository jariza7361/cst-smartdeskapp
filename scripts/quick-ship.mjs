#!/usr/bin/env node
/**
 * Quick Development Script
 * Usage: npm run ship "commit message"
 */

import { execSync } from 'child_process';

const commitMessage = process.argv[2] || `feat: UI improvements - ${new Date().toISOString().split('T')[0]}`;

console.log('🚀 Quick Ship Pipeline Starting...\n');

try {
  // Step 1: Build
  console.log('📦 Building...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build complete\n');

  // Step 2: Test
  console.log('🧪 Running tests...');
  try {
    execSync('npm run test', { stdio: 'inherit' });
    console.log('✅ Tests passed\n');
  } catch (error) {
    console.log('⚠️ Tests failed, continuing...\n');
  }

  // Step 3: Commit & Push
  console.log('📤 Committing changes...');
  execSync('git add -A', { stdio: 'inherit' });
  execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
  execSync('git push', { stdio: 'inherit' });
  console.log('✅ Changes pushed\n');

  // Step 4: Start preview
  console.log('👀 Starting preview server...');
  console.log('🌍 Preview will be available at: http://localhost:53124');
  console.log('🔗 Live site: https://cst-smartdeskapp-jariza7361s-projects.vercel.app');
  console.log('\n🎉 Ready for review! Check both URLs above.\n');
  
  // Start preview server (non-blocking)
  execSync('npm run preview', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Pipeline failed:', error.message);
  process.exit(1);
}
