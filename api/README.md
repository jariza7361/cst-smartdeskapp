# CST SmartDesk (starter)

Deployed on Vercel as a static site with a single serverless API route: `/api/copilot`.

## Files
- `index.html` – minimal HTML shell
- `app.js` – UI shell + a small Deep Audit button + API ping
- `api/copilot.js` – serverless function placeholder for AI
- `vercel.json` – security headers (CSP, etc.)
- `README.md` – you’re reading this 🙂

## Deploy (once files are in GitHub)
1. Go to **vercel.com → Add New → Project**.
2. Pick the `cst-smartdeskapp` repo.
3. Framework preset: **Other** (no build command).
4. Output directory: **/** (leave blank works too).
5. Deploy.  
Vercel gives you a free URL like `https://cst-smartdeskapp.vercel.app`.

## Test after deploy
- Open the URL → tap **Ping API** → you should see JSON with `ok: true`.
- Tap **Deep Audit** → should show “✅ Deep Audit: OK”.

## Next steps
- Replace `/api/copilot.js` with real AI calls (OpenAI) and add secrets in Vercel → **Project → Settings → Environment Variables**.
- Grow `app.js` into the full SmartDesk UI.
