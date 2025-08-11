// api/fetch.js — fetch remote URL (PDF/HTML) and return metadata
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const upstream = await fetch(url, {
      redirect: 'follow',
      headers: {
        // light header to look like a browser
        'User-Agent': 'Mozilla/5.0 (compatible; CSTSmartDesk/1.0)',
        'Accept': '*/*',
      }
    });

    const contentType = upstream.headers.get('content-type') || '';
    const lastModified = upstream.headers.get('last-modified') || null;
    const buf = await upstream.arrayBuffer();
    const bytes = buf.byteLength;

    // sha256 (optional, small impl)
    const hash = await crypto.subtle.digest('SHA-256', buf);
    const arr = Array.from(new Uint8Array(hash));
    const sha256 = arr.map(b=>b.toString(16).padStart(2,'0')).join('');

    return res.status(200).json({
      ok: upstream.ok,
      url: upstream.url,
      status: upstream.status,
      contentType,
      lastModified,
      bytes,
      sha256
    });
  } catch (e) {
    return res.status(200).json({ ok:false, error: e.message });
  }
}