// GET /api/fetch
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const target = process.env.TOS_URL || req.query?.url;
  if (!target) {
    // No target URL configured; return a stubbed normalized payload
    return res.status(200).json({ ok: true, carrier: 'unknown', normalized: {} });
  }

  try {
    const r = await fetch(target, { method: 'GET', redirect: 'follow' });
    const text = await r.text();
    return res.status(200).json({ ok: true, carrier: 'unknown', normalized: { raw: text } });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}

