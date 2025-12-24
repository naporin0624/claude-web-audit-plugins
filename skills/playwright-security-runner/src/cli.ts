/**
 * CLI argument parsing for Playwright Security Runner
 */

import type { TestOptions, TestType } from './types.js';

const VALID_TEST_TYPES: TestType[] = ['xss', 'sqli', 'auth', 'csrf', 'idor'];

export function parseArgs(args: string[]): TestOptions {
  const options: TestOptions = {
    url: '',
    formSelector: null,
    tests: ['xss', 'sqli'],
    dryRun: false,
    screenshot: false,
    json: false,
    headless: true,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--url':
      case '-u':
        options.url = args[++i] || '';
        break;
      case '--form':
      case '-f':
        options.formSelector = args[++i] || null;
        break;
      case '--test':
      case '-t': {
        const testArg = args[++i] || '';
        options.tests = testArg
          .split(',')
          .map((t) => t.trim() as TestType)
          .filter((t) => VALID_TEST_TYPES.includes(t));
        break;
      }
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--screenshot':
        options.screenshot = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--headed':
        options.headless = false;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

export function printHelp(): void {
  console.log(`
Playwright Security Runner - Dynamic security testing

Warning: This tool sends real payloads to targets.
Only use on systems you are authorized to test.

Usage:
  npx tsx src/index.ts --url <url> [options]

Options:
  --url, -u <url>       Target URL (required)
  --form, -f <selector> CSS selector for form
  --test, -t <types>    Test types: xss,sqli,auth (default: xss,sqli)
  --dry-run             Show plan without executing
  --screenshot          Capture screenshots
  --json                Output as JSON
  --headed              Run with visible browser
  --help, -h            Show this help

Examples:
  npx tsx src/index.ts --url "http://localhost:3000" --dry-run
  npx tsx src/index.ts --url "http://localhost:3000/login" --test xss,sqli
`);
}

export function isProductionUrl(url: string): boolean {
  const productionIndicators = [
    /^https:\/\/(?!localhost)/,
    /\.(com|org|net|io|co|app)(?:\/|$)/,
    /^https:\/\/www\./,
    /^https:\/\/api\./,
  ];

  return productionIndicators.some((pattern) => pattern.test(url));
}

export function printProductionWarning(url: string): void {
  console.log(`
WARNING: Production URL Detected

The target URL appears to be a production system:
${url}

Security testing against production:
- May cause service disruption
- Could trigger security alerts
- May violate terms of service

Ensure you have explicit authorization to test this target.
`);
}
