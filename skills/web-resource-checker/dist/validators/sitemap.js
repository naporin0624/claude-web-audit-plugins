/**
 * Sitemap.xml Validator
 * Validates sitemap files against sitemaps.org protocol
 */
import { parseStringPromise } from 'xml2js';
import { SEVERITY, createIssue, createPassed } from './common.js';
export class SitemapValidator {
    content;
    source;
    issues = [];
    passed = [];
    data = null;
    constructor(content, source = 'sitemap.xml') {
        this.content = content;
        this.source = source;
    }
    async validate() {
        if (!this.content || this.content.trim() === '') {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'empty-file', 'Sitemap file is empty', 'Add valid sitemap XML content'));
            return this.generateReport();
        }
        try {
            this.data = await parseStringPromise(this.content, {
                explicitArray: false,
                ignoreAttrs: false,
            });
        }
        catch (error) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'invalid-xml', `Invalid XML: ${error instanceof Error ? error.message : 'Unknown error'}`, 'Fix XML syntax errors'));
            return this.generateReport();
        }
        this.checkRoot();
        this.checkUrls();
        this.checkSize();
        return this.generateReport();
    }
    checkRoot() {
        if (!this.data)
            return;
        if (this.data.urlset) {
            this.passed.push(createPassed('root-element', 'urlset'));
            return;
        }
        if (this.data.sitemapindex) {
            this.passed.push(createPassed('root-element', 'sitemapindex'));
            return;
        }
        this.issues.push(createIssue(SEVERITY.CRITICAL, 'missing-root', 'Missing <urlset> or <sitemapindex> root element', 'Wrap URLs in <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'));
    }
    checkUrls() {
        if (!this.data)
            return;
        if (this.data.urlset) {
            const urls = this.normalizeArray(this.data.urlset.url);
            this.validateUrls(urls);
            return;
        }
        if (this.data.sitemapindex) {
            const sitemaps = this.normalizeArray(this.data.sitemapindex.sitemap);
            this.validateSitemapIndex(sitemaps);
        }
    }
    normalizeArray(item) {
        if (!item)
            return [];
        return Array.isArray(item) ? item : [item];
    }
    validateUrls(urls) {
        if (urls.length === 0) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'no-urls', 'Sitemap contains no URLs', 'Add at least one <url><loc>...</loc></url> entry'));
            return;
        }
        if (urls.length > 50000) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'exceeds-limit', `Sitemap contains ${urls.length} URLs (max 50,000)`, 'Split into multiple sitemaps and use sitemap index', { count: urls.length, max: 50000 }));
        }
        else {
            this.passed.push(createPassed('url-count', String(urls.length), { max: 50000 }));
        }
        let missingLoc = 0;
        let missingLastmod = 0;
        let relativeUrls = 0;
        let invalidUrls = 0;
        for (const url of urls) {
            if (!url.loc) {
                missingLoc++;
                continue;
            }
            const loc = typeof url.loc === 'string' ? url.loc : url.loc._;
            if (!loc.startsWith('http://') && !loc.startsWith('https://')) {
                relativeUrls++;
            }
            try {
                new URL(loc);
            }
            catch {
                invalidUrls++;
            }
            if (!url.lastmod) {
                missingLastmod++;
            }
        }
        if (missingLoc > 0) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'missing-loc', `${missingLoc} URL entries missing <loc> element`, 'Add <loc>https://example.com/page</loc> to each URL entry', { count: missingLoc }));
        }
        if (relativeUrls > 0) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'relative-url', `${relativeUrls} URLs are relative (must be absolute)`, 'Use absolute URLs starting with https://', { count: relativeUrls }));
        }
        if (invalidUrls > 0) {
            this.issues.push(createIssue(SEVERITY.IMPORTANT, 'invalid-url', `${invalidUrls} URLs have invalid format`, 'Ensure all URLs are valid and properly encoded', { count: invalidUrls }));
        }
        if (missingLastmod > 0) {
            this.issues.push(createIssue(SEVERITY.RECOMMENDED, 'missing-lastmod', `${missingLastmod}/${urls.length} URLs missing <lastmod>`, 'Add <lastmod>YYYY-MM-DD</lastmod> to improve crawl efficiency', { count: missingLastmod, total: urls.length }));
        }
        else {
            this.passed.push(createPassed('lastmod', 'All URLs have lastmod'));
        }
    }
    validateSitemapIndex(sitemaps) {
        if (sitemaps.length === 0) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'no-sitemaps', 'Sitemap index contains no sitemaps', 'Add at least one <sitemap><loc>...</loc></sitemap> entry'));
            return;
        }
        this.passed.push(createPassed('sitemap-index', `Contains ${sitemaps.length} sitemaps`));
        let missingLoc = 0;
        for (const sitemap of sitemaps) {
            if (!sitemap.loc) {
                missingLoc++;
            }
        }
        if (missingLoc > 0) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'missing-sitemap-loc', `${missingLoc} sitemap entries missing <loc>`, 'Add <loc>https://example.com/sitemap.xml</loc> to each entry', { count: missingLoc }));
        }
    }
    checkSize() {
        const sizeBytes = Buffer.byteLength(this.content, 'utf8');
        const maxBytes = 52428800; // 50MB
        if (sizeBytes > maxBytes) {
            this.issues.push(createIssue(SEVERITY.CRITICAL, 'file-too-large', `Sitemap is ${(sizeBytes / 1024 / 1024).toFixed(1)}MB (max 50MB)`, 'Split into multiple sitemaps or use gzip compression', { sizeBytes, maxBytes }));
        }
        else {
            this.passed.push(createPassed('file-size', `${(sizeBytes / 1024).toFixed(1)}KB`, {
                maxMB: 50,
            }));
        }
    }
    generateReport() {
        return {
            file: 'sitemap.xml',
            source: this.source,
            found: true,
            valid: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length === 0,
            summary: {
                critical: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
                important: this.issues.filter((i) => i.severity === SEVERITY.IMPORTANT).length,
                recommended: this.issues.filter((i) => i.severity === SEVERITY.RECOMMENDED).length,
                passed: this.passed.length,
            },
            issues: this.issues,
            passed: this.passed,
        };
    }
}
export function createNotFoundReport(source) {
    return {
        file: 'sitemap.xml',
        source,
        found: false,
        valid: false,
        summary: { critical: 1, important: 0, recommended: 0, passed: 0 },
        issues: [
            createIssue(SEVERITY.CRITICAL, 'not-found', 'sitemap.xml not found', 'Create sitemap.xml at site root for better SEO discoverability'),
        ],
        passed: [],
    };
}
