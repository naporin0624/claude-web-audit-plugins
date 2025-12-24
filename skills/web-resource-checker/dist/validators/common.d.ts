/**
 * Common validator utilities
 */
import type { Issue, PassedCheck, Severity } from '../types.js';
export declare const SEVERITY: Record<string, Severity>;
export declare function createIssue(severity: Severity, check: string, message: string, fix: string, details?: Partial<Issue>): Issue;
export declare function createPassed(check: string, value: string, details?: Partial<PassedCheck>): PassedCheck;
