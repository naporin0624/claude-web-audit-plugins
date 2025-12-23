#!/bin/bash

# SEO Analyzer wrapper script
# Usage: run-seo-analyzer.sh <file.html> [--json] [--keywords]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"

# Check if node_modules exists, install if not
if [ ! -d "$SKILL_DIR/node_modules" ]; then
    echo "Installing dependencies..." >&2
    (cd "$SKILL_DIR" && npm install --silent)
fi

# Parse arguments
FILE=""
JSON_FLAG=""
KEYWORDS_ONLY=""

for arg in "$@"; do
    case $arg in
        --json)
            JSON_FLAG="--json"
            ;;
        --keywords)
            KEYWORDS_ONLY="true"
            ;;
        *)
            if [ -z "$FILE" ]; then
                FILE="$arg"
            fi
            ;;
    esac
done

# Validate file argument
if [ -z "$FILE" ]; then
    echo "Usage: run-seo-analyzer.sh <file.html> [--json] [--keywords]" >&2
    echo "" >&2
    echo "Options:" >&2
    echo "  --json       Output in JSON format" >&2
    echo "  --keywords   Run keyword analysis instead of SEO check" >&2
    exit 1
fi

if [ ! -f "$FILE" ]; then
    echo "Error: File not found: $FILE" >&2
    exit 1
fi

# Run the appropriate analyzer
if [ -n "$KEYWORDS_ONLY" ]; then
    node "$SCRIPT_DIR/keyword-analyzer.js" "$FILE" $JSON_FLAG
else
    node "$SCRIPT_DIR/analyze-seo.js" "$FILE" $JSON_FLAG
fi
