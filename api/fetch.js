// api/fetch.js — simple proxy: fetch remote URL and summarize headers/body
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok:false, error:'Method not allowed' });
  const url = req.query.url;
  if (!url || typeof url !== 'string') return res.status(400).json({ ok:false, error:'Missing url param' });
  try {
    const resp = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'CSTSmartDesk/1.0 (+https://cst-smartdeskapp.vercel.app)',
        'Accept': '*/*'
      }
    });
    const contentType = resp.headers.get('content-type') || '';
    const lastModified = resp.headers.get('last-modified');
    const buf = Buffer.from(await resp.arrayBuffer());
    // cap at 10MB
    if (buf.length > 10 * 1024 * 1024) return res.status(413).json({ ok:false, error:'Too large', bytes: buf.length, contentType });
    const crypto = await import('crypto');
    const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
    return res.status(200).json({
      ok: resp.ok,
      url: resp.url,
      status: resp.status,
      contentType,
      lastModified,
      bytes: buf.length,
      sha256
    });
  } catch (e) {
    return res.status(500).json({ ok:false, error: String(e?.message || e) });
  }
}