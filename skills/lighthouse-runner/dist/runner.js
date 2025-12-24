/**
 * Core Lighthouse runner using Playwright
 */
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
export async function runLighthouse(url, config) {
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            `--remote-debugging-port=${config.port}`,
        ],
    });
    try {
        const result = await lighthouse(url, {
            port: config.port,
            output: 'json',
            logLevel: 'error',
            onlyCategories: config.categories,
            formFactor: 'desktop',
            screenEmulation: {
                mobile: false,
                width: 1350,
                height: 940,
                deviceScaleFactor: 1,
                disabled: false,
            },
            throttling: {
                rttMs: 40,
                throughputKbps: 10 * 1024,
                cpuSlowdownMultiplier: 1,
            },
        });
        return result.lhr;
    }
    finally {
        await browser.close();
    }
}
export function extractMetrics(lhr) {
    const audits = lhr.audits;
    return {
        lcp: audits['largest-contentful-paint']?.numericValue,
        fid: audits['max-potential-fid']?.numericValue,
        cls: audits['cumulative-layout-shift']?.numericValue,
        ttfb: audits['server-response-time']?.numericValue,
        speedIndex: audits['speed-index']?.numericValue,
        fcp: audits['first-contentful-paint']?.numericValue,
        tbt: audits['total-blocking-time']?.numericValue,
    };
}
export function extractFailedAudits(lhr) {
    const failed = {};
    for (const [categoryId, category] of Object.entries(lhr.categories)) {
        failed[categoryId] = [];
        for (const auditRef of category.auditRefs) {
            const audit = lhr.audits[auditRef.id];
            if (audit && audit.score !== null && audit.score < 0.9) {
                const failedAudit = {
                    id: audit.id,
                    title: audit.title,
                    description: audit.description,
                    score: audit.score,
                    displayValue: audit.displayValue,
                };
                failed[categoryId].push(failedAudit);
            }
        }
        // Sort by score (lowest first)
        failed[categoryId].sort((a, b) => (a.score || 0) - (b.score || 0));
        // Limit to top 5
        failed[categoryId] = failed[categoryId].slice(0, 5);
    }
    return failed;
}
//# sourceMappingURL=runner.js.map