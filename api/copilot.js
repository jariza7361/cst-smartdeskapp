export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  try {
    const { prompt } = req.body || {};
    if (!process.env.OPENAI_API_KEY) {
      res
        .status(200)
        .json({
          en: `(demo) You sent: ${prompt || ''}`,
          es: `(demo) Env key missing. Envía: ${prompt || ''}`,
        });
      return;
    }
    // If key exists, still return a stub for now (we'll wire real call in T5)
    res.status(200).json({ en: `(ok) ${prompt || ''}`, es: `(ok) ${prompt || ''}` });
  } catch (e) {
    res.status(500).json({ error: 'Internal error' });
  }
}
