#!/usr/bin/env node

/**
 * Path Scanner CLI
 * Entry point for command-line usage
 */

import { PathScanner } from './scanner.js';
import { Reporter } from './reporter.js';
import type { CLIOptions } from './types.js';

function printHelp(): void {
  console.log(`
Path Scanner - Lightweight web crawler for path discovery and form extraction

Usage:
  path-scanner <target-url> [options]

Options:
  --depth=N              Crawl depth (default: 2, max: 3)
  --rate-limit=N         Requests per second (default: 2, max: 5)
  --max-urls=N           Maximum URLs to discover (default: 100)
  --no-respect-robots    Ignore robots.txt directives
  --json                 Output in JSON format
  --help                 Show this help message

Examples:
  path-scanner https://example.com
  path-scanner https://example.com --depth=3 --json
  path-scanner https://example.com --rate-limit=1 --max-urls=50
`);
}

function parseArgs(args: string[]): CLIOptions | null {
  if (args.length === 0) {
    return null;
  }

  const options: CLIOptions = {
    target: '',
    depth: 2,
    rateLimit: 2,
    respectRobots: true,
    maxUrls: 100,
    json: false,
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      return null;
    }

    if (arg === '--json') {
      options.json = true;
      continue;
    }

    if (arg === '--no-respect-robots') {
      options.respectRobots = false;
      continue;
    }

    if (arg.startsWith('--depth=')) {
      const value = parseInt(arg.split('=')[1], 10);
      if (!isNaN(value) && value >= 0 && value <= 3) {
        options.depth = value;
      } else {
        console.error('Error: --depth must be between 0 and 3');
        process.exit(1);
      }
      continue;
    }

    if (arg.startsWith('--rate-limit=')) {
      const value = parseInt(arg.split('=')[1], 10);
      if (!isNaN(value) && value >= 1 && value <= 5) {
        options.rateLimit = value;
      } else {
        console.error('Error: --rate-limit must be between 1 and 5');
        process.exit(1);
      }
      continue;
    }

    if (arg.startsWith('--max-urls=')) {
      const value = parseInt(arg.split('=')[1], 10);
      if (!isNaN(value) && value > 0) {
        options.maxUrls = value;
      } else {
        console.error('Error: --max-urls must be a positive number');
        process.exit(1);
      }
      continue;
    }

    // Assume it's the target URL if it doesn't start with --
    if (!arg.startsWith('--')) {
      if (!options.target) {
        options.target = arg;
      } else {
        console.error(`Error: Unexpected argument: ${arg}`);
        process.exit(1);
      }
    }
  }

  if (!options.target) {
    console.error('Error: No target URL specified');
    return null;
  }

  return options;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options) {
    printHelp();
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  const scanner = new PathScanner({
    maxDepth: options.depth,
    rateLimit: options.rateLimit,
    maxUrls: options.maxUrls,
    respectRobots: options.respectRobots,
  });

  const reporter = new Reporter();

  try {
    console.error(`🎯 Scanning ${options.target}...`);
    console.error('');

    const result = await scanner.scan(options.target);

    console.error('');
    console.error('✅ Scan complete!');
    console.error('');

    // Output results
    if (options.json) {
      console.log(reporter.formatJSON(result));
    } else {
      console.log(reporter.formatText(result));
    }

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    process.exit(1);
  }
}

main();
