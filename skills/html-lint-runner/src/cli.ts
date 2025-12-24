/**
 * CLI argument parsing for HTML Lint Runner
 */

import type { LintOptions } from './types.js';

export function parseArgs(args: string[]): LintOptions {
  const options: LintOptions = {
    file: '',
    json: true, // Default to JSON output
    axeOnly: false,
    markuplintOnly: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--json':
        options.json = true;
        break;
      case '--text':
        options.json = false;
        break;
      case '--axe-only':
        options.axeOnly = true;
        break;
      case '--markuplint-only':
        options.markuplintOnly = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
      default:
        if (!arg.startsWith('-')) {
          options.file = arg;
        }
    }
  }

  return options;
}

export function printHelp(): void {
  console.log(`
HTML Lint Runner - Accessibility and HTML standards checking

Usage:
  npx tsx src/index.ts <file> [options]

Options:
  --json            Output as JSON (default)
  --text            Output as human-readable text
  --axe-only        Run only axe-core (accessibility)
  --markuplint-only Run only markuplint (HTML standards)
  --help, -h        Show this help

Examples:
  npx tsx src/index.ts path/to/file.html
  npx tsx src/index.ts path/to/Component.tsx --axe-only
  npx tsx src/index.ts path/to/file.html --text
`);
}
