export default async function handler(req, res){
  if(req.method !== 'GET'){
    res.setHeader('Allow','GET');
    return res.status(405).json({ error:'Method not allowed' });
  }
  const url = req.query.url;
  if(!url) return res.status(400).json({ error:'Missing url' });
  try{
    const r = await fetch(url, { redirect:'follow' });
    const ct = r.headers.get('content-type') || '';
    const textLike = ct.startsWith('text/');
    let sample = null;

    if(textLike){
      const txt = await r.text();
      sample = txt.slice(0, 1000);
    }

    res.status(200).json({
      ok: r.ok, status: r.status,
      contentType: ct,
      lastModified: r.headers.get('last-modified'),
      sample
    });
  }catch(e){
    res.status(500).json({ error:String(e.message||e) });
  }
}
