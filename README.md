# CST SmartDesk — Baseline

- Frontend entry: `/public/app.js` (referenced as `/app.js`)
- Strict CSP via `vercel.json`
- Setup Wizard, Tests modal, System Status hooks
- Bilingual scaffolding: `/i18n/en.json`, `/i18n/es.json`
- Serverless: `GET /api/fetch`, `POST /api/copilot`

## Dev
```bash
npm i
npm run test
npm run e2e
npm run serve  # open http://localhost:4173
```

## Deploy (Vercel)

* Add env var `OPENAI_API_KEY`
* Optional: `OPENAI_MODEL`, `TOS_URL`
