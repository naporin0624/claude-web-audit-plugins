---
name: seo-audit
description: Run comprehensive SEO audit combining static analysis and Lighthouse
args:
  - name: target
    description: File path or URL to analyze
    required: true
  - name: mode
    description: Analysis mode (all, static, lighthouse)
    required: false
    default: all
---

# SEO Audit Command

Runs a comprehensive SEO audit on the specified target using multiple analysis tools.

## Usage

```bash
/seo-audit path/to/file.html           # Full audit (static + lighthouse)
/seo-audit http://localhost:3000       # Lighthouse only (for dev server)
/seo-audit path/to/file.html static    # Static analysis only
/seo-audit https://example.com lighthouse  # Lighthouse only
```

## Execution Flow

Based on the target and mode:

### For HTML Files (default: all)

1. **Static Analysis** (fast, ~1s)
   - Run seo-analyzer for meta tags, headings, OG tags
   - Run keyword-analyzer for keyword placement

2. **Lighthouse Analysis** (slower, ~30s)
   - Start local server
   - Run full Lighthouse audit
   - Report scores and issues

### For URLs (default: lighthouse)

1. **Lighthouse Analysis**
   - Direct URL analysis
   - Performance, SEO, Accessibility, Best Practices

### For Development Servers

```bash
/seo-audit http://localhost:3000
```

Best for Next.js, Remix, and other JSX-based frameworks where static analysis is limited.

## Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                     /seo-audit target                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │    Is target a URL?           │
              └───────────────────────────────┘
                    │               │
                   Yes              No
                    │               │
                    ▼               ▼
          ┌─────────────┐   ┌─────────────────┐
          │  Lighthouse │   │  Static Analysis │
          │    Only     │   │  (seo-analyzer)  │
          └─────────────┘   └─────────────────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │   Lighthouse    │
                            │   (optional)    │
                            └─────────────────┘
                                    │
                                    ▼
                            ┌─────────────────┐
                            │  Combined Report │
                            └─────────────────┘
```

## Output Example

```markdown
# SEO Audit Report

## Target: example.html
Analyzed at: 2024-01-15T10:00:00Z

---

## 1. Static Analysis Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| Important | 2 |
| Recommended | 3 |

### Critical Issues
1. Missing meta description

### Important Issues
1. Title too long (75 chars)
2. Missing viewport meta

---

## 2. Lighthouse Scores

| Category | Score |
|----------|-------|
| Performance | 85/100 |
| SEO | 95/100 |
| Accessibility | 78/100 |
| Best Practices | 92/100 |

### Core Web Vitals
- LCP: 2.1s ✓
- FID: 45ms ✓
- CLS: 0.05 ✓

### Top Issues
1. Eliminate render-blocking resources
2. Serve images in next-gen formats

---

## 3. Recommendations

1. Add meta description (150-160 chars)
2. Shorten title to 60 chars or less
3. Add viewport meta for mobile support
```

## Related Skills

- **seo-lookup**: Reference for SEO best practices
- **seo-analyzer**: Static HTML analysis
- **lighthouse-runner**: Runtime performance analysis

## Tips

1. **For JSX/TSX projects**: Use development server URL
   ```bash
   npm run dev  # Start dev server
   /seo-audit http://localhost:3000
   ```

2. **For production builds**: Build first, then audit
   ```bash
   npm run build && npm run start
   /seo-audit http://localhost:3000
   ```

3. **Quick check**: Use static mode for fast feedback
   ```bash
   /seo-audit index.html static
   ```
