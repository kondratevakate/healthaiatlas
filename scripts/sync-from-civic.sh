#!/usr/bin/env bash
# Sync frontend/ with the civic-design-compass Lovable project.
#
# Usage:
#   ./scripts/sync-from-civic.sh                   # uses ../civic-design-compass
#   CIVIC_PATH=/path/to/civic ./scripts/sync-from-civic.sh
#
# After sync, review `git status` / `git diff frontend/`, then commit.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CIVIC="${CIVIC_PATH:-$REPO_ROOT/../civic-design-compass}"

if [[ ! -d "$CIVIC" ]]; then
  echo "civic-design-compass not found at $CIVIC" >&2
  echo "Set CIVIC_PATH env var to the correct location." >&2
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  echo "rsync is required but not installed." >&2
  echo "On Windows, use WSL or git-bash with rsync installed." >&2
  exit 1
fi

echo "Syncing $CIVIC -> $REPO_ROOT/frontend/"

rsync -av --delete \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.lovable' \
  --exclude='README.md' \
  --exclude='bun.lock' \
  --exclude='bun.lockb' \
  "$CIVIC/" "$REPO_ROOT/frontend/"

# Restore healthaiatlas-specific fields in package.json
sed -i.bak \
  -e 's/"name": "vite_react_shadcn_ts"/"name": "healthaiatlas-frontend"/' \
  "$REPO_ROOT/frontend/package.json"
rm -f "$REPO_ROOT/frontend/package.json.bak"

echo
echo "Sync complete. Review changes:"
echo "  git -C $REPO_ROOT status frontend/"
echo "  git -C $REPO_ROOT diff frontend/"
