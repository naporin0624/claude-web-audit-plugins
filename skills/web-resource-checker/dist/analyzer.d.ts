/**
 * Web Resource Analyzer
 * Main entry point for validating web resource files
 */
import type { AnalysisReport, CLIOptions } from './types.js';
export declare class WebResourceAnalyzer {
    private target;
    private isUrl;
    private options;
    private results;
    constructor(target: string, options?: Partial<CLIOptions>);
    analyze(): Promise<AnalysisReport>;
    private getFilesToCheck;
    private checkFile;
    private generateReport;
}
