# CST SmartDesk — Baseline

**Single clean deploy rules:**
- `index.html` at repo root
- Client JS at `/app.js` (referenced as `<script src="app.js" defer>`)
- Logos in `/assets`
- Serverless endpoints in `/api` (Node on Vercel)

## Deploy steps
1. Commit these files.
2. Push to GitHub → Vercel auto-deploys.
3. Smoke test:
   - `/` loads UI
   - `/app.js` returns JS (200)
   - `/assets/verizon.svg` returns logo (200)
   - `/api/fetch?url=https%3A%2F%2Fwww.asurion.com%2Fpdf%2Fnw-consumer-vmp-25%2F` returns JSON with `"ok": true` or a clear error

## Why 404 happened before
- The page asked for `/app.js`, but the file lived in a `public` folder that wasn’t served at the domain root.
- Moving `app.js` next to `index.html` and referencing it relatively ensures the script loads.

## Editing policy
- Always update whole files when requested (no piecemeal).
- Keep inline HTML/CSS; all JS in `app.js`.
- API code only under `/api`.