#!/usr/bin/env node

/**
 * CSS Link Validator
 * Validates that all CSS files referenced in HTML exist and are accessible
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

function validateCSSLinks() {
  console.log('🔍 Validating CSS links...\n');
  
  const htmlFile = resolve(rootDir, 'index.html');
  
  if (!existsSync(htmlFile)) {
    console.error('❌ index.html not found');
    process.exit(1);
  }
  
  const htmlContent = readFileSync(htmlFile, 'utf-8');
  
  // Extract CSS links from HTML
  const cssLinkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  const matches = [...htmlContent.matchAll(cssLinkRegex)];
  
  if (matches.length === 0) {
    console.error('❌ No CSS links found in HTML');
    process.exit(1);
  }
  
  let allValid = true;
  
  for (const match of matches) {
    const href = match[1];
    const cssPath = resolve(rootDir, href);
    
    if (existsSync(cssPath)) {
      console.log(`✅ ${href} - Found`);
    } else {
      console.error(`❌ ${href} - Missing (${cssPath})`);
      allValid = false;
    }
  }
  
  if (allValid) {
    console.log('\n🎉 All CSS links are valid!');
  } else {
    console.error('\n💥 Some CSS files are missing!');
    process.exit(1);
  }
}

validateCSSLinks();
