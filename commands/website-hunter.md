---
name: website-hunter
description: Two-phase intelligent attack strategy. Quick scan (path discovery + CVE) for fast reconnaissance, followed by deep scan (XSS/SQLi/CSRF/IDOR) for comprehensive coverage. Maximum efficiency, maximum bounty.
args:
  - name: target
    description: Target URL to hunt
    required: true
  - name: mode
    description: Scan mode (quick, deep, full)
    required: false
    default: full
  - name: hunters
    description: Which hunters to deploy (all, xss, sqli, csrf, idor, cve)
    required: false
    default: all
allowed-tools: Bash, Read, Glob, Grep, Task
---

# Website Hunter Command v2.0 🎯💰💰💰

Two-phase intelligent attack strategy. Start fast with path discovery and CVE matching, then go deep with specialized hunters.

## Usage

```bash
# Full 2-phase attack (recommended)
/website-hunter http://localhost:3000

# Quick scan only (path discovery + CVE)
/website-hunter http://localhost:3000 --mode=quick

# Deep scan only (assumes paths known)
/website-hunter http://localhost:3000 --mode=deep

# Specific hunters
/website-hunter http://localhost:3000 --hunters=cve,xss
```

## Modes

| Mode | Phase 1 (Quick) | Phase 2 (Deep) | Duration | Use When |
|------|-----------------|----------------|----------|----------|
| quick | ✅ Path + CVE | ❌ | 5-10 min | Initial recon |
| deep | ❌ | ✅ 4 Hunters | 15-30 min | Paths known |
| full | ✅ Path + CVE | ✅ 4 Hunters | 20-40 min | Complete audit |

## The Hunter Team

| Hunter | Phase | Specialty | Bounty Range |
|--------|-------|-----------|--------------|
| 🗺️ Path Scanner | 1 | URL discovery, form mapping | N/A (recon) |
| 🎯 CVE Hunter | 1 | Known vulnerabilities | $2,000 - $50,000 |
| 🎯 XSS Hunter | 2 | Script injection | $500 - $15,000 |
| 🗄️ SQLi Hunter | 2 | Database attacks | $5,000 - $50,000 |
| 🎭 CSRF Hunter | 2 | Request forgery | $1,000 - $10,000 |
| 🔓 IDOR Hunter | 2 | Auth bypass | $2,000 - $50,000 |

## Execution Flow

```
/website-hunter http://target.com

┌────────────────────────────────────────────────────┐
│            Phase 1: Quick Scan (5-10 min)          │
├────────────────────────────────────────────────────┤
│  🗺️  Path Scanner                                  │
│  ├─ Parse sitemap.xml                              │
│  ├─ Respect robots.txt                             │
│  ├─ Crawl depth=2 (rate: 2 req/s)                 │
│  └─ Extract forms                                  │
│  Output: XX URLs, YY forms                         │
│                                                    │
│  🎯 CVE Hunter                                     │
│  ├─ Fingerprint stack                              │
│  ├─ Search NVD (CRITICAL/HIGH)                     │
│  ├─ Match versions                                 │
│  └─ Filter exploits                                │
│  Output: ZZ CVEs matched                           │
└────────────────────────────────────────────────────┘
          ↓
┌────────────────────────────────────────────────────┐
│         Quick Scan Report                          │
│  URLs: 47, Forms: 12, CVEs: 3 CRITICAL            │
│  Bounty Estimate: $25,000 - $65,000               │
└────────────────────────────────────────────────────┘
          ↓
    ⚠️  Proceed to Deep Scan? (yes/no)
          ↓
┌────────────────────────────────────────────────────┐
│           Phase 2: Deep Scan (15-30 min)           │
├────────────────────────────────────────────────────┤
│  Deploy 4 hunters in parallel on discovered paths  │
│                                                    │
│  🎯 XSS Hunter  │ 🗄️ SQLi Hunter                   │
│  🎭 CSRF Hunter │ 🔓 IDOR Hunter                   │
└────────────────────────────────────────────────────┘
          ↓
┌────────────────────────────────────────────────────┐
│          Phase 3: Combined Report                  │
│  Phase 1: $25K-$65K (CVE)                          │
│  Phase 2: $22K-$75K (XSS/SQLi/CSRF/IDOR)          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━        │
│  💰 TOTAL: $47,000 - $140,000                      │
└────────────────────────────────────────────────────┘
```

