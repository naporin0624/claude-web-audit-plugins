#!/bin/bash

# Lighthouse Runner wrapper script
# Usage: run-lighthouse.sh <url|file> [--json] [--categories=...]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Check if node_modules exists, install if not
if [ ! -d "$SKILL_DIR/node_modules" ]; then
    echo "Installing dependencies (this may take a while)..." >&2
    (cd "$SKILL_DIR" && npm install --silent)
fi

# Validate at least one argument
if [ $# -eq 0 ]; then
    echo "Usage: run-lighthouse.sh <url|file> [options]" >&2
    echo "" >&2
    echo "Options:" >&2
    echo "  --json                 Output in JSON format" >&2
    echo "  --timeout=<seconds>    Timeout in seconds (default: 60)" >&2
    echo "  --categories=<list>    Comma-separated categories" >&2
    echo "                         (performance,seo,accessibility,best-practices)" >&2
    echo "" >&2
    echo "Examples:" >&2
    echo "  run-lighthouse.sh https://example.com" >&2
    echo "  run-lighthouse.sh ./index.html" >&2
    echo "  run-lighthouse.sh http://localhost:3000 --json" >&2
    echo "  run-lighthouse.sh https://example.com --categories=seo,accessibility" >&2
    exit 1
fi

# Pass all arguments to the Node.js script
node "$SCRIPT_DIR/run-lighthouse.js" "$@"
