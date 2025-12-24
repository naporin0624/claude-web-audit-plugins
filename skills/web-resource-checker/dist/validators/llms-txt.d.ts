/**
 * llms.txt and llms-full.txt Validator
 * Validates against llmstxt.org specification
 */
import type { FileReport } from '../types.js';
export declare class LlmsTxtValidator {
    private content;
    private source;
    private isFullVersion;
    private issues;
    private passed;
    private structure;
    constructor(content: string, source?: string, isFullVersion?: boolean);
    validate(): FileReport;
    private getFileName;
    private parse;
    private checkTitle;
    private checkSummary;
    private checkSections;
    private checkLinks;
    private checkSize;
    private generateReport;
}
export declare function createNotFoundReport(source: string, isFullVersion?: boolean): FileReport;
