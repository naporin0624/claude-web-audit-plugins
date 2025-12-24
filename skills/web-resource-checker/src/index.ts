#!/usr/bin/env node
/**
 * Web Resource Checker
 * Validates sitemap.xml, robots.txt, security.txt, llms.txt
 */

import { parseArgs } from './cli.js';
import { WebResourceAnalyzer } from './analyzer.js';
import { formatTextReport } from './reporter.js';

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (!parsed) {
    process.exit(1);
  }

  const { target, options } = parsed;

  try {
    const analyzer = new WebResourceAnalyzer(target, options);
    const report = await analyzer.analyze();

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(formatTextReport(report));
    }

    // Exit with error if critical issues found
    if (report.summary.issues.critical > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

// Export for programmatic use
export { WebResourceAnalyzer } from './analyzer.js';
export { formatTextReport } from './reporter.js';
export type { FileReport, AnalysisReport, Issue, CLIOptions } from './types.js';
