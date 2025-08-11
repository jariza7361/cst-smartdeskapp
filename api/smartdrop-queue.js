
// api/smartdrop-queue.js
// Stub endpoint: accepts names/text and returns a queued id

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });
  const body = req.body || {};
  const id = 'q_' + Math.random().toString(36).slice(2,9);
  // In the future: push to a real queue / storage
  return res.status(200).json({ queued: true, id, summary: { names: body.names || [], textBytes: (body.text||'').length } });
}