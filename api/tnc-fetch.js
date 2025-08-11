// api/tnc-fetch.js
// Fetches a PDF URL (HEAD/GET) and returns meta + sha256 (size-capped)

import { createHash } from 'node:crypto';

export default async function handler(req, res){
  const url = (req.query?.url || '').toString() || 'https://www.asurion.com/pdf/nw-consumer-vmp-25/';
  try{
    const head = await fetch(url, { method:'HEAD' });
    const lastMod = head.ok ? head.headers.get('last-modified') : null;
    const ct = head.ok ? head.headers.get('content-type') : null;

    // Size cap 6MB to avoid big downloads in test
    let sha256 = null, bytes = 0, ok = false;
    const r = await fetch(url);
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer());
      bytes = buf.byteLength;
      if (bytes <= 6 * 1024 * 1024) {
        sha256 = createHash('sha256').update(buf).digest('hex');
        ok = true;
      } else {
        ok = true; // fetched but too big for hashing in test
      }
    }

    return res.status(200).json({
      ok,
      url,
      contentType: ct || r.headers.get('content-type') || null,
      lastModified: lastMod,
      bytes,
      sha256: sha256 || null
    });
  }catch(err){
    return res.status(200).json({ ok:false, url, error: String(err) });
  }
}
