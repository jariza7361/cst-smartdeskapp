// scripts/decode-favicon.mjs
import { mkdir, readFile, writeFile, stat } from 'fs/promises';
import { dirname } from 'path';

export async function decodeFavicon({
  inPath = process.env.FAVICON_B64_PATH || 'public/favicon.ico.b64',
  outPath = process.env.FAVICON_OUT_PATH || 'public/favicon.ico',
} = {}) {
  try {
    const b64 = await readFile(inPath, 'utf8');
    const clean = b64.replace(/\s+/g, '');
    const buf = Buffer.from(clean, 'base64');
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, buf);
    const s = await stat(outPath);
    console.log(`[decode-favicon] Wrote ${outPath} (${s.size} bytes)`);
    return true;
  } catch (err) {
    console.warn(`[decode-favicon] Skipping (no .b64 present or read error): ${err?.message}`);
    return false; // non-fatal by design
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  decodeFavicon();
}
