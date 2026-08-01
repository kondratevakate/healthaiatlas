#!/usr/bin/env bash
# Bring up the atlas frontend dev server WITHOUT the usual WSL/env traps.
# - .npmrc (omit=) already restores devDeps on `npm install`
# - NODE_ENV must be 'development' or vite dev throws `_jsxDEV is not a function`
set -euo pipefail
cd "$(dirname "$0")"

# One-time dep install if vite binary is missing (covers the global omit=dev trap).
if [ ! -x node_modules/.bin/vite ]; then
  echo "[start-dev] vite missing — installing deps (incl. dev)…"
  npm install
fi

echo "[start-dev] launching vite dev on :8080 (NODE_ENV=development)"
NODE_ENV=development exec npm run dev
