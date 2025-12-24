/**
 * security.txt Validator
 * Validates security.txt against RFC 9116
 */

import type { FileReport, Issue, PassedCheck } from '../types.js';
import { SEVERITY, createIssue, createPassed } from './common.js';

interface FieldEntry {
  value: string;
  line: number;
}

const REQUIRED_FIELDS = ['contact', 'expires'];
const OPTIONAL_FIELDS = [
  'encryption',
  'acknowledgments',
  'preferred-languages',
  'canonical',
  'policy',
  'hiring',
];
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

export class SecurityTxtValidator {
  private content: string;
  private source: string;
  private issues: Issue[] = [];
  private passed: PassedCheck[] = [];
  private fields: Record<string, FieldEntry[]> = {};

  constructor(content: string, source = 'security.txt') {
    this.content = content;
    this.source = source;
  }

  validate(): FileReport {
    if (!this.content || this.content.trim() === '') {
      this.issues.push(
        createIssue(
          SEVERITY.CRITICAL,
          'empty-file',
          'security.txt is empty',
          'Add Contact and Expires fields per RFC 9116'
        )
      );
      return this.generateReport();
    }

    this.parse();
    this.checkRequiredFields();
    this.checkExpires();
    this.checkContact();
    this.checkOptionalFields();

    return this.generateReport();
  }

  private parse(): void {
    const lines = this.content.split(/\r?\n/);
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber++;
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) {
        this.issues.push(
          createIssue(
            SEVERITY.IMPORTANT,
            'syntax-error',
            `Invalid syntax at line ${lineNumber}: missing colon`,
            'Use format: Field: value',
            { line: lineNumber, content: trimmed }
          )
        );
        continue;
      }

      const field = trimmed.substring(0, colonIndex).trim().toLowerCase();
      const value = trimmed.substring(colonIndex + 1).trim();

      if (!ALL_FIELDS.includes(field)) {
        this.issues.push(
          createIssue(
            SEVERITY.RECOMMENDED,
            'unknown-field',
            `Unknown field "${field}" at line ${lineNumber}`,
            `Valid fields: ${ALL_FIELDS.join(', ')}`,
            { line: lineNumber, directive: field }
          )
        );
        continue;
      }

