---
name: seo-analyzer
description: Analyzes HTML files for SEO issues using static analysis with cheerio. Checks meta tags, Open Graph, Twitter Cards, heading structure, and JSON-LD structured data. Use when user mentions "SEO check", "meta tags", "og tags", "structured data validation", "SEO audit", or wants to analyze HTML/JSX for SEO compliance.
---

# SEO Analyzer

Static SEO analysis for HTML files using cheerio-based parsing. Validates meta tags, social media tags, heading structure, and structured data.

## Analysis Workflow

1. **Parse HTML** with cheerio
2. **Check Critical Issues** (P0):
   - Title tag presence and length
   - Meta description presence and length
   - Single H1 tag
   - Canonical URL
3. **Check Important Issues** (P1):
   - Robots meta directives
   - Viewport meta
   - Heading hierarchy
   - Lang attribute
4. **Check Recommended** (P2):
   - Open Graph tags
   - Twitter Cards
   - JSON-LD structured data
   - Hreflang tags
5. **Generate Report** with issues and recommendations

## Usage

### Run Analysis Script

```bash
# Analyze a single HTML file
bash ${CLAUDE_PLUGIN_ROOT}/skills/seo-analyzer/scripts/run-seo-analyzer.sh path/to/file.html

# Output JSON format
bash ${CLAUDE_PLUGIN_ROOT}/skills/seo-analyzer/scripts/run-seo-analyzer.sh path/to/file.html --json
```

### Direct Node.js Usage

```bash
# Install dependencies first
cd ${CLAUDE_PLUGIN_ROOT}/skills/seo-analyzer && npm install

# Run analyzer
node ${CLAUDE_PLUGIN_ROOT}/skills/seo-analyzer/scripts/analyze-seo.js path/to/file.html
```

## Check Items

### P0 - Critical (Indexing/Ranking Impact)

| Check | Validation | Impact |
|-------|------------|--------|
| Title | Exists, 30-60 chars | Search display |
| Description | Exists, 70-160 chars | Click-through rate |
| H1 | Exactly one | Content hierarchy |
| Canonical | Exists, valid URL | Duplicate content |

### P1 - Important (SEO Quality)

| Check | Validation | Impact |
|-------|------------|--------|
| Robots | No unintended noindex | Indexing |
| Viewport | Exists | Mobile SEO |
| Heading order | h1→h2→h3 sequence | Structure |
| Lang | Exists on html | i18n SEO |

### P2 - Recommended (Social/Rich Results)

| Check | Validation | Impact |
|-------|------------|--------|
| og:title | Exists, ≤95 chars | Social sharing |
| og:description | Exists | Social sharing |
| og:image | Exists, valid URL | Social sharing |
| twitter:card | Exists | Twitter display |
| JSON-LD | Valid schema | Rich results |

## Output Format

### Text Report

```
# SEO Analysis Report: index.html

## Summary
- Critical: 1
- Important: 2
- Recommended: 3

## Critical Issues (P0)

### 1. Missing Meta Description
**Problem**: No meta description found
**Impact**: Poor click-through rate in search results
**Fix**: Add <meta name="description" content="Your description here">

## Important Issues (P1)
...
```

### JSON Output

```json
{
  "file": "index.html",
  "timestamp": "2024-01-15T10:00:00Z",
  "summary": {
    "critical": 1,
    "important": 2,
    "recommended": 3,
    "passed": 8
  },
  "issues": [
    {
      "severity": "critical",
      "check": "meta-description",
      "message": "Missing meta description",
      "fix": "Add <meta name=\"description\" content=\"...\">"
    }
  ],
  "passed": [
    {
      "check": "title",
      "value": "Page Title - Brand",
      "length": 18
    }
  ]
}
```

## Detection Features

### React/SPA Detection

The analyzer detects client-side rendered applications and adjusts confidence:

- Presence of `#root` or `#app` container
- React/Vue/Angular script references
- Empty body with JavaScript bundles

When detected, a warning is added that static analysis may not reflect the rendered page.

### Framework-Specific Patterns

For JSX/TSX files, the analyzer looks for:

- `next/head` imports (Next.js)
- `Helmet` component (React Helmet)
- `meta` function exports (Remix)

## Keyword Analysis

Optional keyword analysis using `keyword-analyzer.js`:

```bash
node ${CLAUDE_PLUGIN_ROOT}/skills/seo-analyzer/scripts/keyword-analyzer.js file.html
```

Outputs:
- Primary keywords detected
- Keyword placement (title, h1, description)
- Keyword density

## Integration with Lookup

For detailed guidance on any issue, reference the seo-lookup skill:

```bash
# Look up og:image requirements
cat ${CLAUDE_PLUGIN_ROOT}/skills/seo-lookup/seo-index.json | jq '.["og-tags"]["og:image"]'

# Look up Article schema
cat ${CLAUDE_PLUGIN_ROOT}/skills/seo-lookup/structured-data-index.json | jq '.schemas.Article'
```

## External Validation

After fixing issues, validate with:

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
