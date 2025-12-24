#!/usr/bin/env node
/**
 * Playwright Security Runner
 *
 * Dynamic security testing of web forms.
 * Warning: This script sends real payloads - use responsibly.
 * Only use on systems you are authorized to test.
 */
import { parseArgs, printHelp, isProductionUrl, printProductionWarning, } from './cli.js';
import { runTests } from './runner.js';
import { printDryRun, printResults } from './reporter.js';
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        printHelp();
        process.exit(0);
    }
    const options = parseArgs(args);
    if (!options.url) {
        console.error('Error: --url is required');
        process.exit(1);
    }
    if (isProductionUrl(options.url) && !options.dryRun) {
        printProductionWarning(options.url);
    }
    if (options.dryRun) {
        printDryRun(options);
        process.exit(0);
    }
    console.log(`\nStarting security tests against: ${options.url}\n`);
    try {
        const results = await runTests(options);
        if (options.json) {
            console.log(JSON.stringify(results, null, 2));
        }
        else {
            printResults(results);
        }
        if (results.summary.vulnerable > 0) {
            process.exit(1);
        }
    }
    catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map