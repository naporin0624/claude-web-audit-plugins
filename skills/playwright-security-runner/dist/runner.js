/**
 * Core security testing logic using Playwright
 */
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PAYLOADS, SQL_ERROR_PATTERNS } from './payloads.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
export async function findForms(page, formSelector) {
    if (formSelector) {
        const form = page.locator(formSelector);
        const count = await form.count();
        if (count > 0) {
            return [{ selector: formSelector }];
        }
        return [];
    }
    const forms = page.locator('form');
    const count = await forms.count();
    return Array.from({ length: count }, (_, index) => ({
        selector: `form:nth-of-type(${index + 1})`,
    }));
}
export async function getFormInputs(page, formSelector) {
    const inputs = [];
    // Get text inputs and textareas
    const inputLocator = page.locator(`${formSelector} input:not([type="hidden"]):not([type="submit"]):not([type="button"]), ${formSelector} textarea`);
    const count = await inputLocator.count();
    for (let i = 0; i < count; i++) {
        const el = inputLocator.nth(i);
        const name = (await el.getAttribute('name')) || '';
        const id = (await el.getAttribute('id')) || '';
        const type = (await el.getAttribute('type')) || 'text';
        inputs.push({
            name: name || id || 'unnamed',
            type,
            selector: name ? `[name="${name}"]` : id ? `#${id}` : `:nth-child(${i + 1})`,
        });
    }
    return inputs;
}
export async function testPayload(page, formSelector, inputSelector, payload, options) {
    const result = {
        payload: payload.value,
        payloadName: payload.name,
        field: inputSelector,
        timestamp: new Date().toISOString(),
        vulnerable: false,
        evidence: [],
    };
    try {
        await page.fill(`${formSelector} ${inputSelector}`, payload.value);
        await Promise.all([
            page.waitForLoadState('networkidle').catch(() => { }),
            page
                .click(`${formSelector} [type="submit"], ${formSelector} button:not([type="button"])`)
                .catch(() => page.press(`${formSelector} ${inputSelector}`, 'Enter')),
        ]);
        await page.waitForTimeout(500);
        // Check for payload reflection
        const content = await page.content();
        if (content.includes(payload.value)) {
            result.vulnerable = true;
            result.evidence.push('Payload reflected in response without encoding');
        }
        // Check for JavaScript dialog (XSS detection)
        const dialogPromise = page
            .waitForEvent('dialog', { timeout: 1000 })
            .catch(() => null);
        const dialog = await dialogPromise;
        if (dialog) {
            result.vulnerable = true;
            result.evidence.push(`Alert dialog triggered: "${dialog.message()}"`);
            await dialog.dismiss();
        }
        // Check for SQL error patterns
        for (const error of SQL_ERROR_PATTERNS) {
            if (content.toLowerCase().includes(error.toLowerCase())) {
                result.vulnerable = true;
                result.evidence.push(`SQL error detected: "${error}"`);
            }
        }
        // Take screenshot if vulnerability found
        if (options.screenshot && result.vulnerable) {
            const screenshotDir = join(__dirname, '..', 'screenshots');
            if (!existsSync(screenshotDir)) {
                mkdirSync(screenshotDir, { recursive: true });
            }
            const screenshotPath = join(screenshotDir, `${payload.name}-${Date.now()}.png`);
            await page.screenshot({ path: screenshotPath });
            result.screenshot = screenshotPath;
        }
    }
    catch (error) {
        result.error = error instanceof Error ? error.message : String(error);
    }
    return result;
}
export async function runTests(options) {
    const results = {
        target: options.url,
        timestamp: new Date().toISOString(),
        tests: [],
        summary: { total: 0, vulnerable: 0 },
    };
    const browser = await chromium.launch({ headless: options.headless });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        await page.goto(options.url, { waitUntil: 'networkidle' });
        const forms = await findForms(page, options.formSelector);
        if (forms.length === 0) {
            console.log('No forms found on page');
            return results;
        }
        for (const form of forms) {
            const inputs = await getFormInputs(page, form.selector);
            for (const input of inputs) {
                for (const testType of options.tests) {
                    const payloads = PAYLOADS[testType] || [];
                    for (const payload of payloads) {
                        // Navigate back to initial state
                        await page.goto(options.url, { waitUntil: 'networkidle' });
                        const result = await testPayload(page, form.selector, input.selector, payload, options);
                        result.testType = testType;
                        result.form = form.selector;
                        results.tests.push(result);
                        results.summary.total++;
                        if (result.vulnerable) {
                            results.summary.vulnerable++;
                        }
                        // Rate limiting
                        await page.waitForTimeout(200);
                    }
                }
            }
        }
    }
    finally {
        await browser.close();
    }
    return results;
}
//# sourceMappingURL=runner.js.map