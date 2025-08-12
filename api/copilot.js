// api/copilot.js — placeholder
export default async function handler(req, res){
  if(req.method !== 'POST'){
    res.setHeader('Allow','POST');
    return res.status(405).json({ error:'Method not allowed' });
  }
  const { prompt, lang } = req.body || {};
  return res.status(200).json({
    ok:true,
    message:`Copilot placeholder ready (lang=${lang||'en'})`,
    echo: prompt ? String(prompt).slice(0,200) : null
  });
}
