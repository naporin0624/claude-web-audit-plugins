---
description: Run accessibility and HTML lint audit on files, then provide fix SUGGESTIONS (does NOT modify files) using WCAG/ARIA references
argument-hint: <file-or-glob-pattern>
allowed-tools: Bash, Read, Glob, Grep, Task
---

# Accessibility & HTML Lint Audit (Suggestion Only)

Run automated accessibility (axe-core) and HTML standards (markuplint) checks on the specified files, then provide detailed fix **suggestions** based on WCAG 2.1 AA criteria and WAI-ARIA patterns.

> **Note**: This command analyzes files and suggests fixes but does NOT automatically apply changes. You decide which fixes to implement.

## Target Files

$ARGUMENTS

## Workflow

1. **Find target files**: Identify HTML/JSX/TSX files matching the pattern
2. **Run lint tools**: Execute axe-core and markuplint via the html-lint-runner scripts
3. **Analyze results**: Parse JSON output and categorize issues by severity
4. **Lookup references**: Use wcag-aria-lookup skill to find relevant WCAG criteria and ARIA patterns
5. **Generate fixes**: Provide specific code fixes for each issue

## Instructions

Use the Task tool to spawn the `a11y-fixer` agent with the following information:
- The target file path(s): $ARGUMENTS
- Run the lint script: `bash ${CLAUDE_PLUGIN_ROOT}/skills/html-lint-runner/scripts/lint-html.sh`
- For each issue found, look up the relevant WCAG criterion or ARIA pattern
- Provide concrete fix examples with before/after code

**IMPORTANT**: The agent ONLY suggests fixes. It does NOT modify any files. Users must apply fixes manually.

The agent should produce a report in this format:

```markdown
# A11y Audit Report: [filename]

## Summary
- axe-core violations: [count]
- markuplint problems: [count]
- Total issues: [count]

## Issues & Fixes

### Issue 1: [Title] - [WCAG X.X.X / markuplint rule]

**Problem**: [description]
**Location**: Line [number]
**Severity**: [critical/serious/error/warning]

**Current code**:
\`\`\`html
[problematic code]
\`\`\`

**Fixed code**:
\`\`\`html
[corrected code]
\`\`\`

**Reference**: [W3C URL]

---
```
