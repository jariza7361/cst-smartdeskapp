import fs from 'node:fs';

function fail(msg) {
  console.error('DOCTOR:', msg);
  process.exit(1);
}

// 1) no conflict markers
const scan = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');
for (const f of [
  'AGENTS.md',
  'eslint.config.js',
  'vitest.config.ts',
  'vercel.json',
  'index.html',
  'public/app.js',
]) {
  const s = scan(f);
  if (s.includes('<<<<<<<') || s.includes('=======') || s.includes('>>>>>>>')) {
    fail(`merge conflict markers found in ${f}`);
  }
}

// 2) seeded option must exist in index.html so E2E won’t flake
const html = scan('index.html');
if (!html.match(/<select[^>]*id=["']copilotSample["'][^>]*>[\s\S]*<option/i)) {
  fail('index.html missing default <option> inside #copilotSample');
}

// 3) lockfile presence (installer will regen, but keep us honest)
if (!fs.existsSync('package.json')) fail('missing package.json');
console.log('DOCTOR: OK');

