// api/fetch.js — generic fetch proxy (GET only)
export default async function handler(req, res){
  if(req.method !== 'GET'){
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const url = req.query.url;
  if(!url) return res.status(400).json({ error: 'Missing url' });

  try{
    const r = await fetch(url, { redirect: 'follow' });
    const buf = await r.arrayBuffer();
    const ct = r.headers.get('content-type') || 'application/octet-stream';
    res.status(200).json({
      ok: r.ok, status: r.status, contentType: ct,
      lastModified: r.headers.get('last-modified'),
      bytes: buf.byteLength
    });
  }catch(e){
    res.status(500).json({ error: String(e.message || e) });
  }
}