### Phase 1: Quick Scan (Reconnaissance)

**Path Scanner:**
1. Parse sitemap.xml
2. Respect robots.txt directives
3. Lightweight crawl (depth=2, 2 req/s)
4. Extract form information

**CVE Hunter:**
1. Fingerprint JavaScript libraries (React, jQuery, etc.)
2. Check HTTP headers for server versions
3. Search NVD for CRITICAL/HIGH CVEs
4. Match exact versions
5. Filter for public exploits

### Phase 2: Deep Scan (Specialized Hunters)

Uses discovered paths from Phase 1.

**4 hunters deployed in parallel:**
- **XSS Hunter**: Tests all 12 forms for script injection
- **SQLi Hunter**: Probes database inputs for injection
- **CSRF Hunter**: Checks state-changing actions for tokens
- **IDOR Hunter**: Tests object references for auth bypass

### Phase 3: Combined Report

Consolidates findings from both phases:

**Phase 1 (Quick Scan):**
- Path Scanner: XX URLs, YY forms discovered
- CVE Hunter: ZZ vulnerabilities → $XX,XXX

**Phase 2 (Deep Scan):**
- XSS Hunter: N vulnerabilities → $X,XXX
- SQLi Hunter: N vulnerabilities → $XX,XXX
- CSRF Hunter: N vulnerabilities → $X,XXX
- IDOR Hunter: N vulnerabilities → $XX,XXX

**Total Bounty Potential: $XX,XXX - $YYY,YYY**

## Example Session

```
> /website-hunter http://localhost:3000

🎯 Website Hunter v2.0 - 2-Phase Attack
Target: http://localhost:3000
Mode: full (Quick Scan → Deep Scan)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Phase 1: Quick Scan]

🗺️  Path Scanner
🔍 Fetching robots.txt...
🗺️  Fetching sitemap.xml...
🕷️  Crawling links (depth=2, rate=2 req/s)...
📝 Extracting forms...

Results:
  URLs Discovered: 47
  ├─ From sitemap: 30
  ├─ From crawl: 17
  └─ Forms found: 12

High-value targets:
  /login (POST form, no CSRF)
  /search (GET form, user input)
  /admin/users (table with IDs)

🎯 CVE Hunter
Stack Detected:
  React 17.0.1
  jQuery 3.4.1
  WordPress 5.7.2

CVEs Matched: 3 CRITICAL, 2 HIGH

💰 CVE-2021-XXXXX (CRITICAL - CVSS 9.8)
   Component: React 17.0.1
   Vulnerability: RCE
   Exploit: ✅ Public PoC available
   Bounty: $20,000 - $50,000

💰 CVE-2020-YYYYY (HIGH - CVSS 8.1)
   Component: jQuery 3.4.1
   Vulnerability: XSS
   Exploit: ✅ Public PoC available
   Bounty: $5,000 - $15,000

Quick Scan Bounty Estimate: $25,000 - $65,000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  PHASE TRANSITION

Quick scan complete. Found high-value targets.

Proceed to deep scan with 4 hunters?
- Will test 12 forms
- Estimated time: 15-30 min
- Will send test payloads (dry-run first)

Continue? (yes/no) yes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Phase 2: Deep Scan]

Deploying 4 hunters in parallel...

🎯 XSS Hunter: Started
🗄️ SQLi Hunter: Started
🎭 CSRF Hunter: Started
🔓 IDOR Hunter: Started

[Hunters working...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Phase 3: Combined Report]

Phase 1 (Quick Scan):
🎯 CVE Hunter: 5 vulnerabilities → $25,000 - $65,000

Phase 2 (Deep Scan):
🎯 XSS Hunter: 2 vulnerabilities → $3,000 - $10,000
🗄️ SQLi Hunter: 1 vulnerability → $10,000 - $25,000
🎭 CSRF Hunter: 1 vulnerability → $5,000 - $10,000
🔓 IDOR Hunter: 2 vulnerabilities → $4,000 - $30,000

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 TOTAL BOUNTY POTENTIAL: $47,000 - $140,000 💰

11 unique vulnerabilities found across 2 phases.
```

