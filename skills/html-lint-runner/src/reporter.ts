/**
 * Result reporting for lint results
 */

import type { LintResults } from './types.js';

export function printJsonResults(results: LintResults): void {
  console.log(JSON.stringify(results, null, 2));
}

export function printTextResults(results: LintResults): void {
  console.log(`
# HTML Lint Report: ${results.file}
**Timestamp**: ${results.timestamp}

## Summary
- axe-core violations: ${results.summary.axe_violations}
- markuplint problems: ${results.summary.markuplint_problems}
- Total issues: ${results.summary.total_issues}
`);

  // axe-core violations
  if (results.axe.violations.length > 0) {
    console.log(`## Accessibility Violations (axe-core)\n`);

    results.axe.violations.forEach((v, index) => {
      console.log(`### ${index + 1}. ${v.id} [${v.impact.toUpperCase()}]`);
      console.log(`**Description**: ${v.description}`);
      console.log(`**Help**: ${v.help}`);
      console.log(`**Reference**: ${v.helpUrl}`);
      console.log(`\n**Affected Elements**:`);
      v.nodes.forEach((n) => {
        console.log(`- \`${n.html.substring(0, 80)}${n.html.length > 80 ? '...' : ''}\``);
        if (n.failureSummary) {
          console.log(`  Fix: ${n.failureSummary.split('\n')[0]}`);
        }
      });
      console.log('');
    });
  }

  // markuplint problems
  if (results.markuplint.problems.length > 0) {
    console.log(`## HTML Standards Problems (markuplint)\n`);

    results.markuplint.problems.forEach((p, index) => {
      console.log(
        `### ${index + 1}. ${p.ruleId} [${p.severity.toUpperCase()}] (Line ${p.line}:${p.col})`
      );
      console.log(`**Message**: ${p.message}`);
      console.log(`**Code**: \`${p.raw.substring(0, 60)}${p.raw.length > 60 ? '...' : ''}\``);
      console.log('');
    });
  }

  if (results.summary.total_issues === 0) {
    console.log(`## All Checks Passed\n`);
    console.log(`No accessibility violations or HTML standard problems found.`);
  }

  if (results.axe.error) {
    console.log(`\n## Errors\n`);
    console.log(`axe-core error: ${results.axe.error}`);
  }
}
