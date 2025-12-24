/**
 * Report formatting for Web Resource Checker
 */
const FILE_PATHS = {
    sitemap: ['sitemap.xml'],
    robots: ['robots.txt'],
    security: ['.well-known/security.txt'],
    llms: ['llms.txt'],
    'llms-full': ['llms-full.txt'],
};
export function formatTextReport(report) {
    const lines = [];
    lines.push('# Web Resource Audit Report');
    lines.push('');
    lines.push(`## Target: ${report.summary.target}`);
    lines.push(`Analyzed at: ${report.summary.timestamp}`);
    lines.push('');
    lines.push('---');
    lines.push('');
    // Files summary table
    lines.push('## Files Found');
    lines.push('');
    lines.push('| File | Status | Issues |');
    lines.push('|------|--------|--------|');
    for (const [key, file] of Object.entries(report.files)) {
        const status = file.found ? 'Found' : 'Not Found';
        const issueCount = file.found
            ? `${file.summary.critical + file.summary.important + file.summary.recommended}`
            : '-';
        lines.push(`| ${file.file} | ${status} | ${issueCount} |`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
    // Issues by file
    lines.push('## Issues');
    lines.push('');
    for (const [, file] of Object.entries(report.files)) {
        if (!file.issues || file.issues.length === 0)
            continue;
        lines.push(`### ${file.file}`);
        lines.push('');
        for (let i = 0; i < file.issues.length; i++) {
            const issue = file.issues[i];
            const severityLabel = issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1);
            lines.push(`${i + 1}. **${issue.message}** (${severityLabel})`);
            lines.push(`   - Fix: ${issue.fix}`);
        }
        lines.push('');
    }
    // Summary
    lines.push('---');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push(`- Files checked: ${report.summary.totalFiles} (${report.summary.found} found)`);
    lines.push(`- Valid files: ${report.summary.valid}`);
    lines.push(`- Critical issues: ${report.summary.issues.critical}`);
    lines.push(`- Important issues: ${report.summary.issues.important}`);
    lines.push(`- Recommended improvements: ${report.summary.issues.recommended}`);
    // Recommendations
    const missingFiles = Object.entries(report.files)
        .filter(([, f]) => !f.found)
        .map(([key]) => key);
    if (missingFiles.length > 0) {
        lines.push('');
        lines.push('## Recommendations');
        lines.push('');
        for (const file of missingFiles) {
            const paths = FILE_PATHS[file];
            if (paths) {
                lines.push(`- Create ${paths[0]} for better web presence`);
            }
        }
    }
    return lines.join('\n');
}
