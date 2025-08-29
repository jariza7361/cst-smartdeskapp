import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Ensure package.json exists
if (!fs.existsSync('package.json')) {
  console.error('package.json missing');
  process.exit(1);
}

// Detect git merge conflict markers (only real markers at start-of-line)
const files = execSync('git ls-files', { encoding: 'utf8' }).trim().split('\n');
const conflicts = [];
const conflictRe = /^(?:<{7}|={7}|>{7})/m; // <<<<<<<, =======, or >>>>>>> at BOL
for (const file of files) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    if (conflictRe.test(text)) {
      conflicts.push(file);
    }
  } catch {
    // skip binaries or unreadable files
  }
}
if (conflicts.length) {
  console.error('Conflict markers detected in:');
  conflicts.forEach((f) => console.error('  ' + f));
  process.exit(1);
}

// Ensure Copilot seed option remains (accept either src/app.js or public/app.js)
let seedOk = false;
for (const candidate of ['src/app.js', 'public/app.js']) {
  try {
    const appJs = fs.readFileSync(candidate, 'utf8');
    if (appJs.includes('copilotSample')) {
      seedOk = true;
      break;
    }
  } catch {
    // ignore
  }
}
if (!seedOk) {
  console.error('Copilot seed option missing (expected in src/app.js or public/app.js)');
  process.exit(1);
}

// If a production build exists, validate that the main module referenced by dist/index.html exists
if (fs.existsSync('dist')) {
  try {
    const htmlPath = path.join('dist', 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    const match = html.match(/<script[^>]*type="module"[^>]*src="([^"]+)"/i);
    if (match && match[1]) {
      const assetPath = match[1].replace(/^\//, '');
      const full = path.join('dist', assetPath);
      if (!fs.existsSync(full)) {
        console.error(`Built asset missing: ${full}`);
        process.exit(1);
      }
    }
  } catch (e) {
    // Do not fail doctor on prod build checks; only warn
    console.warn('Doctor: warning while checking dist build:', e?.message || String(e));
  }
}

console.log('Doctor: all checks passed');
