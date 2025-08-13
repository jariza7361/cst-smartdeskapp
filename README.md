# CST SmartDesk — Baseline

- Frontend entry: `/public/app.js` (referenced as `/app.js`)
- Strict CSP via `vercel.json`
- Setup Wizard, Tests modal, System Status hooks
- Bilingual scaffolding: `/i18n/en.json`, `/i18n/es.json`
- Serverless: `GET /api/fetch`, `POST /api/copilot`

## Copilot panel

- Prompts combine a selected sample, free-form text, and optional `CONTEXT_JSON` from the preview panel.
- Samples live in `/public/copilot-prompts.json`; add new entries with `{ id, label, prompt }`.
- Requires server-side `OPENAI_API_KEY`; when missing, the UI stays visible and hints about the key.

## Dev

```bash
npm i
npm run test
npm run e2e
npm run dev   # open http://localhost:4173
```

### Smoke test

- `/` → 200
- `/app.js` → 200
- `/assets/logo.svg` → 200
- `/api/fetch` → 200 JSON

## Deploy (Vercel)

- Add env var `OPENAI_API_KEY`
- Optional: `OPENAI_MODEL`, `TOS_URL`
