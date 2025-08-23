// Decodes public/favicon.ico.b64 -> public/favicon.ico during build
import fs from 'node:fs';
import path from 'node:path';

const pubDir = path.join(process.cwd(), 'public');
const b64Path = path.join(pubDir, 'favicon.ico.b64');
const icoPath = path.join(pubDir, 'favicon.ico');

try {
  if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });
  if (fs.existsSync(b64Path)) {
    const b64 = fs.readFileSync(b64Path, 'utf8').replace(/\s+/g, '');
    const buf = Buffer.from(b64, 'base64');
    fs.writeFileSync(icoPath, buf);
    console.log('[decode-favicon] wrote public/favicon.ico');
  } else {
    console.log('[decode-favicon] skipped (no favicon.ico.b64)');
  }
} catch (e) {
  console.error('[decode-favicon] error:', e.message);
  process.exit(0); // don’t fail builds; favicon is optional
}
