import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname.startsWith('/api/')) {
    try {
      req.query = Object.fromEntries(url.searchParams.entries());
      res.status = code => { res.statusCode = code; return res; };
      res.json = obj => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(obj));
      };
      const mod = await import(pathToFileURL(join(root, 'api', url.pathname.slice(5) + '.js')));
      return mod.default(req, res);
    } catch {
      res.statusCode = 404;
      res.end('Not Found');
      return;
    }
  }

  let filePath;
  if (url.pathname === '/' || url.pathname === '/index.html') {
    filePath = join(root, 'index.html');
  } else if (url.pathname === '/app.js') {
    filePath = join(root, 'public', 'app.js');
  } else if (url.pathname.startsWith('/utils/')) {
    filePath = join(root, 'public', 'utils', url.pathname.slice('/utils/'.length));
  } else {
    filePath = join(root, 'public', url.pathname);
  }

  try {
    const data = await readFile(filePath);
    const ext = extname(filePath).slice(1);
    const types = { js: 'text/javascript', html: 'text/html', svg: 'image/svg+xml', json: 'application/json' };
    res.setHeader('Content-Type', types[ext] || 'text/plain');
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

const port = process.env.PORT || 4173;
server.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});
