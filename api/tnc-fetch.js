// api/tnc-fetch.js — normalized fetch for carrier T&C
const MAP = {
  vzw: 'https://www.asurion.com/pdf/nw-consumer-vmp-25/'
};

export default async function handler(req, res) {
  const carrier = (req.query.carrier || 'vzw').toLowerCase();
  const url = MAP[carrier];
  if (!url) return res.status(400).json({ ok:false, error:'Unknown carrier' });
  try {
    const r = await fetch(`${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/fetch?url=${encodeURIComponent(url)}`);
    const data = await r.json();
    return res.status(200).json({ ok: !!data.ok, carrier, target:url, probe:data });
  } catch (e) {
    return res.status(500).json({ ok:false, error:String(e?.message||e) });
  }
}