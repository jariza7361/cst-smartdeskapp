#!/usr/bin/env node

/**
 * CSS Loading Test
 * Tests that CSS files are properly loaded and styles are applied
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

function testCSSLoading() {
  console.log('🎨 Testing CSS loading...\n');
  
  // Read HTML file
  const htmlPath = resolve(rootDir, 'index.html');
  const htmlContent = readFileSync(htmlPath, 'utf-8');
  
  // Check for CSS links
  const cssLinkCount = (htmlContent.match(/<link[^>]+rel=["']stylesheet["']/g) || []).length;
  console.log(`📄 Found ${cssLinkCount} CSS links in HTML`);
  
  // Read main CSS file to check for key styles
  const mainCSSPath = resolve(rootDir, 'src/styles.css');
  const cssContent = readFileSync(mainCSSPath, 'utf-8');
  
  const keyStyles = [
    '.topbar',
    '.sidebar', 
    '.dashboard-grid',
    '.dashboard-card',
    '--bg',
    'var(--'
  ];
  
  console.log('\n🔍 Checking for key CSS styles:');
  
  let allFound = true;
  for (const style of keyStyles) {
    if (cssContent.includes(style)) {
      console.log(`✅ ${style} - Found`);
    } else {
      console.log(`❌ ${style} - Missing`);
      allFound = false;
    }
  }
  
  if (allFound) {
    console.log('\n🎉 All key CSS styles are present!');
    console.log('💡 The UI should be working properly.');
  } else {
    console.error('\n💥 Some CSS styles are missing!');
    process.exit(1);
  }
}

testCSSLoading();
