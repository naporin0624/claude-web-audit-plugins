/**
 * Report formatting for SEO and Keyword analysis
 */
import type { SEOReport, KeywordReport } from './types.js';
export declare function formatSEOTextReport(report: SEOReport): string;
export declare function formatKeywordTextReport(report: KeywordReport): string;
export interface CombinedReport {
    seo: SEOReport;
    keywords: KeywordReport;
}
export declare function formatCombinedTextReport(seoReport: SEOReport, keywordReport: KeywordReport): string;
