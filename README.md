# CST SmartDesk (static + serverless on Vercel)

## Layout
- `index.html` — root page (loads `/app.js`, shows UI)
- `public/app.js` — browser code (EN/ES, self-audit, DnD TXT, PDF placeholder)
- `public/assets/*` — carrier logos + favicon
- `api/*` — serverless routes (`healthz`, `fetch`, `tnc-fetch`)
- `vercel.json` — rewrites (`/app.js`, `/assets/*`) + CSP, security headers

## Quick verify
1) Open `/app.js`: `https://<your>.vercel.app/app.js` → 200 OK.
2) Open a logo: `https://<your>.vercel.app/assets/verizon.svg` → 200 OK.
3) Home loads → click **Status** → server + browser checks render.
4) **Tests** → **Fetch Verizon T&C PDF** → JSON appears.

## Notes
- Single script include: `<script src="/app.js" defer></script>` (rewritten to `/public/app.js` by vercel.json).
- DnD TXT parsing works now. PDF extraction is a placeholder; we can enable PDF.js next if you want.
