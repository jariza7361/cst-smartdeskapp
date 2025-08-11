// Vercel Serverless Function placeholder for future AI integrations
export default async function handler(req, res) {
  // Basic CORS for browser POSTs (tighten later as needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Simple echo + health payload
  return res.status(200).json({
    ok: true,
    service: 'cst-smartdesk /api/copilot',
    received: req.body || null,
    hint: 'Replace this with actual AI call (OpenAI, etc.) later.'
  });
}
