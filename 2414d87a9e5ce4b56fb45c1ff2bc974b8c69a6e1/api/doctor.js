// GET /api/doctor or /api/doctor?check=ocr
export default async function handler(req, res) {
  // Set cache control headers to prevent duplicate requests
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('X-Request-ID', req.headers['x-request-id'] || `doctor-${Date.now()}`);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  
  const requestId = req.headers['x-request-id'] || 'unknown';
  console.log(`[Doctor API] Request ${requestId} started at ${new Date().toISOString()}`);
  
  try {
    async function head(path) {
      try {
        // Build absolute URL for serverless/node fetch when given a relative path
        let url = path;
        if (!/^https?:\/\//i.test(url)) {
          const proto = req.headers['x-forwarded-proto'] || 'https';
          const host = req.headers['x-forwarded-host'] || req.headers.host;
          url = new URL(url, `${proto}://${host}`).toString();
        }
        const r = await fetch(url, { method: 'HEAD', cache: 'no-store' });
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
      requestId, // Include request ID for debugging
    };
    
    console.log(`[Doctor API] Request ${requestId} completed:`, payload);
    return res.status(200).json(payload);
  } catch (e) {
    console.error(`[Doctor API] Request ${requestId} error:`, e);
    return res.status(500).json({ ok: false, error: e.message || String(e), requestId });
  }
}
