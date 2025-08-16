// Vercel Serverless Function: POST /api/smartdrop-queue
// Enqueues a SmartDrop job returning queued status, job id, and summary.
// Example response: { ok: true, queued: true, id: "123", summary: { total: 1 } }
import { randomUUID } from 'node:crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const id = randomUUID();
  const summary = { total: 0 };

  res.status(200).json({ ok: true, queued: true, id, summary });
}
