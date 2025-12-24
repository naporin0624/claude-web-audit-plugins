/**
 * Accessibility checking using @axe-core/playwright
 */

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import type { AxeResults, AxeViolation, AxePass } from './types.js';

export async function checkAccessibility(filePath: string): Promise<AxeResults> {
  const results: AxeResults = {
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
    results.violations = axeResults.violations.map(
      (v): AxeViolation => ({
        id: v.id,
        impact: v.impact as AxeViolation['impact'],
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.map((n) => ({
          html: n.html,
          target: n.target as string[],
          failureSummary: n.failureSummary,
        })),
      })
    );

    // Map passes
    results.passes = axeResults.passes.map(
      (p): AxePass => ({
        id: p.id,
        description: p.description,
        nodes: p.nodes.map((n) => ({
          html: n.html,
          target: n.target as string[],
        })),
      })
    );

    // Map incomplete
    results.incomplete = axeResults.incomplete.map(
      (i): AxeViolation => ({
        id: i.id,
        impact: i.impact as AxeViolation['impact'],
        description: i.description,
        help: i.help,
        helpUrl: i.helpUrl,
        nodes: i.nodes.map((n) => ({
          html: n.html,
          target: n.target as string[],
          failureSummary: n.failureSummary,
        })),
      })
    );
  } catch (error) {
    results.error = error instanceof Error ? error.message : String(error);
  } finally {
    await browser.close();
  }

  return results;
}
