/**
 * CLI argument parsing for SEO Analyzer
 */

import type { AnalyzeMode, CLIConfig } from './types.js';

const DEFAULT_CONFIG: CLIConfig = {
  mode: 'seo',
  jsonOutput: false,
};

export function parseArgs(args: string[]): { filepath: string | null; config: CLIConfig } {
  const config: CLIConfig = { ...DEFAULT_CONFIG };
  let filepath: string | null = null;

  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      switch (key) {
        case 'json':
          config.jsonOutput = true;
          break;
        case 'mode':
          if (value === 'seo' || value === 'keywords' || value === 'both') {
            config.mode = value as AnalyzeMode;
          }
          break;
        case 'keywords':
          config.mode = 'keywords';
          break;
        case 'both':
          config.mode = 'both';
          break;
        case 'help':
        case 'h':
          printHelp();
          process.exit(0);
          break;
      }
    } else if (!filepath) {
      filepath = arg;
    }
  }

  return { filepath, config };
}

export function printHelp(): void {
  console.log(`
SEO Analyzer - Static HTML SEO and Keyword Analysis

Usage:
  npx tsx src/index.ts <file.html> [options]

Options:
  --json          Output in JSON format
  --mode=<mode>   Analysis mode: seo, keywords, or both (default: seo)
  --keywords      Shortcut for --mode=keywords
  --both          Shortcut for --mode=both
  --help, -h      Show this help

Examples:
  npx tsx src/index.ts page.html
  npx tsx src/index.ts page.html --json
  npx tsx src/index.ts page.html --keywords
  npx tsx src/index.ts page.html --both --json
`);
}