## Confirmation Gates

### Phase Transition (Quick → Deep)

```
⚠️ PHASE TRANSITION

Quick scan complete. Found high-value targets.

Proceed to deep scan with 4 hunters?
- Will test 12 forms
- Estimated time: 15-30 min
- Will send test payloads (dry-run first)

Continue? (yes/no)
```

### CVE Hunter Exploit Confirmation

```
⚠️ CVE EXPLOIT CONFIRMATION

CVE-2021-XXXXX (CRITICAL - CVSS 9.8)
Component: React 17.0.1
Vulnerability: Remote Code Execution

Public PoC: https://github.com/.../poc.py
Bounty Estimate: $20,000 - $50,000

Want to test exploit? (yes/no/dry-run)

[dry-run] Show payload without executing
[yes] Execute exploit (REQUIRES AUTHORIZATION)
[no] Skip to report only
```

### Traditional Hunter Payloads

```
⚠️ CONFIRMATION REQUIRED

The following hunters want to send payloads:

XSS Hunter wants to test:
  - <script>alert(1)</script> → search field
  - <img src=x onerror=alert(1)> → search field

SQLi Hunter wants to test:
  - ' OR '1'='1 → username field
  - admin'-- → username field

Proceed with dynamic testing? (yes/no)
```

## Safety Features

1. **2-phase approach** - quick recon before heavy testing
2. **Phase transition gate** - explicit approval before deep scan
3. **Static analysis first** - Path Scanner and CVE checks are read-only
4. **Production URL warning** - alert on non-localhost targets
5. **Payload preview** - see exactly what will be sent
6. **Dry-run support** - test mode for CVE exploits
7. **Rate limiting** - Path Scanner: 2 req/s max
8. **Robots.txt respect** - honors site crawl directives

## Output

**Phase 1 (Quick Scan) produces:**
- Path Scanner: URL list with bounty potential, forms with vulnerability indicators
- CVE Hunter: Matched CVEs with severity, bounty estimates, exploit availability

**Phase 2 (Deep Scan) produces:**
- 4 detailed hunter reports (XSS, SQLi, CSRF, IDOR)
- Each includes: vulnerability type, severity, reproduction steps, payload, bounty estimate

**Phase 3 (Combined Report):**
- All findings consolidated
- Total bounty potential across both phases
- Prioritized by severity and impact

## Tips

1. **Use quick mode first** - fast recon (5-10 min) before committing to deep scan
2. **Start with localhost/staging** - safer for testing
3. **Review Phase 1 findings** - high-value CVEs may be enough
4. **Phase transition decision** - skip deep scan if quick scan yields sufficient results
5. **Combine findings** - CVE + CSRF or IDOR = bigger impact, higher bounty

## Related Skills

### Phase 1 (Quick Scan):
- `path-scanner` - URL discovery and form extraction
- `cve-search` - NVD database search for known vulnerabilities
- `web-resource-checker` - Validates sitemap.xml and robots.txt

### Phase 2 (Deep Scan):
- `attack-methods-lookup` - OWASP Top 10 reference
- `form-security-analyzer` - Static form analysis
- `playwright-security-runner` - Dynamic security testing
