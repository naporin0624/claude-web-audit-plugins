/**
 * Common validator utilities
 */
export const SEVERITY = {
    CRITICAL: 'critical',
    IMPORTANT: 'important',
    RECOMMENDED: 'recommended',
};
export function createIssue(severity, check, message, fix, details = {}) {
    return { severity, check, message, fix, ...details };
}
export function createPassed(check, value, details = {}) {
    return { check, value, ...details };
}
