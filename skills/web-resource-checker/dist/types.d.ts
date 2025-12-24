/**
 * Web Resource Checker type definitions
 */
export type Severity = 'critical' | 'important' | 'recommended';
export interface Issue {
    severity: Severity;
    check: string;
    message: string;
    fix: string;
    line?: number;
    content?: string;
    value?: string;
    url?: string;
    directive?: string;
    count?: number;
    total?: number;
    max?: number;
    sizeBytes?: number;
    maxBytes?: number;
    agents?: string[];
    email?: string;
    expires?: string;
    daysUntilExpiry?: number;
    estimatedTokens?: number;
    sizeKB?: string;
    userAgent?: string;
}
export interface PassedCheck {
    check: string;
    value: string;
    length?: number;
    max?: number;
    maxMB?: number;
    maxKB?: number;
    urls?: string[];
    sections?: string[];
    preview?: string;
    line?: number;
    daysUntilExpiry?: number;
    estimatedTokens?: number;
    sizeKB?: string;
    userAgent?: string;
}
export interface Summary {
    critical: number;
    important: number;
    recommended: number;
    passed: number;
}
export interface FileReport {
    file: string;
    source: string;
    found: boolean;
    valid: boolean;
    summary: Summary;
    issues: Issue[];
    passed: PassedCheck[];
    error?: string;
    stats?: {
        userAgents?: number;
        sitemaps?: number;
    };
    fields?: string[];
    structure?: {
        hasTitle?: boolean;
        hasSummary?: boolean;
        sectionCount?: number;
        linkCount?: number;
    };
}
export interface ReportSummary {
    target: string;
    timestamp: string;
    totalFiles: number;
    found: number;
    valid: number;
    issues: {
        critical: number;
        important: number;
        recommended: number;
    };
}
export interface AnalysisReport {
    summary: ReportSummary;
    files: Record<string, FileReport>;
}
export interface CLIOptions {
    json: boolean;
    only: string | null;
    timeout: number;
}
export type FileType = 'sitemap' | 'robots' | 'security' | 'llms' | 'llms-full';
