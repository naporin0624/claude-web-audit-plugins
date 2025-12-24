/**
 * Result reporting for security tests
 */

import type { TestOptions, TestResults, TestType } from './types.js';
import { PAYLOADS, BOUNTY_ESTIMATES } from './payloads.js';

export function printDryRun(options: TestOptions): void {
  console.log(`
DRY RUN MODE

Target: ${options.url}
Form: ${options.formSelector || 'All forms'}
Tests: ${options.tests.join(', ')}

Payloads that would be sent:
`);

  for (const testType of options.tests) {
    const payloads = PAYLOADS[testType] || [];
    console.log(
      `\n[${testType.toUpperCase()}] - Bounty: ${BOUNTY_ESTIMATES[testType]}`
    );
    payloads.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name}: ${p.value.substring(0, 50)}...`);
    });
  }

  console.log(`\nNo requests sent. Remove --dry-run to execute tests.\n`);
}

export function printResults(results: TestResults): void {
  console.log(`
# Security Test Results

**Target**: ${results.target}
**Timestamp**: ${results.timestamp}

## Summary
- Total tests: ${results.summary.total}
- Vulnerabilities found: ${results.summary.vulnerable}
`);

  const vulnerabilities = results.tests.filter((t) => t.vulnerable);

  if (vulnerabilities.length > 0) {
    console.log(`## Vulnerabilities Found\n`);

    vulnerabilities.forEach((vuln, index) => {
      const testType = vuln.testType as TestType;
      console.log(
        `### ${index + 1}. ${testType.toUpperCase()} - ${vuln.payloadName}`
      );
      console.log(`**Severity**: HIGH`);
      console.log(`**Bounty Estimate**: ${BOUNTY_ESTIMATES[testType]}`);
      console.log(`**Form**: ${vuln.form}`);
      console.log(`**Field**: ${vuln.field}`);
      console.log(`**Payload**: \`${vuln.payload}\``);
      console.log(`\n**Evidence**:`);
      vuln.evidence.forEach((e) => console.log(`- ${e}`));
      if (vuln.screenshot) {
        console.log(`\n**Screenshot**: ${vuln.screenshot}`);
      }
      console.log(`\n---\n`);
    });
  } else {
    console.log(`## No Vulnerabilities Found\n`);
    console.log(
      `All ${results.summary.total} tests passed without detecting vulnerabilities.`
    );
  }
}
