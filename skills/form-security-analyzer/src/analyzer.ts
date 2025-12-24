/**
 * Form Security Analyzer
 *
 * Static analysis of HTML forms for security vulnerabilities.
 * No requests sent - safe to run on any file.
 */

import { readFileSync, existsSync } from 'fs';
import { load, type CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import { basename } from 'path';
import type { SecurityIssue, FormAnalysis, AnalysisResult, Summary } from './types.js';
import { BOUNTY_ESTIMATES } from './types.js';

const CSRF_PATTERNS = [
  'csrf', '_csrf', 'csrfToken', 'csrf_token', '_token',
  'authenticity_token', 'xsrf', '_xsrf',
];

const DANGEROUS_ACTIONS = ['delete', 'remove', 'update', 'edit', 'transfer', 'send'];
const ID_PATTERNS = ['user_id', 'userId', 'account_id', 'accountId', 'id', 'uid'];
const SENSITIVE_PATTERNS = [
  'api_key', 'apiKey', 'secret', 'token', 'password', 'key',
  'admin', 'role', 'permission', 'access',
];
const INLINE_HANDLERS = ['onsubmit', 'onclick', 'onchange', 'oninput', 'onfocus', 'onblur'];

function analyzeForm(
  $: CheerioAPI,
  form: Element,
  formIndex: number
): FormAnalysis {
  const issues: SecurityIssue[] = [];
  const $form = $(form);
  const formId = $form.attr('id') || $form.attr('name') || `form-${formIndex}`;
  const action = $form.attr('action') || '';
  const method = ($form.attr('method') || 'GET').toUpperCase();

  // 1. Check for CSRF token
  const hiddenInputs = $form.find("input[type='hidden']").toArray();
  const hasCSRFField = hiddenInputs.some((input) => {
    const name = $(input).attr('name') || '';
    return CSRF_PATTERNS.some((pattern) =>
      name.toLowerCase().includes(pattern.toLowerCase())
    );
  });

  const hasCSRFMeta =
    $("meta[name*='csrf']").length > 0 || $("meta[name*='xsrf']").length > 0;

  if (!hasCSRFField && !hasCSRFMeta && method === 'POST') {
    issues.push({
      severity: 'critical',
      type: 'missing-csrf',
      message: 'Form lacks CSRF protection',
      detail:
        'No hidden CSRF token field found. Vulnerable to cross-site request forgery.',
      bounty: BOUNTY_ESTIMATES['missing-csrf'],
      owasp: 'A01',
      cwe: 'CWE-352',
    });
  }

  // 2. Check action URL security
  if (action.startsWith('http://')) {
    issues.push({
      severity: 'critical',
      type: 'http-action',
      message: 'Form submits over insecure HTTP',
      detail: `Action URL: ${action}`,
      bounty: BOUNTY_ESTIMATES['http-action'],
      owasp: 'A02',
      cwe: 'CWE-319',
    });
  }

  // 3. Check for state-changing GET requests
  if (method === 'GET') {
    const isDangerous = DANGEROUS_ACTIONS.some((word) =>
      action.toLowerCase().includes(word)
    );

    if (isDangerous) {
      issues.push({
        severity: 'high',
        type: 'state-changing-get',
        message: 'State-changing action uses GET method',
        detail: `Action "${action}" should use POST to prevent CSRF via link`,
        bounty: BOUNTY_ESTIMATES['state-changing-get'],
        owasp: 'A01',
        cwe: 'CWE-352',
      });
    }
  }

  // 4. Analyze hidden fields
  hiddenInputs.forEach((input) => {
    const name = $(input).attr('name') || '';
    const value = $(input).attr('value') || '';

    // Check for predictable IDs
    if (ID_PATTERNS.some((p) => name.toLowerCase() === p.toLowerCase())) {
      if (/^\d+$/.test(value)) {
        issues.push({
          severity: 'high',
          type: 'predictable-id',
          message: `Predictable ID in hidden field: ${name}`,
          detail: `Value "${value}" appears to be a sequential ID. Classic IDOR target.`,
          bounty: BOUNTY_ESTIMATES['predictable-id'],
          owasp: 'A01',
          cwe: 'CWE-639',
        });
      }
    }

    // Check for sensitive data
    if (
      SENSITIVE_PATTERNS.some((p) =>
        name.toLowerCase().includes(p.toLowerCase())
      )
    ) {
      // Skip CSRF tokens
      if (
        !CSRF_PATTERNS.some((p) =>
          name.toLowerCase().includes(p.toLowerCase())
        )
      ) {
        issues.push({
          severity: 'high',
          type: 'sensitive-hidden',
          message: `Potentially sensitive data in hidden field: ${name}`,
          detail:
            'Hidden field may expose sensitive information or allow privilege manipulation',
          bounty: BOUNTY_ESTIMATES['sensitive-hidden'],
          owasp: 'A01',
          cwe: 'CWE-200',
        });
      }
    }
  });

  // 5. Check input validation
  $form
    .find(
      "input:not([type='hidden']):not([type='submit']):not([type='button'])"
    )
    .each((_, input) => {
      const name = $(input).attr('name') || '';
      const type = $(input).attr('type') || 'text';
      const hasMaxlength = $(input).attr('maxlength');

      // Email fields should have proper validation
      if (name.toLowerCase().includes('email') && type !== 'email') {
        issues.push({
          severity: 'medium',
          type: 'no-validation',
          message: `Email field "${name}" missing type="email"`,
          detail: 'Browser validation not enforced',
          bounty: BOUNTY_ESTIMATES['no-validation'],
          owasp: 'A03',
          cwe: 'CWE-20',
        });
      }

      // Password fields
      if (type === 'password') {
        const autocomplete = $(input).attr('autocomplete');
        if (!autocomplete || autocomplete === 'on') {
          issues.push({
            severity: 'medium',
            type: 'password-autocomplete',
            message: `Password field "${name}" allows autocomplete`,
            detail: "Browser may cache password. Use autocomplete='new-password'",
            bounty: BOUNTY_ESTIMATES['password-autocomplete'],
            owasp: 'A07',
            cwe: 'CWE-522',
          });
        }
      }

      // Text inputs without maxlength
      if ((type === 'text' || type === 'password') && !hasMaxlength) {
        issues.push({
          severity: 'low',
          type: 'missing-maxlength',
          message: `Input "${name}" missing maxlength attribute`,
          detail: 'Could allow excessively long input',
          bounty: BOUNTY_ESTIMATES['missing-maxlength'],
          owasp: 'A03',
          cwe: 'CWE-20',
        });
      }
    });

  // 6. Check for inline handlers (XSS surface)
  INLINE_HANDLERS.forEach((handler) => {
    if ($form.attr(handler)) {
      issues.push({
        severity: 'medium',
        type: 'inline-handler',
        message: `Inline ${handler} handler on form`,
        detail: 'Inline JavaScript increases XSS attack surface',
        bounty: BOUNTY_ESTIMATES['inline-handler'],
        owasp: 'A03',
        cwe: 'CWE-79',
      });
    }
  });

  return {
    id: formId,
    action,
    method,
    issues,
  };
}

export function analyzeFile(filePath: string): AnalysisResult {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const html = readFileSync(filePath, 'utf-8');
  const $ = load(html);
  const forms = $('form').toArray();

  if (forms.length === 0) {
    return {
      file: basename(filePath),
      path: filePath,
      timestamp: new Date().toISOString(),
      forms: [],
      summary: { critical: 0, high: 0, medium: 0, low: 0 },
    };
  }

  const analyzedForms = forms.map((form, index) =>
    analyzeForm($, form, index)
  );

  // Calculate summary
  const summary: Summary = { critical: 0, high: 0, medium: 0, low: 0 };
  analyzedForms.forEach((form) => {
    form.issues.forEach((issue) => {
      summary[issue.severity]++;
    });
  });

  return {
    file: basename(filePath),
    path: filePath,
    timestamp: new Date().toISOString(),
    forms: analyzedForms,
    summary,
  };
}
