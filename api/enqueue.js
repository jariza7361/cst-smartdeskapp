// api/enqueue.js
// Minimal “background queue” stub for Vercel serverless.
// Stores jobs in-memory per instance and simulates async extraction.

globalThis.__JOBS ||= new Map();

function simulateExtraction(name, ext, base64) {
  // VERY light "extraction" to keep cold-start tiny.
  // Replace with real PDF/Office libs in a future iteration.
  if (ext === 'pdf') {
    return `PDF file "${name}" received (${Math.round((base64.length*3/4)/1024)} KB). [Server extractor stub: text extraction would go here]`;
  }
  if (['doc','docx','pptx','xlsx'].includes(ext)) {
    return `Office file "${name}" received. [Server extractor stub: convert & extract text later]`;
  }
  return `Unsupported type "${ext}" processed as generic blob (${base64.length} base64 chars).`;
}

export default async function handler(req, res){
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try{
    const { name, ext, data } = req.body || {};
    if (!name || !ext || !data) return res.status(400).json({ error:'name, ext, data required' });

    const jobId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    __JOBS.set(jobId, { status:'queued' });

    // “Background” simulate with setTimeout
    setTimeout(()=>{
      try{
        __JOBS.set(jobId, { status:'processing' });
        const result = simulateExtraction(name, String(ext).toLowerCase(), data);
        // small delay to show polling UX
        setTimeout(()=>{
          __JOBS.set(jobId, { status:'done', result });
        }, 400);
      }catch(err){
        __JOBS.set(jobId, { status:'error', error: String(err?.message||err) });
      }
    }, 100);

    return res.status(202).json({ jobId });
  }catch(e){
    return res.status(500).json({ error:String(e?.message||e) });
  }
}