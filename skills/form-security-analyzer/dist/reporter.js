/**
 * Report formatting for Form Security Analysis
 */
const SEVERITY_EMOJIS = {
    critical: '[CRITICAL]',
    high: '[HIGH]',
    medium: '[MEDIUM]',
    low: '[LOW]',
};
export function formatTextReport(result) {
    const totalIssues = result.summary.critical +
        result.summary.high +
        result.summary.medium +
        result.summary.low;
    let output = `# Form Security Analysis: ${result.file}\n\n`;
    output += `Analyzed at: ${result.timestamp}\n\n`;
    output += `## Summary\n\n`;
    output += `| Severity | Count |\n`;
    output += `|----------|-------|\n`;
    output += `| Critical | ${result.summary.critical} |\n`;
    output += `| High | ${result.summary.high} |\n`;
    output += `| Medium | ${result.summary.medium} |\n`;
    output += `| Low | ${result.summary.low} |\n`;
    output += `| **Total** | **${totalIssues}** |\n\n`;
    if (result.forms.length === 0) {
        output += 'No forms found in file.\n';
        return output;
    }
    // Group by severity
    const allIssues = result.forms.flatMap((form) => form.issues.map((issue) => ({
        ...issue,
        formId: form.id,
        formAction: form.action,
    })));
    const severities = ['critical', 'high', 'medium', 'low'];
    severities.forEach((severity) => {
        const issues = allIssues.filter((i) => i.severity === severity);
        if (issues.length === 0)
            return;
        output += `## ${severity.charAt(0).toUpperCase() + severity.slice(1)} Issues ${SEVERITY_EMOJIS[severity]}\n\n`;
        issues.forEach((issue, index) => {
            output += `### ${index + 1}. ${issue.message}\n`;
            output += `**Form**: #${issue.formId}\n`;
            output += `**Type**: ${issue.type}\n`;
            output += `**Bounty Estimate**: ${issue.bounty}\n`;
            output += `**OWASP**: ${issue.owasp} | **CWE**: ${issue.cwe}\n\n`;
            output += `${issue.detail}\n\n`;
            output += `---\n\n`;
        });
    });
    // Hunting tips
    if (totalIssues > 0) {
        output += `## Hunting Tips\n\n`;
        output += `Based on this analysis:\n\n`;
        if (result.summary.critical > 0) {
            const csrfIssue = allIssues.find((i) => i.type === 'missing-csrf');
            if (csrfIssue) {
                output += `1. **Test CSRF**: Submit form #${csrfIssue.formId} from a different origin\n`;
            }
        }
        const idorIssue = allIssues.find((i) => i.type === 'predictable-id');
        if (idorIssue) {
            output += `2. **Test IDOR**: Change the hidden ID to access other users' data\n`;
        }
        output += `3. **Run dynamic tests**: Use playwright-security-runner for actual exploitation\n`;
        output += `4. **Check CVEs**: Search for vulnerabilities in any detected frameworks\n`;
    }
    return output;
}
