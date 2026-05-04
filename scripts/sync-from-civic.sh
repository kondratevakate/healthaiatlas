#!/usr/bin/env bash
# DEPRECATED — do not run.
#
# As of 2026-05-03, frontend/ is the source of truth for HealthAI Atlas.
# This script previously rsynced ../civic-design-compass into frontend/ with
# `--delete`, which would now wipe project-specific work (the AI Frontiers
# in Life Sciences hub, the cleanup of orphan routes, the Discovery Copilot
# feature gate, and other healthaiatlas-only changes).
#
# Lovable / civic-design-compass is no longer the upstream. Edit frontend/
# directly and ship through the normal git flow.
#
# This file is kept (rather than deleted) so older bookmarks and pipeline
# references find a clear "do not run" message instead of a missing-file
# error. Delete it once nothing references it anymore.

set -e

cat <<'EOF' >&2

  sync-from-civic.sh is DEPRECATED.

  frontend/ is now the source of truth for HealthAI Atlas. Running this
  script would overwrite project-specific work (it used rsync --delete).

  Edit frontend/ directly and commit. See AGENTS.md ("Repo layout") for
  the current workflow.

EOF

exit 1
