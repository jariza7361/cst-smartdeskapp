#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

function ensureDir(p){ fs.mkdirSync(p, { recursive: true }); }
function copyFile(src, dest){
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  console.log('Copied', path.relative(root, src), '→', path.relative(root, dest));
}

function findFirst(paths){
  for (const p of paths){
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const nm = path.join(root, 'node_modules', 'tesseract.js');
const nmCoreRoot = path.join(root, 'node_modules', 'tesseract.js-core');
const nmCoreNested = path.join(nm, 'node_modules', 'tesseract.js-core');
if (!fs.existsSync(nm)){
  console.error('tesseract.js not installed. Run: npm i -D tesseract.js');
  process.exit(2);
}

const candidates = {
  js: [
    // v2 classic
    path.join(nm, 'dist', 'tesseract.min.js'),
    path.join(nm, 'dist', 'browser', 'tesseract.min.js'),
    // v4 modern
    path.join(nm, 'dist', 'tesseract.min.js'),
  ],
  worker: [
    // v2 classic
    path.join(nm, 'dist', 'worker.min.js'),
    path.join(nm, 'dist', 'browser', 'worker.min.js'),
    // v4 worker naming
    path.join(nm, 'dist', 'worker.min.js'),
  ],
  wasm: [
    // v2 under main pkg (rare)
    path.join(nm, 'dist', 'tesseract-core.wasm'),
    path.join(nm, 'dist', 'browser', 'tesseract-core.wasm'),
    // v4 may ship simd
    path.join(nm, 'dist', 'tesseract-core-simd.wasm'),
    // v2 separate core package (root hoisted)
    path.join(nmCoreRoot, 'tesseract-core.wasm'),
    path.join(nmCoreRoot, 'tesseract-core-simd.wasm'),
    // nested under tesseract.js
    path.join(nmCoreNested, 'tesseract-core.wasm'),
    path.join(nmCoreNested, 'tesseract-core-simd.wasm'),
  ],
};

const srcs = {
  js: findFirst(candidates.js),
  worker: findFirst(candidates.worker),
  wasm: findFirst(candidates.wasm),
};

if (!srcs.js || !srcs.worker || !srcs.wasm){
  console.error('Could not locate Tesseract dist files in node_modules/tesseract.js');
  console.error('Checked:', candidates);
  process.exit(3);
}

const targets = [
  path.join(root, 'public', 'libs', 'tesseract'),
  path.join(root, 'libs', 'tesseract'),
];

for (const t of targets){ ensureDir(t); }

for (const t of targets){
  copyFile(srcs.js, path.join(t, 'tesseract.min.js'));
  copyFile(srcs.worker, path.join(t, 'worker.min.js'));
  const wasmTarget = path.basename(srcs.wasm).includes('simd') ? 'tesseract-core.wasm' : 'tesseract-core.wasm';
  copyFile(srcs.wasm, path.join(t, wasmTarget));
}

console.log('Tesseract assets installed.');