      if (!this.fields[field]) {
        this.fields[field] = [];
      }
      this.fields[field].push({ value, line: lineNumber });
    }
  }

  private checkRequiredFields(): void {
    if (!this.fields.contact || this.fields.contact.length === 0) {
      this.issues.push(
        createIssue(
          SEVERITY.CRITICAL,
          'missing-contact',
          'Missing required Contact field',
          'Add Contact: mailto:security@example.com or Contact: https://example.com/security'
        )
      );
    } else {
      this.passed.push(
        createPassed(
          'contact',
          `${this.fields.contact.length} Contact field(s) found`
        )
      );
    }

    if (!this.fields.expires || this.fields.expires.length === 0) {
      this.issues.push(
        createIssue(
          SEVERITY.CRITICAL,
          'missing-expires',
          'Missing required Expires field',
          'Add Expires: 2025-12-31T23:59:59.000Z'
        )
      );
    } else if (this.fields.expires.length > 1) {
      this.issues.push(
        createIssue(
          SEVERITY.IMPORTANT,
          'multiple-expires',
          'Multiple Expires fields found (only one allowed)',
          'Keep only one Expires field',
          { count: this.fields.expires.length }
        )
      );
    }
  }

  private checkExpires(): void {
    if (!this.fields.expires || this.fields.expires.length === 0) {
      return;
    }

    const expires = this.fields.expires[0];
    const value = expires.value;

    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2})$/;
    if (!isoRegex.test(value)) {
      this.issues.push(
        createIssue(
          SEVERITY.IMPORTANT,
          'invalid-expires-format',
          'Expires field is not in ISO 8601 format',
          'Use format: YYYY-MM-DDTHH:MM:SS.sssZ (e.g., 2025-12-31T23:59:59.000Z)',
          { value, line: expires.line }
        )
      );
      return;
    }

    const expiresDate = new Date(value);
    const now = new Date();

    if (expiresDate <= now) {
      this.issues.push(
        createIssue(
          SEVERITY.CRITICAL,
          'expired',
          'Expires date is in the past',
          'Update Expires to a future date',
          { expires: value, line: expires.line }
        )
      );
    } else {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (expiresDate > oneYearFromNow) {
        this.issues.push(
          createIssue(
            SEVERITY.RECOMMENDED,
            'expires-too-far',
            'Expires date is more than 1 year in future',
            'RFC 9116 recommends setting validity to maximum 1 year',
            { expires: value, line: expires.line }
          )
        );
      } else {
        this.passed.push(
          createPassed('expires-valid', `Expires: ${value}`, {
            daysUntilExpiry: Math.ceil(
              (expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            ),
          })
        );
      }
    }
  }

  private checkContact(): void {
    if (!this.fields.contact) {
      return;
    }

    for (const contact of this.fields.contact) {
      const value = contact.value;

      const validPrefixes = ['mailto:', 'https://', 'tel:'];
      const hasValidPrefix = validPrefixes.some((prefix) =>
        value.toLowerCase().startsWith(prefix)
      );

      if (!hasValidPrefix) {
        this.issues.push(
          createIssue(
            SEVERITY.IMPORTANT,
            'invalid-contact-format',
            `Contact at line ${contact.line} should start with mailto:, https://, or tel:`,
            'Use format: Contact: mailto:security@example.com',
            { value, line: contact.line }
          )
        );
      }

      if (value.toLowerCase().startsWith('mailto:')) {
        const email = value.substring(7);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          this.issues.push(
            createIssue(
              SEVERITY.IMPORTANT,
              'invalid-email',
              `Invalid email format in Contact at line ${contact.line}`,
              'Use valid email: mailto:security@example.com',
              { email, line: contact.line }
            )
          );
        }
      }

      if (value.toLowerCase().startsWith('https://')) {
        try {
          new URL(value);
        } catch {
          this.issues.push(
            createIssue(
              SEVERITY.IMPORTANT,
              'invalid-url',
              `Invalid URL format in Contact at line ${contact.line}`,
              'Use valid URL: https://example.com/security',
              { url: value, line: contact.line }
            )
          );
        }
      }
    }
  }

  private checkOptionalFields(): void {
    if (!this.fields.canonical) {
      this.issues.push(
        createIssue(
          SEVERITY.RECOMMENDED,
          'missing-canonical',
          'Missing Canonical field',
          'Add Canonical: https://example.com/.well-known/security.txt'
        )
      );
    } else {
      this.passed.push(createPassed('canonical', this.fields.canonical[0].value));
    }

    if (this.fields['preferred-languages']) {
      this.passed.push(
        createPassed(
          'preferred-languages',
          this.fields['preferred-languages'][0].value
        )
      );
    }

    if (this.fields.encryption) {
      this.passed.push(
        createPassed('encryption', `${this.fields.encryption.length} key(s) linked`)
      );
    }

    if (this.fields.policy) {
      this.passed.push(createPassed('policy', this.fields.policy[0].value));
    }
  }

  private generateReport(): FileReport {
    return {
      file: 'security.txt',
      source: this.source,
      found: true,
      valid: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length === 0,
      summary: {
        critical: this.issues.filter((i) => i.severity === SEVERITY.CRITICAL).length,
        important: this.issues.filter((i) => i.severity === SEVERITY.IMPORTANT).length,
        recommended: this.issues.filter((i) => i.severity === SEVERITY.RECOMMENDED).length,
        passed: this.passed.length,
      },
      issues: this.issues,
      passed: this.passed,
      fields: Object.keys(this.fields),
    };
  }
}

export function createNotFoundReport(source: string): FileReport {
  return {
    file: 'security.txt',
    source,
    found: false,
    valid: false,
    summary: { critical: 0, important: 1, recommended: 0, passed: 0 },
    issues: [
      createIssue(
        SEVERITY.IMPORTANT,
        'not-found',
        'security.txt not found',
        'Create /.well-known/security.txt per RFC 9116 for vulnerability disclosure. CISA recommends adoption.'
      ),
    ],
    passed: [],
  };
}
