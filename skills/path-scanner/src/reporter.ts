/**
 * Report Formatter
 * Formats scan results as JSON or Markdown text
 */

import type { ScanResult } from './types.js';

export class Reporter {
  /**
   * Format results as JSON
   * @param result - Scan result
   * @returns JSON string
   */
  formatJSON(result: ScanResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Format results as Markdown text
   * @param result - Scan result
   * @returns Formatted text
   */
  formatText(result: ScanResult): string {
    const lines: string[] = [];

    // Header
    lines.push('━'.repeat(60));
    lines.push('🗺️  Path Scanner Results');
    lines.push('━'.repeat(60));
    lines.push('');

    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push(`Target:          ${result.summary.target}`);
    lines.push(`URLs Discovered: ${result.summary.urlsDiscovered}`);
    lines.push(`Forms Found:     ${result.summary.formsFound}`);
    lines.push(`Max Depth:       ${result.summary.depth}`);
    lines.push(`Duration:        ${result.summary.duration}`);
    lines.push('');

    // Crawl Stats
    lines.push('## Crawl Statistics');
    lines.push('');
    lines.push(`├─ From sitemap: ${result.crawlStats.sitemapUrls}`);
    lines.push(`├─ From crawl:   ${result.crawlStats.crawledUrls}`);
    lines.push(`├─ Skipped:      ${result.crawlStats.skippedUrls}`);
    lines.push(`└─ Errors:       ${result.crawlStats.errors}`);
    lines.push('');

    // High-value targets
    const highValue = result.urls.filter((u) => u.bountyPotential === 'high');
    if (highValue.length > 0) {
      lines.push('## 🔥 High-Value Targets');
      lines.push('');
      for (const url of highValue.slice(0, 10)) {
        const formIndicator = url.hasForms ? ` (${url.formCount} form${url.formCount > 1 ? 's' : ''})` : '';
        lines.push(`  • ${url.url}${formIndicator}`);
      }
      if (highValue.length > 10) {
        lines.push(`  ... and ${highValue.length - 10} more`);
      }
      lines.push('');
    }

    // Forms with vulnerabilities
    const vulnForms = result.forms.filter((f) => f.vulnerabilityIndicators.length > 0);
    if (vulnForms.length > 0) {
      lines.push('## ⚠️  Forms with Potential Issues');
      lines.push('');
      for (const form of vulnForms.slice(0, 10)) {
        lines.push(`  ${form.url}`);
        lines.push(`  └─ ${form.method} → ${form.action}`);
        lines.push(`     Issues: ${form.vulnerabilityIndicators.join(', ')}`);
        lines.push('');
      }
      if (vulnForms.length > 10) {
        lines.push(`  ... and ${vulnForms.length - 10} more`);
        lines.push('');
      }
    }

    // Robots.txt info
    if (result.robotsDirectives) {
      const robots = result.robotsDirectives;
      if (robots.disallow.length > 0 || robots.sitemaps.length > 0 || robots.crawlDelay) {
        lines.push('## 🤖 Robots.txt');
        lines.push('');
        if (robots.crawlDelay) {
          lines.push(`Crawl-delay: ${robots.crawlDelay}s`);
        }
        if (robots.disallow.length > 0) {
          lines.push(`Disallowed: ${robots.disallow.slice(0, 5).join(', ')}`);
          if (robots.disallow.length > 5) {
            lines.push(`... and ${robots.disallow.length - 5} more`);
          }
        }
        if (robots.sitemaps.length > 0) {
          lines.push(`Sitemaps: ${robots.sitemaps.length}`);
        }
        lines.push('');
      }
    }

    // Footer
    lines.push('━'.repeat(60));
    lines.push('💡 Tip: Use --json for machine-readable output');
    lines.push('━'.repeat(60));

    return lines.join('\n');
  }

  /**
   * Format results in compact mode (minimal output)
   * @param result - Scan result
   * @returns Compact text
   */
  formatCompact(result: ScanResult): string {
    const lines: string[] = [];

    lines.push(`Target: ${result.summary.target}`);
    lines.push(`URLs: ${result.summary.urlsDiscovered}, Forms: ${result.summary.formsFound}`);

    const highValue = result.urls.filter((u) => u.bountyPotential === 'high');
    if (highValue.length > 0) {
      lines.push(`High-value: ${highValue.length}`);
    }

    return lines.join(', ');
  }
}
