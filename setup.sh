#!/usr/bin/env bash
set -euo pipefail
if [ -f package-lock.json ]; then
  npm ci --no-audit --fund=false
else
  # Do not create/modify lockfile here; just install without writing
  npm i --no-audit --fund=false --no-package-lock || true
fi
# Try to make Playwright available; ignore failures in Codex sandbox
npx playwright install --with-deps >/dev/null 2>&1 || true

# Ensure public assets exist
mkdir -p public
test -f public/highlights.json || echo "[]" > public/highlights.json
if [ -f public/favicon.ico.b64 ]; then
  base64 -d public/favicon.ico.b64 > public/favicon.ico
fi
