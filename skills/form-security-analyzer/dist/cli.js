/**
 * CLI argument parsing for Form Security Analyzer
 */
const DEFAULT_CONFIG = {
    jsonOutput: false,
};
export function parseArgs(args) {
    const config = { ...DEFAULT_CONFIG };
    let filepath = null;
    for (const arg of args) {
        if (arg.startsWith('--')) {
            const key = arg.slice(2).split('=')[0];
            switch (key) {
                case 'json':
                    config.jsonOutput = true;
                    break;
                case 'help':
                case 'h':
                    printHelp();
                    process.exit(0);
                    break;
            }
        }
        else if (arg === '-h') {
            printHelp();
            process.exit(0);
        }
        else if (!filepath) {
            filepath = arg;
        }
    }
    return { filepath, config };
}
export function printHelp() {
    console.log(`
Form Security Analyzer - Static security analysis of HTML forms

Usage:
  npx tsx src/index.ts <file.html> [options]

Options:
  --json        Output as JSON
  --help, -h    Show this help

Examples:
  npx tsx src/index.ts login.html
  npx tsx src/index.ts form.html --json

Checks Performed:
  - CSRF token presence
  - Secure form action (HTTPS)
  - State-changing GET requests
  - Predictable IDs (IDOR risk)
  - Sensitive data in hidden fields
  - Input validation
  - Password autocomplete
  - Inline event handlers (XSS surface)
`);
}
