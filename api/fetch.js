// GET /api/fetch?url=...
export default async function handler(req, res) {
  // set CORS header for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const target = process.env.TOS_URL || req.query?.url;
  if (!target) {
    return res.status(200).json({ ok: true, carrier: null, normalized: null });
  }

  // Basic allowlist (extend as needed)
  try {
    const u = new URL(target);
    const host = u.hostname.toLowerCase();
    const allowed = ['www.asurion.com', 'asurion.com', 'www.phoneclaim.com', 'phoneclaim.com'];
    if (!allowed.includes(host)) {
      return res.status(400).json({ ok: false, error: 'Host not allowed', host });
    }
  } catch {
    return res.status(400).json({ ok: false, error: 'Invalid URL' });
  }

  try {
    const r = await fetch(target, { method: 'GET', redirect: 'follow' });
    const buf = await r.arrayBuffer();
    return res.status(200).json({
      ok: true,
      carrier: null,
      normalized: null,
      url: r.url || target,
      status: r.status,
      contentType: r.headers.get('content-type'),
      lastModified: r.headers.get('last-modified'),
      bytes: buf.byteLength,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}
