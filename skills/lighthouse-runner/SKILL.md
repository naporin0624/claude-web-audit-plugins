---
name: lighthouse-runner
description: Runs Google Lighthouse audits using Puppeteer for SEO, Performance, Accessibility, and Best Practices scoring. Supports both URLs and local HTML files. Use when user mentions "Lighthouse", "page speed", "performance audit", "Core Web Vitals", "CWV", or needs comprehensive web performance analysis.
---

# Lighthouse Runner

Runs Google Lighthouse audits via Puppeteer for comprehensive web quality assessment including SEO, Performance, Accessibility, and Best Practices.

## Features

- **URL Analysis**: Direct analysis of live URLs
- **Local File Support**: Automatically starts a local server for HTML files
- **Multiple Categories**: SEO, Performance, Accessibility, Best Practices
- **JSON Output**: Machine-readable results for integration
- **Core Web Vitals**: LCP, FID, CLS metrics

## Usage

### Run Analysis

```bash
# Analyze a URL
bash ${CLAUDE_PLUGIN_ROOT}/skills/lighthouse-runner/scripts/run-lighthouse.sh https://example.com

# Analyze a local HTML file
bash ${CLAUDE_PLUGIN_ROOT}/skills/lighthouse-runner/scripts/run-lighthouse.sh path/to/file.html

# Analyze a development server
bash ${CLAUDE_PLUGIN_ROOT}/skills/lighthouse-runner/scripts/run-lighthouse.sh http://localhost:3000

# Output JSON format
bash ${CLAUDE_PLUGIN_ROOT}/skills/lighthouse-runner/scripts/run-lighthouse.sh https://example.com --json

# Specify categories
bash ${CLAUDE_PLUGIN_ROOT}/skills/lighthouse-runner/scripts/run-lighthouse.sh https://example.com --categories=seo,accessibility
```

### Direct Node.js Usage

```bash
# Install dependencies first
cd ${CLAUDE_PLUGIN_ROOT}/skills/lighthouse-runner && npm install

# Run with Node.js
node ${CLAUDE_PLUGIN_ROOT}/skills/lighthouse-runner/scripts/run-lighthouse.js https://example.com
```

## Output Scores

| Category | Description | Key Metrics |
|----------|-------------|-------------|
| **Performance** | Page load speed | LCP, FID, CLS, TTFB, Speed Index |
| **SEO** | Search engine optimization | Meta tags, crawlability, mobile |
| **Accessibility** | WCAG compliance | Color contrast, ARIA, keyboard |
| **Best Practices** | Web standards | HTTPS, console errors, image aspect |

## Score Interpretation

| Score | Rating | Action |
|-------|--------|--------|
| 90-100 | Good (Green) | Maintain |
| 50-89 | Needs Improvement (Orange) | Optimize |
| 0-49 | Poor (Red) | Priority fix |

## Output Format

### Text Report

```
# Lighthouse Report: https://example.com

## Scores
- Performance:   85/100 ⬛⬛⬛⬛⬛⬛⬛⬛⬜⬜
- SEO:           95/100 ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬜
- Accessibility: 78/100 ⬛⬛⬛⬛⬛⬛⬛⬜⬜⬜
- Best Practices: 92/100 ⬛⬛⬛⬛⬛⬛⬛⬛⬛⬜

## Core Web Vitals
- LCP (Largest Contentful Paint): 2.1s ✓
- FID (First Input Delay): 45ms ✓
- CLS (Cumulative Layout Shift): 0.05 ✓

## Top Issues

### Performance
1. Eliminate render-blocking resources
2. Serve images in next-gen formats

### SEO
1. Document doesn't have a meta description
```

### JSON Output

```json
{
  "url": "https://example.com",
  "timestamp": "2024-01-15T10:00:00Z",
  "scores": {
    "performance": 85,
    "seo": 95,
    "accessibility": 78,
    "best-practices": 92
  },
  "metrics": {
    "lcp": 2100,
    "fid": 45,
    "cls": 0.05,
    "ttfb": 320,
    "speedIndex": 3200
  },
  "audits": {
    "performance": [...],
    "seo": [...],
    "accessibility": [...],
    "best-practices": [...]
  }
}
```

## Local File Analysis

When analyzing local HTML files, the runner:

1. Starts a temporary HTTP server using `serve`
2. Runs Lighthouse against the local URL
3. Shuts down the server after analysis
4. Returns results

Note: Local file analysis may not accurately reflect production performance due to:
- No network latency
- No server response time
- Missing CDN optimization

## Next.js/Remix Support

For JavaScript frameworks, analyze the running development or production server:

```bash
# Start your dev server first
npm run dev  # Starts at http://localhost:3000

# Then run Lighthouse against it
bash run-lighthouse.sh http://localhost:3000

# For production build analysis
npm run build && npm run start
bash run-lighthouse.sh http://localhost:3000
```

## Integration with Other Skills

### Combined SEO Audit

For comprehensive SEO analysis:

1. **Static Analysis** (seo-analyzer): Quick meta tag and structure check
2. **Runtime Analysis** (lighthouse-runner): Performance and rendered page check
3. **Lookup Reference** (seo-lookup): Guidance for fixing issues

```bash
# Run static analysis first (fast)
bash ${CLAUDE_PLUGIN_ROOT}/skills/seo-analyzer/scripts/run-seo-analyzer.sh file.html

# Then run Lighthouse (slower but comprehensive)
bash ${CLAUDE_PLUGIN_ROOT}/skills/lighthouse-runner/scripts/run-lighthouse.sh http://localhost:3000
```

## Requirements

- Node.js 18+
- Chrome/Chromium browser (installed automatically with Puppeteer)
- Sufficient memory for headless Chrome (~500MB)

## Troubleshooting

### Chrome Not Found

If Puppeteer can't find Chrome:

```bash
# Install Chromium via Puppeteer
cd ${CLAUDE_PLUGIN_ROOT}/skills/lighthouse-runner
npx puppeteer browsers install chrome
```

### Timeout Issues

For slow pages, increase the timeout:

```bash
node run-lighthouse.js https://slow-site.com --timeout=120
```

### WSL/Linux Issues

On WSL or headless Linux, you may need additional dependencies:

```bash
# Install required libraries
sudo apt-get install -y libxss1 libatk-bridge2.0-0 libgtk-3-0
```

## External Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [PageSpeed Insights](https://pagespeed.web.dev/)
