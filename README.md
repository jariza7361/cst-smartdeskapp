# CST SmartDesk — Baseline

- Frontend entry: `/public/app.js` (referenced as `/app.js`)
- Strict CSP via `vercel.json`
- Setup Wizard, Tests modal, System Status hooks
- Bilingual scaffolding: `src/public/i18n/en.json`, `src/public/i18n/es.json`
- Serverless: `GET /api/fetch`, `POST /api/copilot`
- Carrier logos: `src/public/assets/{verizon,att,cricket}.svg`
- Splash screen persists across sessions; reset with:

  ```js
  localStorage.removeItem('splashSeen');
  location.reload();
  ```

```html
<img src="/assets/verizon.svg" alt="Verizon" />
<img src="/assets/att.svg" alt="AT&T" />
<img src="/assets/cricket.svg" alt="Cricket" />
```

## Copilot panel

- Prompts combine a selected sample, free-form text, and optional `CONTEXT_JSON` from the preview panel.
- Samples live in `src/public/copilot-prompts.json`; add new entries with `{ id, label, prompt }`.
- Requires server-side `OPENAI_API_KEY`; when missing, the UI stays visible and hints about the key.

## Dev

```bash
npm i
npm run test
npm run e2e
npm run serve  # open http://localhost:4173
```

## Deploy (Vercel)

- Add env var `OPENAI_API_KEY`
- Optional: `OPENAI_MODEL`, `TOS_URL`
