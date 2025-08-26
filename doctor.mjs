// doctor.mjs — local audit & gentle auto-fix for placeholders (repo-aware)
import { promises as fs } from 'fs';
import path from 'path';

const ROOT = process.cwd();
const writeMode = process.argv.includes('--write');

// Required asset filenames (SVG) and carrier JSON IDs
const requiredSvgs = [
  'verizon.svg',
  'att.svg',
  'cricket.svg',
  'liberty.svg',
  'consumer-cellular.svg',
  'uscellular.svg',
  'optimum.svg',
  'cox.svg',
  'telus.svg',
  'koodo.svg',
  'bell.svg',
  'virgin.svg',
  'samsung.svg',
  'ubreakifix.svg',
  'rsg.svg',
  'homeplus.svg',
  'applianceplus.svg',
  'vz-hdp.svg',
  'att-htp.svg',
];

const requiredCarrierJson = [
  'VZW.json',
  'ATT.json',
  'CRK.json',
  'LIB.json',
  'CC.json',
  'USCC.json',
  'OPT.json',
  'COX.json',
  'TELUS.json',
  'KOODO.json',
  'BELL.json',
  'VIRGIN.json',
  'SAMSUNG.json',
];

function svgTemplate(label, fill = '#6f4bd8') {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="96" height="24" viewBox="0 0 96 24" role="img" aria-label="${label} placeholder">\n  <rect width="96" height="24" rx="6" fill="${fill}"/>\n  <text x="8" y="16" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="#fff">${label.toUpperCase()}</text>\n</svg>\n`;
}

function carrierJsonTemplate(id, name) {
  return (
    JSON.stringify(
      {
        id,
        name,
        tcs: [],
        common_denials: [],
        rpfr: { eligibility_hint: '', note_template_en: '' },
        fmip: { steps_en: [], steps_es: [] },
        support_links: [],
      },
      null,
      2,
    ) + '\n'
  );
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // ignore
  }
}

async function ensureFile(filePath, contents) {
  try {
    await fs.access(filePath);
    return false;
  } catch {
    if (writeMode) {
      await ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, contents, 'utf8');
      return true;
    }
    return 'missing';
  }
}

async function checkIndexHtml() {
  const indexPath = path.join(ROOT, 'index.html');
  try {
    const html = await fs.readFile(indexPath, 'utf8');
    const hasSrcApp = html.includes('src="/src/app.js"');
    const hasRootApp = html.includes('src="/app.js"');
    const hasApp = hasSrcApp || hasRootApp;
    const fix = hasApp
      ? ''
      : 'Add <script type="module" src="/src/app.js"></script> before </body>';
    return { file: 'index.html', ok: hasApp, fix };
  } catch {
    return { file: 'index.html', ok: false, fix: 'Create index.html at repo root' };
  }
}

async function checkAppJs() {
  const candidates = ['src/app.js', 'public/app.js'];
  for (const rel of candidates) {
    try {
      await fs.access(path.join(ROOT, rel));
      return { file: rel, ok: true, fix: '' };
    } catch {
      // continue
    }
  }
  return { file: 'src/app.js', ok: false, fix: 'Ensure src/app.js exists (or public/app.js)' };
}

async function checkVercel() {
  const vp = path.join(ROOT, 'vercel.json');
  try {
    const json = JSON.parse(await fs.readFile(vp, 'utf8'));
    const headers = Array.isArray(json.headers) ? json.headers : [];
    const hdr = headers.find((h) => h.source === '/(.*)');
    const csp = Array.isArray(hdr?.headers)
      ? hdr.headers.find((kv) => kv.key === 'Content-Security-Policy')?.value || ''
      : '';
    const good = /script-src 'self'/.test(csp);
    return { file: 'vercel.json', ok: Boolean(good), fix: good ? '' : "Ensure CSP includes script-src 'self'" };
  } catch {
    return { file: 'vercel.json', ok: false, fix: 'Add vercel.json with CSP headers' };
  }
}

async function run() {
  const results = [];
  results.push(await checkIndexHtml());
  results.push(await checkAppJs());
  results.push(await checkVercel());

  // assets under public/assets
  let createdAssets = 0,
    missingAssets = 0;
  for (const name of requiredSvgs) {
    const created = await ensureFile(
      path.join(ROOT, 'public', 'assets', name),
      svgTemplate(name.replace('.svg', '')),
    );
    if (created === true) createdAssets++;
    if (created === 'missing') missingAssets++;
  }

  // carrier json under public/carriers
  let createdJson = 0,
    missingJson = 0;
  for (const name of requiredCarrierJson) {
    const id = name.replace('.json', '');
    const created = await ensureFile(
      path.join(ROOT, 'public', 'carriers', name),
      carrierJsonTemplate(id, id),
    );
    if (created === true) createdJson++;
    if (created === 'missing') missingJson++;
  }

  // report
  console.log('Doctor report');
  console.log('=============');
  for (const r of results) {
    console.log(`${r.ok ? '✓' : '✗'} ${r.file}${r.ok ? '' : ` — ${r.fix}`}`);
  }
  console.log(
    `Assets: ${createdAssets ? `created ${createdAssets}` : missingAssets ? `${missingAssets} missing (run: npm run fix)` : 'all present'}`,
  );
  console.log(
    `Carrier JSON: ${createdJson ? `created ${createdJson}` : missingJson ? `${missingJson} missing (run: npm run fix)` : 'all present'}`,
  );

  if (!writeMode && (missingAssets || missingJson || results.some((r) => !r.ok))) {
    console.log('\nRun auto-fix:\n  npm run fix\n');
  }
}

run().catch((e) => {
  console.error('Doctor crashed:', e?.message || String(e));
  process.exit(1);
});
