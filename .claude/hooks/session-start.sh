#!/bin/bash
set -euo pipefail

# Só roda em sessões remotas (Claude Code na web)
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
npm install --no-audit --no-fund
