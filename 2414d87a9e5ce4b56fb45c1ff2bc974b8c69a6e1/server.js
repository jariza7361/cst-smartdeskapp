import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Allow 'unsafe-eval' for Vite in local development (CSP workaround)
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "script-src 'self' 'unsafe-eval'");
  next();
});

// Serve static assets in /public (for /copilot-prompts.json, /highlights.json, images, etc.)
app.use(express.static(path.resolve(__dirname, 'public')));

// API routes
app.use('/api/copilot', (await import('./api/copilot.js')).default);
app.use('/api/fetch', (await import('./api/fetch.js')).default);

// Vite dev server as middleware
const vite = await createViteServer({
  server: { middlewareMode: 'html' },
});
app.use(vite.middlewares);

// Fallback to index.html for SPA, letting Vite inject dev scripts
app.use('*', async (req, res, next) => {
  try {
    const url = req.originalUrl;
    const indexPath = path.resolve(__dirname, 'index.html');
    let template = fs.readFileSync(indexPath, 'utf-8');
    template = await vite.transformIndexHtml(url, template);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).end(template);
  } catch (e) {
    vite?.ssrFixStacktrace?.(e);
    next(e);
  }
});

// Start server with port fallback if 3000 is in use
const startPort = Number(process.env.PORT) || 3000;
function listenWithRetry(port, tries = 10) {
  const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
  server.on('error', (err) => {
    if (err?.code === 'EADDRINUSE' && tries > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} in use, retrying on ${nextPort}...`);
      setTimeout(() => listenWithRetry(nextPort, tries - 1), 200);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
}
listenWithRetry(startPort);
