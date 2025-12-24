/**
 * SEO Analyzer type definitions
 */
export type Severity = 'critical' | 'important' | 'recommended';
export interface Issue {
    severity: Severity;
    check: string;
    message: string;
    fix: string;
    current?: string;
    length?: number;
    count?: number;
    examples?: string[];
    missing?: string[];
    present?: Array<[string, string | undefined]>;
    suggestion?: string;
    skips?: Array<{
        from: string;
        to: string;
        text: string;
    }>;
}
export interface PassedCheck {
    check: string;
    value: string;
    length?: number;
}
export interface Warning {
    type: string;
    message: string;
}
export interface Summary {
    critical: number;
    important: number;
    recommended: number;
    passed: number;
}
export interface SEOReport {
    file: string;
    timestamp: string;
    confidence: number;
    summary: Summary;
    issues: Issue[];
    passed: PassedCheck[];
    warnings: Warning[];
}
export interface KeywordInfo {
    word: string;
    score: number;
    frequency: number;
    inTitle: boolean;
    inH1: boolean;
    inDescription: boolean;
}
export interface PhraseInfo {
    phrase: string;
    score: number;
    frequency: number;
    inTitle: boolean;
    inH1: boolean;
}
export interface KeywordDensity {
    word: string;
    density: string;
}
export interface KeywordStats {
    totalWords: number;
    uniqueWords: number;
}
export interface KeywordPlacement {
    title: string;
    h1: string;
    description: string;
}
export interface KeywordReport {
    file: string;
    timestamp: string;
    stats: KeywordStats;
    primaryKeywords: KeywordInfo[];
    keyPhrases: PhraseInfo[];
    density: KeywordDensity[];
    recommendations: string[];
    placement: KeywordPlacement;
}
export type AnalyzeMode = 'seo' | 'keywords' | 'both';
export interface CLIConfig {
    mode: AnalyzeMode;
    jsonOutput: boolean;
}
