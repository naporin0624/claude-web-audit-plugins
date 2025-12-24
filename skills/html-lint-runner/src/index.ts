#!/usr/bin/env node

/**
 * HTML Lint Runner
 *
 * Automated HTML linting using @axe-core/playwright and markuplint.
 * Checks for WCAG 2.1 AA accessibility and HTML standards compliance.
 */

import { existsSync } from 'fs';
import { extname } from 'path';
import { parseArgs, printHelp } from './cli.js';
import { checkAccessibility } from './axe-checker.js';
import { checkMarkuplint } from './markuplint-runner.js';
import { printJsonResults, printTextResults } from './reporter.js';
import type { LintResults, AxeResults, MarkuplintResults } from './types.js';

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const options = parseArgs(args);

  if (!options.file) {
    console.error('Error: File path is required');
    process.exit(1);
  }

  if (!existsSync(options.file)) {
    console.error(`Error: File not found: ${options.file}`);
    process.exit(1);
  }

  const ext = extname(options.file).toLowerCase();
  const isHtml = ext === '.html' || ext === '.htm';
  const isJsx = ext === '.jsx' || ext === '.tsx';

  if (!isHtml && !isJsx) {
    console.error(`Error: Unsupported file type: ${ext}`);
    console.error('Supported: .html, .htm, .jsx, .tsx');
    process.exit(1);
  }

  // Initialize results
  let axeResults: AxeResults = { violations: [], passes: [], incomplete: [] };
  let markuplintResults: MarkuplintResults = { problems: [] };

  // Run axe-core (only for HTML files, JSX/TSX need rendering)
  if (!options.markuplintOnly) {
    if (isHtml) {
      axeResults = await checkAccessibility(options.file);
    } else {
      axeResults.error = 'axe-core skipped for JSX/TSX (requires rendered HTML)';
    }
  }

  // Run markuplint
  if (!options.axeOnly) {
    markuplintResults = await checkMarkuplint(options.file);
  }

  // Build combined results
  const results: LintResults = {
    file: options.file,
    timestamp: new Date().toISOString(),
    axe: axeResults,
    markuplint: markuplintResults,
    summary: {
      axe_violations: axeResults.violations.length,
      markuplint_problems: markuplintResults.problems.length,
      total_issues:
        axeResults.violations.length + markuplintResults.problems.length,
    },
  };

  // Output results
  if (options.json) {
    printJsonResults(results);
  } else {
    printTextResults(results);
  }

  // Exit with error code if issues found
  if (results.summary.total_issues > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Error: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
