// Vercel Serverless Function: GET /api/fetch
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  // allow proxying only to a curated list of hosts
  const { searchParams } = new URL(req.url || '', 'http://local');
  const target = searchParams.get('url');
  if (target) {
    try {
      const u = new URL(target);
      const allowed = (process.env.FETCH_ALLOW_HOSTS || '').split(',').filter(Boolean);
      if (allowed.length && !allowed.includes(u.host)) {
        res.status(403).json({ ok: false, error: 'Host not allowed' });
        return;
      }
      const r = await fetch(u.href);
      const text = await r.text();
      res.status(200).json({ ok: true, body: text });
    } catch (e) {
      res.status(400).json({ ok: false, error: e.message });
    }
    return;
  }

  // Optional: fetch real T&C from env URL (self-curated)
  const url = process.env.TOS_URL;
  try {
    let payload;
    if (url) {
      const r = await fetch(url);
      const text = await r.text();
      payload = normalize(text);
    } else {
      payload = normalize(`Verizon Wireless Terms
Effective: 2025-01-01
Fees: activation, upgrade, recovery surcharge
Prohibited: fraud, reselling service
Link: https://www.verizon.com/terms/`);
    }
    res.status(200).json({ ok: true, carrier: payload.carrier, normalized: payload });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}

function normalize(text) {
  const lower = text.toLowerCase();
  return {
    carrier: (/verizon|at&t|cricket/.exec(lower)||['unknown'])[0],
    effectiveDate: (text.match(/(\d{4}-\d{2}-\d{2})/)||[])[1] || null,
    fees: snippet(lower, /(fee|charge|surcharge)/g),
    prohibited: snippet(lower, /(prohibit|forbid|not allowed|fraud)/g),
    links: Array.from(text.matchAll(/https?:\/\/\S+/g)).map(m=>m[0]),
    length: text.length
  };
}
function snippet(t, rx){ const i = t.search(rx); return i<0?null:t.slice(i, i+240); }
