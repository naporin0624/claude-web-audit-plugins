#!/usr/bin/env node
/**
 * Form Security Analyzer
 *
 * Static analysis of HTML forms for security vulnerabilities.
 * No requests sent - safe to run on any file.
 */
import { parseArgs, printHelp } from './cli.js';
import { analyzeFile } from './analyzer.js';
import { formatTextReport } from './reporter.js';
async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        printHelp();
        process.exit(1);
    }
    const { filepath, config } = parseArgs(args);
    if (!filepath) {
        console.error('Error: No file specified');
        process.exit(1);
    }
    try {
        const result = analyzeFile(filepath);
        if (config.jsonOutput) {
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            console.log(formatTextReport(result));
        }
        // Exit with error code if critical issues found
        if (result.summary.critical > 0) {
            process.exit(1);
        }
    }
    catch (error) {
        console.error(`Error: ${error instanceof Error ? error.message : error}`);
        process.exit(1);
    }
}
main();
