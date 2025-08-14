export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const { prompt } = (req.body || {});
    if (!process.env.OPENAI_API_KEY) {
      // Demo path when key is missing — keeps the UI usable in Preview/local
      res.status(200).json({
        en: `(demo) You sent: ${prompt || ''}`,
        es: `(demo) Env key missing. Envía: ${prompt || ''}`
      });
      return;
    }
    // Key present: stub for now (T5 will wire the actual model call)
    res.status(200).json({
      en: `(ok) ${prompt || ''}`,
      es: `(ok) ${prompt || ''}`
    });
  } catch {
    res.status(500).json({ error: 'Internal error' });
  }
}
