export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const requiredEnvs = ['NEXT_PUBLIC_APP_NAME']; // edit to your needs
  const checks = {};
  for (const k of requiredEnvs) checks[`env:${k}`] = { ok: !!process.env[k], detail: process.env[k] ? 'present' : 'missing' };

  res.status(200).json({
    status: 'ok',
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    node: process.version,
    vercel: !!process.env.VERCEL,
    time: new Date().toISOString(),
    checks
  });
}
