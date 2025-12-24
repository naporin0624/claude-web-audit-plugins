/**
 * Common validator utilities
 */

import type { Issue, PassedCheck, Severity } from '../types.js';

export const SEVERITY: Record<string, Severity> = {
  CRITICAL: 'critical',
  IMPORTANT: 'important',
  RECOMMENDED: 'recommended',
};

export function createIssue(
  severity: Severity,
  check: string,
  message: string,
  fix: string,
  details: Partial<Issue> = {}
): Issue {
  return { severity, check, message, fix, ...details };
}

export function createPassed(
  check: string,
  value: string,
  details: Partial<PassedCheck> = {}
): PassedCheck {
  return { check, value, ...details };
}
