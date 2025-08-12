# CST SmartDesk – v0.4.0

Live desktop/mobile web app for CST escalations. Ships:
- Carrier Hub with **logos** (desktop & mobile)
- **Copilot Denials** generator (Serve → Solve → Sell + Rebuttal, bilingual EN/ES)
- **SmartDrop** queue (server stub)
- **T&C fetch** test for Verizon PDF
- Settings (themes, bilingual default, reopen profile)
- Strong CSP headers

## Files
- `index.html` – UI layout, modals, drawer, tray
- `app.js` – state, events, Copilot client, tests
- `api/copilot.js` – server denials engine
- `api/tnc-fetch.js` – fetches PDF meta (sha256/last-modified)
- `api/smartdrop-queue.js` – SmartDrop stub
- `public/assets/*.svg` – carrier logos
- `vercel.json` – security headers

## Denials codes (v1)
`no_enrollment`, `no_ins_at_tol`, `no_airtime`, `preexisting_damage`, `active_imei_after_loss`, `model_not_in_use_at_tol`, `eopa`

Use in Copilot: `denial: no_airtime (att)` or free text like “claim denied for no airtime at at&t”.

## Mobile/UX
- Tap ☰ to open drawer → logos (Verizon/AT&T/Cricket)
- Output tray anchored bottom (copy button)
- Tests in **🧪 Developer Tests** modal

## Security
Content-Security-Policy is strict; all scripts/styles are local.

## Roadmap
- SmartDrop background extractors + Admin “Approve to DB”
- Full carrier library + scraping jobs
- More themes & accessibility modes