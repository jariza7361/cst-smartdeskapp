// GET /api/doctor or /api/doctor?check=ocr
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  try {
    async function head(path) {
      try {
        const r = await fetch(path, { method: 'HEAD', cache: 'no-store' });
        return r.ok;
      } catch {
        return false;
      }
    }
    const ocrTargets = [
      '/libs/tesseract/tesseract.min.js',
      '/libs/tesseract/worker.min.js',
      '/libs/tesseract/tesseract-core.wasm',
    ];
    const checks = await Promise.all(ocrTargets.map(async (p) => ({ path: p, ok: await head(p) })));
    const missing = checks.filter((c) => !c.ok).map((c) => c.path);

    const payload = {
      ok: missing.length === 0,
      ocr: {
        ready: missing.length === 0,
        missing,
      },
      notes: [
        'Serverless doctor cannot write files (expected).',
        'Use the local "doctor" script for autofix scaffolding.'
      ],
    };
    return res.status(200).json(payload);
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
}
