import fs from 'node:fs';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
if (!lock.packages) {
  console.error('Lockfile missing packages map');
  process.exit(1);
}
const wanted = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
const missing = Object.keys(wanted).filter(
  (name) => !Object.keys(lock.packages).some((k) => k === `node_modules/${name}`),
);
if (missing.length) {
  console.error('Lockfile out of sync for:', missing.join(', '));
  process.exit(1);
}
console.log('Lockfile matches package.json');
