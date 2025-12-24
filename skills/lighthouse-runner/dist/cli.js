/**
 * CLI argument parsing for Lighthouse Runner
 */
const DEFAULT_CONFIG = {
    timeout: 60,
    categories: ['performance', 'seo', 'accessibility', 'best-practices'],
    port: 9222,
    servePort: 8765,
    jsonOutput: false,
};
export function parseArgs(args) {
    const config = { ...DEFAULT_CONFIG };
    let target = null;
    for (const arg of args) {
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            switch (key) {
                case 'json':
                    config.jsonOutput = true;
                    break;
                case 'timeout':
                    config.timeout = parseInt(value, 10);
                    break;
                case 'categories':
                    config.categories = value.split(',').map((c) => c.trim());
                    break;
                case 'help':
                case 'h':
                    printHelp();
                    process.exit(0);
                    break;
            }
        }
        else if (!target) {
            target = arg;
        }
    }
    return { target, config };
}
export function printHelp() {
    console.log(`
Lighthouse Runner - Performance, SEO, Accessibility audits

Usage:
  npx tsx src/index.ts <url|file> [options]

Options:
  --json                 Output in JSON format
  --timeout=<seconds>    Timeout in seconds (default: 60)
  --categories=<list>    Comma-separated categories
                         (performance,seo,accessibility,best-practices)
  --help, -h             Show this help

Examples:
  npx tsx src/index.ts https://example.com
  npx tsx src/index.ts ./index.html --json
  npx tsx src/index.ts http://localhost:3000 --categories=performance,seo
`);
}
export function isUrl(target) {
    return target.startsWith('http://') || target.startsWith('https://');
}
//# sourceMappingURL=cli.js.map