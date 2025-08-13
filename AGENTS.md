# AGENTS.md — CST SmartDesk (cst-smartdeskapp)

## Prime Directives
- **Security/CSP:** No external scripts or CDNs; never use `document.write`; sanitize all inputs; no unescaped `</script>`.
- **Zero layout drift:** Preserve design tokens and layout; any intentional visual change must update snapshots.
- **Bilingual engine:** Any new user-facing copy MUST provide `{ en, es }`. Do not switch UI language unless the user toggles it.
- **House paths:** Frontend script is **`/public/app.js`** (served as `/app.js` via rewrites). Assets live under `/public/assets`. Serverless under `/api/**`.

## Environment
- **Node:** 20.x
- **ESM:** `"type": "module"`
- **No network** in tests unless the task requires it and is self-contained.

## Commands
- **Lint:** `npm run lint`  (must pass with **0 warnings**)
- **Format:** `npm run format`
- **Unit tests:** `npm run test`
- **E2E:** `npm run e2e`
- **E2E (Codex):** `npm run e2e:codex`
- **E2E (update snapshots):** `npm run e2e:update` *(only for intentional visual changes)*
- **Dev server (local smoke):** `npm run serve`

## Verification (run before finishing any task)
1) `npm run lint` → **PASS with 0 warnings**.
2) `npm run test` → **PASS**.
3) `npm run e2e:codex` → **PASS** or prints note when browsers unavailable.
4) **4-point URL smoke:** `/`, `/app.js`, `/assets/logo.svg`, `/api/fetch` reachable locally.
5) **i18n coverage:** All added strings exist in both `i18n/en.json` and `i18n/es.json`.
6) **CSP:** No `securitypolicyviolation` events during a basic route tour.

## Task Splitting
- Break large work into atomic subtasks: **UI → API → tests → i18n → docs**.
- Keep diffs minimal; refactor only what the subtask needs and cover with tests.

## Debugging & Self-Heal
- If tests fail, prefer targeted fixes and stabilizing selectors (use `getByRole`, visibility checks). **Do not** add arbitrary timeouts.
- For `/app.js` path issues, **do not move files** out of `/public`; use the existing **rewrites** in `vercel.json`.

## Allowed Files to Modify
- `/public/**` (frontend code, utils, styles),  
- `/api/**` (serverless functions),  
- `/i18n/*.json`,  
- `/tests/**`, `/e2e/**`, `playwright.config.*`, `vitest.config.*`,  
- `vercel.json`, `package.json`, `README.md`, `AGENTS.md`.

## PR Template (include in PR description)
- **Summary:** What changed & why (1–3 bullets).  
- **Checks:** Lint / Unit / E2E status lines.  
- **Security/CSP:** Note confirming no external scripts and CSP compliance.  
- **i18n:** Keys added/updated.  
- **Verification log:** Commands run + pass results.  
