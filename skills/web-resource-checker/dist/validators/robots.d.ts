/**
 * robots.txt Validator
 * Validates robots.txt against RFC 9309
 */
import type { FileReport } from '../types.js';
export declare class RobotsValidator {
    private content;
    private source;
    private issues;
    private passed;
    private rules;
    private sitemaps;
    constructor(content: string, source?: string);
    validate(): FileReport;
    private checkSize;
    private parse;
    private checkUserAgents;
    private checkSitemap;
    private checkBlockingAll;
    private generateReport;
}
export declare function createNotFoundReport(source: string): FileReport;
