#!/usr/bin/env bash

# Path Scanner Script
# Wrapper script to run path-scanner CLI

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Check if dist exists
if [ ! -d "$SKILL_DIR/dist" ]; then
  echo "Error: dist directory not found. Run 'pnpm run build' first." >&2
  exit 1
fi

# Run path-scanner
node "$SKILL_DIR/dist/index.js" "$@"
