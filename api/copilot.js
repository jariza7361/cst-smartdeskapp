// POST /api/copilot  { prompt, lang }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { prompt = '', lang = 'en' } = req.body || {};
    // Placeholder – returns the prompt back for now
    return res.status(200).json({
      ok: true,
      text: `[${lang.toUpperCase()}] Copilot placeholder response.\n\nYou asked: ${prompt}`
    });
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message || String(e) });
  }
}