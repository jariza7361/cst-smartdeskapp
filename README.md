# CST SmartDesk — Baseline

**Single clean deploy rules:**
- `index.html` at repo root
- Client JS at `/public/app.js` (referenced as `<script src="/app.js" defer>`)
- Logos in `/public/assets`
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
- The page asked for `/app.js`, but the file wasn’t in `/public/app.js`. Vercel serves `/public` at `/`.
- Having `app.js` in root or another folder won’t satisfy `/app.js`.

## Editing policy
- Always update whole files when requested (no piecemeal).
- Keep inline HTML/CSS; all JS in `/public/app.js`.
- API code only under `/api`.