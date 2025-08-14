import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const HOST = '127.0.0.1';
const PORT = process.env.PORT ? Number(process.env.PORT) : 4173;
const ROOT = process.cwd();

const TYPES = {
  '.html':'text/html; charset=utf-8',
  '.js':'application/javascript; charset=utf-8',
  '.mjs':'application/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8',
  '.svg':'image/svg+xml',
  '.json':'application/json; charset=utf-8',
  '.png':'image/png',
  '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg'
};

function send(res, code, body, type='text/plain; charset=utf-8') {
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(body);
}

function serveFile(res, filePath) {
  try {
    const ext = path.extname(filePath);
    const data = fs.readFileSync(filePath);
    send(res, 200, data, TYPES[ext] || 'application/octet-stream');
  } catch {
    send(res, 404, 'Not found');
  }
}

const server = http.createServer((req, res) => {
  const { pathname } = url.parse(req.url || '/');

  // Rewrites to match Vercel behavior
  if (pathname === '/app.js') {
    return serveFile(res, path.join(ROOT, 'public', 'app.js'));
  }
  if (pathname?.startsWith('/assets/')) {
    return serveFile(res, path.join(ROOT, 'public', pathname));
  }
  if (pathname?.startsWith('/utils/')) {
    return serveFile(res, path.join(ROOT, 'public', pathname));
  }

  // Minimal API stubs to keep tests happy if hit
  if (pathname === '/api/fetch' && req.method === 'GET') {
    return send(res, 200, JSON.stringify({ ok:true, url:'about:blank', contentType:'text/plain', lastModified:null, bytes:0, sha256:'dev' }), 'application/json');
  }
  if (pathname === '/api/copilot' && req.method === 'POST') {
    let body=''; req.on('data',c=> body+=c); req.on('end',()=>{
      const demo = {
        en: 'Thanks for reaching out. Here’s the plan to resolve this now. (dev)',
        es: 'Gracias por contactarnos. Este es el plan para resolverlo ahora. (dev)',
        followups: [
          'Does that plan work for you? I can start now.',
          'If anything changes, please let me know here.',
          'Once completed, I’ll confirm resolution in this chat.'
        ],
        resolution_target: 5,
        checked_categories: ['Professional Greeting','Clear Next Steps'],
        red_flags: []
      };
      send(res, 200, JSON.stringify(demo), 'application/json');
    });
    return;
  }

  // Default: serve index.html at /
  if (pathname === '/' || pathname === '/index.html') {
    const indexPath = path.join(ROOT, 'index.html');
    if (fs.existsSync(indexPath)) return serveFile(res, indexPath);
    return send(res, 404, 'index.html not found');
  }

  // Fall back to plain file from repo root
  const p = path.join(ROOT, pathname.replace(/^\/+/, ''));
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return serveFile(res, p);

  // Otherwise 404
  send(res, 404, 'Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`[dev] http://${HOST}:${PORT} (serving index.html, /app.js → /public/app.js)`);
});

