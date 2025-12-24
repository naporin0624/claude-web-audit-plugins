/**
 * Sitemap.xml Validator
 * Validates sitemap files against sitemaps.org protocol
 */
import type { FileReport } from '../types.js';
export declare class SitemapValidator {
    private content;
    private source;
    private issues;
    private passed;
    private data;
    constructor(content: string, source?: string);
    validate(): Promise<FileReport>;
    private checkRoot;
    private checkUrls;
    private normalizeArray;
    private validateUrls;
    private validateSitemapIndex;
    private checkSize;
    private generateReport;
}
export declare function createNotFoundReport(source: string): FileReport;
