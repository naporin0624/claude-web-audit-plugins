/**
 * Keyword Analysis - Extract and score keywords from HTML
 */
import type { KeywordReport } from './types.js';
export declare class KeywordAnalyzer {
    private $;
    private filename;
    constructor(html: string, filename: string);
    analyze(): KeywordReport;
}
