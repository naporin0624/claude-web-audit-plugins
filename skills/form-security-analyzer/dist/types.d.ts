/**
 * Form Security Analyzer type definitions
 */
export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type IssueType = 'missing-csrf' | 'http-action' | 'predictable-id' | 'sensitive-hidden' | 'no-validation' | 'password-autocomplete' | 'inline-handler' | 'state-changing-get' | 'missing-maxlength';
export interface SecurityIssue {
    severity: Severity;
    type: IssueType;
    message: string;
    detail: string;
    bounty: string;
    owasp: string;
    cwe: string;
}
export interface FormAnalysis {
    id: string;
    action: string;
    method: string;
    issues: SecurityIssue[];
}
export interface Summary {
    critical: number;
    high: number;
    medium: number;
    low: number;
}
export interface AnalysisResult {
    file: string;
    path?: string;
    timestamp: string;
    forms: FormAnalysis[];
    summary: Summary;
}
export interface IssueWithForm extends SecurityIssue {
    formId: string;
    formAction: string;
}
export declare const BOUNTY_ESTIMATES: Record<IssueType, string>;
