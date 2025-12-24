/**
 * SEO Analysis - Static HTML analysis using cheerio
 */
import type { SEOReport } from './types.js';
export declare class SEOAnalyzer {
    private $;
    private filename;
    private issues;
    private passed;
    private warnings;
    private confidence;
    constructor(html: string, filename: string);
    analyze(): SEOReport;
    private detectSPA;
    private checkCritical;
    private checkTitle;
    private checkDescription;
    private checkH1;
    private checkCanonical;
    private checkImportant;
    private checkRobots;
    private checkViewport;
    private checkHeadingHierarchy;
    private checkLang;
    private checkRecommended;
    private checkOpenGraph;
    private checkTwitterCard;
    private checkStructuredData;
    private checkHreflang;
    private generateReport;
}
