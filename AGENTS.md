# AGENTS.md — CST SmartDesk (cst-smartdeskapp)

## Prime Directives
- Security/CSP: no external scripts or CDNs; never use `document.write`; sanitize inputs; no unescaped `</script>`.
- Zero layout drift: do not change spacing/typography tokens without an explicit task.
- Bilingual engine: any new user-facing copy MUST include `{ en, es }`.
- House paths: frontend loads `/public/app.js`; assets under `/public/assets`; serverless under `/api`.

## Commands
- Lint: `npm run lint`
- Unit: `npm run test`
- E2E: `npm run e2e` (auto starts local server)
- Build: (static site; Vercel handles)

## Verification (run before finishing any task)
1) Lint passes with **0 warnings**.
2) Unit tests pass.
3) E2E smoke passes (and add more if feature touches UI).
4) 4-point URL: `/`, `/app.js`, `/assets/logo.svg`, `/api/fetch` reachable in dev.
5) Bilingual keys added in `i18n/en.json` and `i18n/es.json`.
6) No CSP violations in console during route tour.

## Task Splitting
- Subtasks: UI → API → tests → i18n → docs. Commit/PR per subtask if large.

## PR Template
- Summary, Lint/Test/E2E status, Security/CSP note, i18n keys added, Verification logs.
