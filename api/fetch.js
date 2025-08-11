// Serverless proxy to fetch a remote URL (PDF/HTML) and report metadata.
// Usage: GET /api/fetch?url=https%3A%2F%2Fwww.asurion.com%2Fpdf%2Fnw-consumer-vmp-25%2F
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const url = req.query.url;
  if (!url) {
    res.status(400).json({ error: 'Missing ?url=' });
    return;
  }
  try {
    const r = await fetch(url, {
      redirect: 'follow',
      headers: {
        // A basic UA helps avoid some “bot” blocks
        'User-Agent': 'Mozilla/5.0 (compatible; CST-SmartDesk/1.0; +https://example.invalid)'
      }
    });
    const ct = r.headers.get('content-type') || '';
    const lm = r.headers.get('last-modified');
    const buf = await r.arrayBuffer();
    const bytes = buf.byteLength;

    // We only return metadata here (not the full PDF) to keep the response light.
    res.status(200).json({
      ok: r.ok,
      status: r.status,
      url: r.url,
      contentType: ct,
      lastModified: lm,
      bytes
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}