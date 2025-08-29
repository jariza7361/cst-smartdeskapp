// GET /api/fetch
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let target = process.env.TOS_URL || req.query?.url;
  if (!target) {
    // No target URL configured; return a stubbed normalized payload
    return res.status(200).json({ ok: true, carrier: 'unknown', normalized: {} });
  }

  try {
    // Ensure absolute URL for Node/serverless fetch
    if (!/^https?:\/\//i.test(target)) {
      const proto = req.headers['x-forwarded-proto'] || 'https';
      const host = req.headers['x-forwarded-host'] || req.headers.host;
      const base = `${proto}://${host}`;
      target = new URL(target, base).toString();
    }
    const r = await fetch(target, { method: 'GET', redirect: 'follow' });
    const text = await r.text();
    return res.status(200).json({ ok: true, carrier: 'unknown', normalized: { raw: text } });
  } catch (e) {
    const msg = e?.message || String(e);
    const badUrl = /did not match the expected pattern|invalid url/i.test(msg);
    return res.status(badUrl ? 400 : 500).json({ ok: false, error: msg });
  }
}
