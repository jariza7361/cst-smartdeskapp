#!/usr/bin/env bash
set -euo pipefail
npm ci || npm i
npx playwright install chromium --with-deps
