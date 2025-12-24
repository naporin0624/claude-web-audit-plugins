/**
 * Type definitions for HTML Lint Runner
 */
export interface LintOptions {
    file: string;
    json: boolean;
    axeOnly: boolean;
    markuplintOnly: boolean;
}
export interface AxeViolation {
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    help: string;
    helpUrl: string;
    nodes: AxeNode[];
}
export interface AxeNode {
    html: string;
    target: string[];
    failureSummary?: string;
}
export interface AxePass {
    id: string;
    description: string;
    nodes: AxeNode[];
}
export interface AxeResults {
    violations: AxeViolation[];
    passes: AxePass[];
    incomplete: AxeViolation[];
    error?: string;
}
export interface MarkuplintProblem {
    severity: 'error' | 'warning';
    ruleId: string;
    message: string;
    line: number;
    col: number;
    raw: string;
}
export interface MarkuplintResults {
    problems: MarkuplintProblem[];
}
export interface LintSummary {
    axe_violations: number;
    markuplint_problems: number;
    total_issues: number;
}
export interface LintResults {
    file: string;
    timestamp: string;
    axe: AxeResults;
    markuplint: MarkuplintResults;
    summary: LintSummary;
}
//# sourceMappingURL=types.d.ts.map