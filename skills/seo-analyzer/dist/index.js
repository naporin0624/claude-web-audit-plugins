#!/usr/bin/env node
/**
 * SEO Analyzer
 *
 * Static SEO and Keyword analysis for HTML files using cheerio.
 */
import { readFileSync, existsSync } from 'fs';
import { parseArgs, printHelp } from './cli.js';
import { SEOAnalyzer } from './seo-analyzer.js';
import { KeywordAnalyzer } from './keyword-analyzer.js';
import { formatSEOTextReport, formatKeywordTextReport, formatCombinedTextReport, } from './reporter.js';
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
    if (!existsSync(filepath)) {
        console.error(`Error: File not found: ${filepath}`);
        process.exit(1);
    }
    let html;
    try {
        html = readFileSync(filepath, 'utf-8');
    }
    catch (err) {
        console.error(`Error reading file: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
    }
    const filename = filepath.split(/[/\\]/).pop() || filepath;
    if (config.mode === 'seo') {
        const analyzer = new SEOAnalyzer(html, filename);
        const report = analyzer.analyze();
        if (config.jsonOutput) {
            console.log(JSON.stringify(report, null, 2));
        }
        else {
            console.log(formatSEOTextReport(report));
        }
    }
    else if (config.mode === 'keywords') {
        const analyzer = new KeywordAnalyzer(html, filename);
        const report = analyzer.analyze();
        if (config.jsonOutput) {
            console.log(JSON.stringify(report, null, 2));
        }
        else {
            console.log(formatKeywordTextReport(report));
        }
    }
    else {
        // Both modes
        const seoAnalyzer = new SEOAnalyzer(html, filename);
        const keywordAnalyzer = new KeywordAnalyzer(html, filename);
        const seoReport = seoAnalyzer.analyze();
        const keywordReport = keywordAnalyzer.analyze();
        if (config.jsonOutput) {
            console.log(JSON.stringify({ seo: seoReport, keywords: keywordReport }, null, 2));
        }
        else {
            console.log(formatCombinedTextReport(seoReport, keywordReport));
        }
    }
}
main();
