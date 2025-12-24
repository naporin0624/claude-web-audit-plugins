/**
 * CLI for Web Resource Checker
 */
export function parseArgs(args) {
    const target = args.find((arg) => !arg.startsWith('-'));
    if (!target) {
        printUsage();
        return null;
    }
    const options = {
        json: args.includes('--json'),
        only: null,
        timeout: 10000,
    };
    const onlyArg = args.find((arg) => arg.startsWith('--only='));
    if (onlyArg) {
        options.only = onlyArg.split('=')[1];
    }
    const timeoutArg = args.find((arg) => arg.startsWith('--timeout='));
    if (timeoutArg) {
        const value = parseInt(timeoutArg.split('=')[1], 10);
        if (!isNaN(value) && value > 0) {
            options.timeout = value;
        }
    }
    return { target, options };
}
function printUsage() {
    console.log(`
Web Resource Checker v2.0.0

Usage:
  npx web-resource-checker <target> [options]

Target:
  URL (https://example.com) or local directory path

Options:
  --only=<files>    Comma-separated list of files to check
                    Valid: sitemap, robots, security, llms, llms-full
  --timeout=<ms>    Request timeout in milliseconds (default: 10000)
  --json            Output results as JSON

Examples:
  npx web-resource-checker https://example.com
  npx web-resource-checker ./public --only=sitemap,robots
  npx web-resource-checker https://example.com --json
  npx web-resource-checker https://example.com --timeout=30000
`);
}
