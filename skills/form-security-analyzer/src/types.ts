/**
 * Form Security Analyzer type definitions
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type IssueType =
  | 'missing-csrf'
  | 'http-action'
  | 'predictable-id'
  | 'sensitive-hidden'
  | 'no-validation'
  | 'password-autocomplete'
  | 'inline-handler'
  | 'state-changing-get'
  | 'missing-maxlength';

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

// Bounty estimates by issue type
export const BOUNTY_ESTIMATES: Record<IssueType, string> = {
  'missing-csrf': '$1,000 - $10,000',
  'http-action': '$500 - $5,000',
  'predictable-id': '$2,000 - $50,000',
  'sensitive-hidden': '$500 - $25,000',
  'no-validation': '$500 - $2,000',
  'password-autocomplete': '$100 - $500',
  'inline-handler': '$500 - $2,000',
  'state-changing-get': '$1,000 - $5,000',
  'missing-maxlength': '$100 - $500',
};
