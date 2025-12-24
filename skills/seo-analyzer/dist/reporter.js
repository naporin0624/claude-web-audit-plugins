/**
 * Report formatting for SEO and Keyword analysis
 */
const SEVERITY_LEVELS = {
    CRITICAL: 'critical',
    IMPORTANT: 'important',
    RECOMMENDED: 'recommended',
};
export function formatSEOTextReport(report) {
    let output = `# SEO Analysis Report: ${report.file}\n\n`;
    output += `Analyzed at: ${report.timestamp}\n`;
    if (report.confidence < 100) {
        output += `\nConfidence: ${report.confidence}%\n`;
        for (const w of report.warnings) {
            output += `   ${w.message}\n`;
        }
    }
    output += `\n## Summary\n`;
    output += `- Critical: ${report.summary.critical}\n`;
    output += `- Important: ${report.summary.important}\n`;
    output += `- Recommended: ${report.summary.recommended}\n`;
    output += `- Passed: ${report.summary.passed}\n`;
    const criticalIssues = report.issues.filter((i) => i.severity === SEVERITY_LEVELS.CRITICAL);
    if (criticalIssues.length > 0) {
        output += `\n## Critical Issues (P0)\n\n`;
        criticalIssues.forEach((issue, idx) => {
            output += `### ${idx + 1}. ${issue.message}\n`;
            output += `**Check**: ${issue.check}\n`;
            output += `**Fix**: ${issue.fix}\n`;
            if (issue.current)
                output += `**Current**: ${issue.current}\n`;
            output += `\n`;
        });
    }
    const importantIssues = report.issues.filter((i) => i.severity === SEVERITY_LEVELS.IMPORTANT);
    if (importantIssues.length > 0) {
        output += `\n## Important Issues (P1)\n\n`;
        importantIssues.forEach((issue, idx) => {
            output += `### ${idx + 1}. ${issue.message}\n`;
            output += `**Check**: ${issue.check}\n`;
            output += `**Fix**: ${issue.fix}\n`;
            if (issue.current)
                output += `**Current**: ${issue.current}\n`;
            output += `\n`;
        });
    }
    const recommendedIssues = report.issues.filter((i) => i.severity === SEVERITY_LEVELS.RECOMMENDED);
    if (recommendedIssues.length > 0) {
        output += `\n## Recommended Improvements (P2)\n\n`;
        recommendedIssues.forEach((issue, idx) => {
            output += `### ${idx + 1}. ${issue.message}\n`;
            output += `**Fix**: ${issue.fix}\n`;
            output += `\n`;
        });
    }
    if (report.passed.length > 0) {
        output += `\n## Passed Checks\n\n`;
        report.passed.forEach((p) => {
            output += `- [PASS] ${p.check}: ${p.value}\n`;
        });
    }
    return output;
}
export function formatKeywordTextReport(report) {
    let output = `# Keyword Analysis: ${report.file}\n\n`;
    output += `## Stats\n`;
    output += `- Total words: ${report.stats.totalWords}\n`;
    output += `- Unique words: ${report.stats.uniqueWords}\n\n`;
    output += `## Primary Keywords (by score)\n\n`;
    output += `| Keyword | Score | Freq | Title | H1 | Description |\n`;
    output += `|---------|-------|------|-------|----|-----------|\n`;
    for (const kw of report.primaryKeywords) {
        output += `| ${kw.word} | ${kw.score} | ${kw.frequency} | ${kw.inTitle ? 'Y' : ''} | ${kw.inH1 ? 'Y' : ''} | ${kw.inDescription ? 'Y' : ''} |\n`;
    }
    if (report.keyPhrases.length > 0) {
        output += `\n## Key Phrases\n\n`;
        output += `| Phrase | Score | Freq | Title | H1 |\n`;
        output += `|--------|-------|------|-------|----|\n`;
        for (const p of report.keyPhrases) {
            output += `| ${p.phrase} | ${p.score} | ${p.frequency} | ${p.inTitle ? 'Y' : ''} | ${p.inH1 ? 'Y' : ''} |\n`;
        }
    }
    output += `\n## Keyword Density\n\n`;
    for (const d of report.density) {
        output += `- ${d.word}: ${d.density}\n`;
    }
    if (report.recommendations.length > 0) {
        output += `\n## Recommendations\n\n`;
        for (const rec of report.recommendations) {
            output += `- ${rec}\n`;
        }
    }
    output += `\n## Current Placement\n\n`;
    output += `**Title**: ${report.placement.title || '(empty)'}\n`;
    output += `**H1**: ${report.placement.h1 || '(empty)'}\n`;
    output += `**Description**: ${report.placement.description || '(empty)'}\n`;
    return output;
}
export function formatCombinedTextReport(seoReport, keywordReport) {
    let output = formatSEOTextReport(seoReport);
    output += '\n---\n\n';
    output += formatKeywordTextReport(keywordReport);
    return output;
}
