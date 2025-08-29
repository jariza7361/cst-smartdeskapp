#!/usr/bin/env node

/**
 * Pre-commit validation script to detect corrupted or suspicious files
 * This prevents corrupted files from being committed to the repository
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// File extensions that should contain code
const CODE_EXTENSIONS = ['.js', '.mjs', '.ts', '.tsx', '.jsx', '.json', '.css', '.html'];

// Suspicious patterns that indicate corrupted files
const SUSPICIOUS_PATTERNS = [
  /It sounds like you're looking/i,
  /I can help you with/i,
  /Let me help you/i,
  /Here's what I found/i,
  /Based on your request/i,
];

// Files and directories to exclude from checks
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  'coverage',
  'test-results',
  '.vercel',
  'libs/tesseract',
];

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function getAllFiles(dir, files = []) {
  if (shouldExclude(dir)) return files;

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);

      if (shouldExclude(fullPath)) continue;

      try {
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          getAllFiles(fullPath, files);
        } else if (CODE_EXTENSIONS.includes(extname(item).toLowerCase())) {
          files.push(fullPath);
        }
      } catch (error) {
        console.warn(`Warning: Could not access ${fullPath}: ${error.message}`);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
  }

  return files;
}

function checkFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const relativePath = filePath.replace(ROOT_DIR + '/', '');

    // Skip validation for HTML files and this validation script itself
    if (filePath.endsWith('.html') || filePath.endsWith('pre-commit-check.mjs')) {
      return null;
    }

    // Check for suspicious patterns only in non-HTML, non-validation script files
    for (const pattern of SUSPICIOUS_PATTERNS) {
      if (pattern.test(content)) {
        return {
          file: relativePath,
          issue: 'Contains suspicious text pattern that suggests corruption',
          pattern: pattern.source,
        };
      }
    }

    // Check for empty files that should have content
    if (content.trim().length === 0 && !['.txt', '.md'].includes(extname(filePath))) {
      return {
        file: relativePath,
        issue: 'File is empty but should contain code',
      };
    }

    // Check for HTML in non-HTML files (but allow legitimate HTML content)
    if (!filePath.endsWith('.html') && content.includes('<html>') && !content.includes('DOCTYPE')) {
      return {
        file: relativePath,
        issue: 'Contains HTML content in non-HTML file',
      };
    }

    // Check JSON files for valid syntax
    if (filePath.endsWith('.json')) {
      try {
        JSON.parse(content);
      } catch (error) {
        return {
          file: relativePath,
          issue: `Invalid JSON syntax: ${error.message}`,
        };
      }
    }

    return null;
  } catch (error) {
    return {
      file: filePath.replace(ROOT_DIR + '/', ''),
      issue: `Could not read file: ${error.message}`,
    };
  }
}

function main() {
  console.log('🔍 Running pre-commit validation checks...');

  const files = getAllFiles(ROOT_DIR);
  const issues = [];

  console.log(`📁 Checking ${files.length} files...`);

  for (const file of files) {
    const issue = checkFile(file);
    if (issue) {
      issues.push(issue);
    }
  }

  if (issues.length === 0) {
    console.log('✅ All files passed validation checks');
    process.exit(0);
  } else {
    console.error('❌ Found issues that need to be resolved:');
    console.error('');

    issues.forEach((issue, index) => {
      console.error(`${index + 1}. ${issue.file}`);
      console.error(`   Issue: ${issue.issue}`);
      if (issue.pattern) {
        console.error(`   Pattern: ${issue.pattern}`);
      }
      console.error('');
    });

    console.error('Please fix these issues before committing.');
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
