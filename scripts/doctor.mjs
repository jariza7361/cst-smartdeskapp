import { execSync } from 'node:child_process';
import fs from 'node:fs';

// Ensure package.json exists
if (!fs.existsSync('package.json')) {
  console.error('package.json missing');
  process.exit(1);
}

// Detect git merge conflict markers
const files = execSync('git ls-files', { encoding: 'utf8' }).trim().split('\n');
const conflicts = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes('<<<<<<<') || text.includes('>>>>>>>')) {
    conflicts.push(file);
  }
}
if (conflicts.length) {
  console.error('Conflict markers detected in:');
  conflicts.forEach((f) => console.error('  ' + f));
  process.exit(1);
}

// Ensure Copilot seed option remains
try {
  const app = fs.readFileSync('public/app.js', 'utf8');
  if (!app.includes('copilotSample')) {
    console.error('Copilot seed option missing in public/app.js');
    process.exit(1);
  }
} catch {
  console.error('Copilot UI missing (public/app.js not readable)');
  process.exit(1);
}

console.log('Doctor: all checks passed');
