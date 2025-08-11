// api/job.js
globalThis.__JOBS ||= new Map();

export default async function handler(req, res){
  const id = String(req.query.id || '');
  if (!id) return res.status(400).json({ error:'id required' });
  const job = __JOBS.get(id);
  if (!job) return res.status(404).json({ error:'not found', status:'error' });
  return res.status(200).json(job);
}