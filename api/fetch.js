// api/fetch.js — Vercel serverless endpoint to fetch a URL head/body safely
export default async function handler(req, res){
  if (req.method !== 'GET') {
    res.setHeader('Allow','GET');
    return res.status(405).json({ ok:false, error:'Method not allowed' });
  }
  const url = req.query.url;
  if(!url) return res.status(400).json({ ok:false, error:'Missing ?url=' });

  try{
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'CST-SmartDesk/1.0 (+https://cst-smartdeskapp.vercel.app)',
        'Accept': '*/*',
      },
      redirect: 'follow'
    });

    const contentType = r.headers.get('content-type') || '';
    const lastModified = r.headers.get('last-modified') || null;

    // For PDFs and binaries, don’t stream the whole file back — just probe a slice
    let bytes = 0, sha256 = null, preview = null;
    if (contentType.includes('application/pdf') || contentType.includes('octet-stream')) {
      const ab = await r.arrayBuffer();
      bytes = ab.byteLength;
      // hash a small slice to keep response small
      const slice = new Uint8Array(ab).slice(0, 8192);
      const digest = await crypto.subtle.digest('SHA-256', slice);
      sha256 = Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,'0')).join('');
      preview = `bytes[0..8192]=${slice.length}`;
    } else {
      const text = await r.text();
      bytes = Buffer.byteLength(text||'', 'utf8');
      preview = (text||'').slice(0, 2048);
    }

    return res.status(200).json({
      ok: true,
      url: r.url,
      status: r.status,
      contentType,
      lastModified,
      bytes,
      sha256,
      preview
    });
  }catch(e){
    return res.status(500).json({ ok:false, error: e.message });
  }
}