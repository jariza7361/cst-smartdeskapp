import express from 'express';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const app = express();
const PORT = process.env.PORT || 4173;
app.use((req,res,next)=>{
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.openai.com; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('Permissions-Policy','geolocation=(), microphone=(), camera=(), clipboard-read=(self), clipboard-write=(self)');
  next();
});
app.use(express.json({limit:'1mb'}));
app.use('/public', express.static(path.join(root,'public')));
app.use('/assets', express.static(path.join(root,'public','assets')));
app.use('/utils',  express.static(path.join(root,'public','utils')));
app.get('/app.js', (req,res)=>res.sendFile(path.join(root,'public','app.js')));
app.all('/api/:fn', async (req,res,next)=>{
  try{
    const file = path.join(root,'api',`${req.params.fn}.js`);
    const mod = await import(pathToFileURL(file).href);
    if(typeof mod.default!=='function'){ res.status(500).json({error:'Invalid API handler'}); return; }
    await mod.default(req,res);
  }catch(e){ next(e); }
});
app.get('/', (req,res)=>res.sendFile(path.join(root,'index.html')));
app.use(express.static(root));
app.use((req,res)=>res.status(404).send('Not found'));
app.listen(PORT, ()=>console.log(`Dev server at http://localhost:${PORT}`));
