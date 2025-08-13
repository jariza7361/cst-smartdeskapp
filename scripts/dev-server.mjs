import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const app = express();

const headers = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.openai.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy':
    'geolocation=(), microphone=(), camera=(), clipboard-read=(self), clipboard-write=(self)',
};

app.use((req, res, next) => {
  for (const [k, v] of Object.entries(headers)) {
    res.setHeader(k, v);
  }
  next();
});

app.use('/public', express.static(path.join(root, 'public')));
app.use('/assets', express.static(path.join(root, 'public', 'assets')));
app.use('/utils', express.static(path.join(root, 'public', 'utils')));

app.get('/app.js', (req, res) => {
  res.sendFile(path.join(root, 'public', 'app.js'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

app.all('/api/:fn', async (req, res, next) => {
  try {
    const mod = await import(path.join(root, 'api', `${req.params.fn}.js`));
    if (typeof mod.default === 'function') {
      await mod.default(req, res);
    } else {
      res.status(500).json({ error: 'Invalid handler' });
    }
  } catch (e) {
    next(e);
  }
});

const port = process.env.PORT || 4173;
app.listen(port, () => {
  console.log(`dev server running at http://localhost:${port}`);
});
