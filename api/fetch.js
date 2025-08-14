export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    return;
  }
  const out = {
    ok: true,
    url: 'seed://local',
    contentType: 'text/plain',
    lastModified: null,
    bytes: 0,
    sha256: 'seed',
  };
  res.status(200).json(out);
}
