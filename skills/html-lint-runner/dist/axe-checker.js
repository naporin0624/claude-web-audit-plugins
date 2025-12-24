/**
 * Accessibility checking using @axe-core/playwright
 */
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
export async function checkAccessibility(filePath) {
    const results = {
        violations: [],
        passes: [],
        incomplete: [],
    };
    const browser = await chromium.launch({ headless: true });
    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        // Convert file path to file:// URL
        const absolutePath = resolve(filePath);
        const fileUrl = pathToFileURL(absolutePath).href;
        await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });
        // Run axe-core with WCAG 2.1 AA tags
        const axeResults = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
        // Map violations
        results.violations = axeResults.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            help: v.help,
            helpUrl: v.helpUrl,
            nodes: v.nodes.map((n) => ({
                html: n.html,
                target: n.target,
                failureSummary: n.failureSummary,
            })),
        }));
        // Map passes
        results.passes = axeResults.passes.map((p) => ({
            id: p.id,
            description: p.description,
            nodes: p.nodes.map((n) => ({
                html: n.html,
                target: n.target,
            })),
        }));
        // Map incomplete
        results.incomplete = axeResults.incomplete.map((i) => ({
            id: i.id,
            impact: i.impact,
            description: i.description,
            help: i.help,
            helpUrl: i.helpUrl,
            nodes: i.nodes.map((n) => ({
                html: n.html,
                target: n.target,
                failureSummary: n.failureSummary,
            })),
        }));
    }
    catch (error) {
        results.error = error instanceof Error ? error.message : String(error);
    }
    finally {
        await browser.close();
    }
    return results;
}
//# sourceMappingURL=axe-checker.js.map