// tests/decode-favicon.smoke.mjs
import { mkdtemp, writeFile, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { decodeFavicon } from '../scripts/decode-favicon.mjs';

// 1x1 PNG (base64) — just to assert bytes are written
const SAMPLE_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottQAAAABJRU5ErkJggg==';

(async () => {
  const dir = await mkdtemp(join(tmpdir(), 'cst-fav-'));
  const inPath = join(dir, 'favicon.ico.b64');
  const outPath = join(dir, 'favicon.ico');
  await writeFile(inPath, SAMPLE_B64, 'utf8');

  process.env.FAVICON_B64_PATH = inPath;
  process.env.FAVICON_OUT_PATH = outPath;

  const ok = await decodeFavicon();
  if (!ok) {
    console.error('[smoke] decodeFavicon returned false');
    process.exit(1);
  }
  const s = await stat(outPath);
  if (!s.size || s.size <= 0) {
    console.error('[smoke] output favicon was not written');
    process.exit(1);
  }
  console.log('[smoke] decode-favicon OK');
})();
