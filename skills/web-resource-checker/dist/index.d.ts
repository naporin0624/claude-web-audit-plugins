#!/usr/bin/env node
/**
 * Web Resource Checker
 * Validates sitemap.xml, robots.txt, security.txt, llms.txt
 */
export { WebResourceAnalyzer } from './analyzer.js';
export { formatTextReport } from './reporter.js';
export type { FileReport, AnalysisReport, Issue, CLIOptions } from './types.js';
