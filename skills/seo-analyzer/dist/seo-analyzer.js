/**
 * SEO Analysis - Static HTML analysis using cheerio
 */
import { load } from 'cheerio';
const SEVERITY = {
    CRITICAL: 'critical',
    IMPORTANT: 'important',
    RECOMMENDED: 'recommended',
};
function createIssue(severity, check, message, fix, details = {}) {
    return { severity, check, message, fix, ...details };
}
function createPassed(check, value, details = {}) {
    return { check, value, ...details };
}
export class SEOAnalyzer {
    $;
    filename;
    issues = [];
    passed = [];
    warnings = [];
    confidence = 100;
    constructor(html, filename) {
        this.$ = load(html);
        this.filename = filename;
    }
    analyze() {
        this.detectSPA();
        this.checkCritical();
        this.checkImportant();
        this.checkRecommended();
        return this.generateReport();
    }
    detectSPA() {
        const $ = this.$;
        const hasReactRoot = $('#root').length > 0 || $('#app').length > 0;
        const hasReactScript = $('script[src*="react"]').length > 0 ||
            $('script[src*="vue"]').length > 0 ||
            $('script[src*="angular"]').length > 0;
        const hasEmptyBody = $('body').children().length <= 2 && hasReactRoot;
        if (hasReactRoot && (hasReactScript || hasEmptyBody)) {
            this.confidence = 40;
            this.warnings.push({
                type: 'spa-detected',
                message: 'Client-side rendered application detected. Static analysis may not reflect the fully rendered page. Consider using Lighthouse for runtime analysis.',
            });
        }
    }
    // P0 - Critical checks
    checkCritical() {
        this.checkTitle();
        this.checkDescription();
        this.checkH1();
        this.checkCanonical();
    }
    checkTitle() {
        const $ = this.$;
        const title = $('title').text().trim();
        if (!title) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'title', 'Missing page title', 'Add <title>Your Page Title</title> in <head>'));
            return;
        }
        const length = title.length;
        if (length < 30) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'title-length', `Title too short (${length} chars)`, 'Expand title to 30-60 characters for better SEO', { current: title, length }));
        }
        else if (length > 60) {
            this.issues.push(createIssue(SEVERITY.IMPORTANT, 'title-length', `Title may be truncated (${length} chars)`, 'Consider shortening to 60 characters or less', { current: title, length }));
        }
        else {
            this.passed.push(createPassed('title', title, { length }));
        }
    }
    checkDescription() {
        const $ = this.$;
        const desc = $('meta[name="description"]').attr('content')?.trim();
        if (!desc) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'meta-description', 'Missing meta description', 'Add <meta name="description" content="Your description here">'));
            return;
        }
        const length = desc.length;
        if (length < 70) {
            this.issues.push(createIssue(SEVERITY.IMPORTANT, 'meta-description-length', `Meta description too short (${length} chars)`, 'Expand description to 70-160 characters', { current: desc, length }));
        }
        else if (length > 160) {
            this.issues.push(createIssue(SEVERITY.IMPORTANT, 'meta-description-length', `Meta description may be truncated (${length} chars)`, 'Consider shortening to 160 characters or less', { current: desc, length }));
        }
        else {
            this.passed.push(createPassed('meta-description', desc, { length }));
        }
    }
    checkH1() {
        const $ = this.$;
        const h1s = $('h1');
        const count = h1s.length;
        if (count === 0) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'h1', 'Missing H1 heading', 'Add exactly one <h1> tag for the main page heading'));
        }
        else if (count > 1) {
            const texts = h1s
                .map((_, el) => $(el).text().trim())
                .get()
                .slice(0, 3);
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'h1-multiple', `Multiple H1 tags found (${count})`, 'Keep only one <h1> tag per page', { count, examples: texts }));
        }
        else {
            this.passed.push(createPassed('h1', h1s.first().text().trim()));
        }
    }
    checkCanonical() {
        const $ = this.$;
        const canonical = $('link[rel="canonical"]').attr('href');
        if (!canonical) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'canonical', 'Missing canonical URL', 'Add <link rel="canonical" href="https://example.com/page">'));
            return;
        }
        if (!canonical.startsWith('http')) {
            this.issues.push(createIssue(SEVERITY.IMPORTANT, 'canonical-relative', 'Canonical URL should be absolute', 'Use full URL starting with https://', { current: canonical }));
        }
        else {
            this.passed.push(createPassed('canonical', canonical));
        }
    }
    // P1 - Important checks
    checkImportant() {
        this.checkRobots();
        this.checkViewport();
        this.checkHeadingHierarchy();
        this.checkLang();
    }
    checkRobots() {
        const $ = this.$;
        const robots = $('meta[name="robots"]').attr('content')?.toLowerCase();
        if (robots) {
            if (robots.includes('noindex')) {
                this.issues.push(createIssue(SEVERITY.IMPORTANT, 'robots-noindex', 'Page has noindex directive', 'Remove noindex if you want this page indexed', { current: robots }));
            }
            if (robots.includes('nofollow')) {
                this.warnings.push({
                    type: 'robots-nofollow',
                    message: `Page has nofollow directive: ${robots}`,
                });
            }
        }
    }
    checkViewport() {
        const $ = this.$;
        const viewport = $('meta[name="viewport"]').attr('content');
        if (!viewport) {
            this.issues.push(createIssue(SEVERITY.IMPORTANT, 'viewport', 'Missing viewport meta tag', 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">'));
        }
        else {
            this.passed.push(createPassed('viewport', viewport));
        }
    }
    checkHeadingHierarchy() {
        const $ = this.$;
        const headings = $('h1, h2, h3, h4, h5, h6')
            .map((_, el) => ({
            level: parseInt(el.tagName.charAt(1)),
            text: $(el).text().trim().substring(0, 50),
        }))
            .get();
        if (headings.length === 0)
            return;
        let prevLevel = 0;
        const skips = [];
        for (const h of headings) {
            if (h.level > prevLevel + 1 && prevLevel !== 0) {
                skips.push({
                    from: `h${prevLevel}`,
                    to: `h${h.level}`,
                    text: h.text,
                });
            }
            prevLevel = h.level;
        }
        if (skips.length > 0) {
            this.issues.push(createIssue(SEVERITY.IMPORTANT, 'heading-hierarchy', `Heading levels skipped (${skips.length} occurrences)`, 'Use sequential heading levels (h1→h2→h3)', { skips: skips.slice(0, 3) }));
        }
        else {
            this.passed.push(createPassed('heading-hierarchy', `${headings.length} headings in order`));
        }
    }
    checkLang() {
        const $ = this.$;
        const lang = $('html').attr('lang');
        if (!lang) {
            this.issues.push(createIssue(SEVERITY.IMPORTANT, 'lang', 'Missing lang attribute on <html>', 'Add <html lang="en"> or appropriate language code'));
        }
        else {
            this.passed.push(createPassed('lang', lang));
        }
    }
    // P2 - Recommended checks
    checkRecommended() {
        this.checkOpenGraph();
        this.checkTwitterCard();
        this.checkStructuredData();
        this.checkHreflang();
    }
    checkOpenGraph() {
        const $ = this.$;
        const ogTags = {
            'og:title': $('meta[property="og:title"]').attr('content'),
            'og:description': $('meta[property="og:description"]').attr('content'),
            'og:image': $('meta[property="og:image"]').attr('content'),
            'og:url': $('meta[property="og:url"]').attr('content'),
            'og:type': $('meta[property="og:type"]').attr('content'),
        };
        const missing = Object.entries(ogTags)
            .filter(([, v]) => !v)
            .map(([k]) => k);
        if (missing.length > 0) {
            this.issues.push(createIssue(SEVERITY.RECOMMENDED, 'open-graph', `Missing Open Graph tags: ${missing.join(', ')}`, 'Add Open Graph meta tags for better social sharing', { missing }));
        }
        else {
            this.passed.push(createPassed('open-graph', 'All essential OG tags present'));
        }
        // Check og:image dimensions hint
        const ogImage = ogTags['og:image'];
        if (ogImage) {
            const width = $('meta[property="og:image:width"]').attr('content');
            const height = $('meta[property="og:image:height"]').attr('content');
            if (!width || !height) {
                this.issues.push(createIssue(SEVERITY.RECOMMENDED, 'og-image-dimensions', 'Missing og:image dimensions', 'Add og:image:width and og:image:height for faster rendering'));
            }
        }
    }
    checkTwitterCard() {
        const $ = this.$;
        const card = $('meta[name="twitter:card"]').attr('content');
        if (!card) {
            this.issues.push(createIssue(SEVERITY.RECOMMENDED, 'twitter-card', 'Missing Twitter Card meta tags', 'Add <meta name="twitter:card" content="summary_large_image">'));
        }
        else {
            this.passed.push(createPassed('twitter-card', card));
        }
    }
    checkStructuredData() {
        const $ = this.$;
        const jsonLdScripts = $('script[type="application/ld+json"]');
        if (jsonLdScripts.length === 0) {
            this.issues.push(createIssue(SEVERITY.RECOMMENDED, 'structured-data', 'No JSON-LD structured data found', 'Add structured data for rich search results', { suggestion: 'Consider adding Article, Product, or Organization schema' }));
            return;
        }
        const schemas = [];
        jsonLdScripts.each((_, el) => {
            try {
                const html = $(el).html();
                if (html) {
                    const data = JSON.parse(html);
                    const type = data['@type'] || 'Unknown';
                    schemas.push(type);
                }
            }
            catch {
                this.issues.push(createIssue(SEVERITY.IMPORTANT, 'structured-data-invalid', 'Invalid JSON-LD syntax', 'Check JSON-LD for syntax errors'));
            }
        });
        if (schemas.length > 0) {
            this.passed.push(createPassed('structured-data', `Found schemas: ${schemas.join(', ')}`));
        }
    }
    checkHreflang() {
        const $ = this.$;
        const hreflangs = $('link[rel="alternate"][hreflang]');
        if (hreflangs.length > 0) {
            const langs = hreflangs
                .map((_, el) => $(el).attr('hreflang'))
                .get();
            this.passed.push(createPassed('hreflang', langs.join(', ')));
            // Check for x-default
            if (!langs.includes('x-default')) {
                this.issues.push(createIssue(SEVERITY.RECOMMENDED, 'hreflang-default', 'Missing x-default hreflang', 'Add <link rel="alternate" hreflang="x-default" href="..."> for fallback'));
            }
        }
    }
    generateReport() {
        const summary = {
            critical: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
            important: this.issues.filter((i) => i.severity === SEVERITY.IMPORTANT).length,
            recommended: this.issues.filter((i) => i.severity === SEVERITY.RECOMMENDED).length,
            passed: this.passed.length,
        };
        return {
            file: this.filename,
            timestamp: new Date().toISOString(),
            confidence: this.confidence,
            summary,
            issues: this.issues,
            passed: this.passed,
            warnings: this.warnings,
        };
    }
}
