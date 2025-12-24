/**
 * robots.txt Validator
 * Validates robots.txt against RFC 9309
 */

import type { FileReport, Issue, PassedCheck } from '../types.js';
import { SEVERITY, createIssue, createPassed } from './common.js';

interface Rule {
  userAgent: string;
  disallow: string[];
  allow: string[];
  line: number;
}

interface SitemapRef {
  url: string;
  line: number;
}

const VALID_DIRECTIVES = [
  'user-agent',
  'disallow',
  'allow',
  'sitemap',
  'crawl-delay',
  'host',
];

export class RobotsValidator {
  private content: string;
  private source: string;
  private issues: Issue[] = [];
  private passed: PassedCheck[] = [];
  private rules: Rule[] = [];
  private sitemaps: SitemapRef[] = [];

  constructor(content: string, source = 'robots.txt') {
    this.content = content;
    this.source = source;
  }

  validate(): FileReport {
    if (!this.content || this.content.trim() === '') {
      this.issues.push(
        createIssue(
          SEVERITY.IMPORTANT,
          'empty-file',
          'robots.txt is empty',
          'Add User-agent and Disallow/Allow directives'
        )
      );
      return this.generateReport();
    }

    this.checkSize();
    this.parse();
    this.checkUserAgents();
    this.checkSitemap();
    this.checkBlockingAll();

    return this.generateReport();
  }

  private checkSize(): void {
    const sizeBytes = Buffer.byteLength(this.content, 'utf8');
    const maxBytes = 512000; // 500KB

    if (sizeBytes > maxBytes) {
      this.issues.push(
        createIssue(
          SEVERITY.IMPORTANT,
          'file-too-large',
          `robots.txt is ${(sizeBytes / 1024).toFixed(1)}KB (max 500KB)`,
          'Reduce file size or simplify rules',
          { sizeBytes, maxBytes }
        )
      );
    } else {
      this.passed.push(
        createPassed('file-size', `${(sizeBytes / 1024).toFixed(1)}KB`, {
          maxKB: 500,
        })
      );
    }
  }

  private parse(): void {
    const lines = this.content.split(/\r?\n/);
    let currentUserAgent: string | null = null;
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
            'Use format: Directive: value',
            { line: lineNumber, content: trimmed }
          )
        );
        continue;
      }

      const directive = trimmed.substring(0, colonIndex).trim().toLowerCase();
      const value = trimmed.substring(colonIndex + 1).trim();

      if (!VALID_DIRECTIVES.includes(directive)) {
        this.issues.push(
          createIssue(
            SEVERITY.RECOMMENDED,
            'unknown-directive',
            `Unknown directive "${directive}" at line ${lineNumber}`,
            `Valid directives: ${VALID_DIRECTIVES.join(', ')}`,
            { line: lineNumber, directive }
          )
        );
        continue;
      }

      if (directive === 'user-agent') {
        currentUserAgent = value;
        this.rules.push({
          userAgent: value,
          disallow: [],
          allow: [],
          line: lineNumber,
        });
        continue;
      }

      if (directive === 'sitemap') {
        this.sitemaps.push({ url: value, line: lineNumber });
        continue;
      }

      if (directive === 'disallow' || directive === 'allow') {
        if (!currentUserAgent) {
          this.issues.push(
            createIssue(
              SEVERITY.IMPORTANT,
              'directive-without-agent',
              `${directive} at line ${lineNumber} has no preceding User-agent`,
              'Add User-agent: * before this directive',
              { line: lineNumber }
            )
          );
          continue;
        }

        const lastRule = this.rules[this.rules.length - 1];
        if (directive === 'disallow') {
          lastRule.disallow.push(value);
        } else {
          lastRule.allow.push(value);
        }
      }
    }
  }

  private checkUserAgents(): void {
    if (this.rules.length === 0) {
      this.issues.push(
        createIssue(
          SEVERITY.IMPORTANT,
          'no-user-agent',
          'No User-agent directive found',
          'Add User-agent: * to apply rules to all crawlers'
        )
      );
      return;
    }

    const hasWildcard = this.rules.some((r) => r.userAgent === '*');
    if (hasWildcard) {
      this.passed.push(createPassed('user-agent-wildcard', 'User-agent: * found'));
    } else {
      this.issues.push(
        createIssue(
          SEVERITY.RECOMMENDED,
          'no-wildcard-agent',
          'No wildcard User-agent: * found',
          'Add User-agent: * as fallback for unspecified crawlers',
          { agents: this.rules.map((r) => r.userAgent) }
        )
      );
    }

    this.passed.push(
      createPassed('user-agents', `${this.rules.length} user-agent blocks found`)
    );
  }

  private checkSitemap(): void {
    if (this.sitemaps.length === 0) {
      this.issues.push(
        createIssue(
          SEVERITY.RECOMMENDED,
          'missing-sitemap',
          'No Sitemap directive found',
          'Add Sitemap: https://example.com/sitemap.xml for better discoverability'
        )
      );
      return;
    }

    for (const sitemap of this.sitemaps) {
      if (
        !sitemap.url.startsWith('http://') &&
        !sitemap.url.startsWith('https://')
      ) {
        this.issues.push(
          createIssue(
            SEVERITY.IMPORTANT,
            'relative-sitemap-url',
            `Sitemap URL at line ${sitemap.line} is not absolute`,
            'Use absolute URL: Sitemap: https://example.com/sitemap.xml',
            { line: sitemap.line, url: sitemap.url }
          )
        );
      }
    }

    this.passed.push(
      createPassed('sitemap', `${this.sitemaps.length} Sitemap directive(s) found`, {
        urls: this.sitemaps.map((s) => s.url),
      })
    );
  }

  private checkBlockingAll(): void {
    for (const rule of this.rules) {
      if (
        rule.userAgent === '*' &&
        rule.disallow.includes('/') &&
        rule.allow.length === 0
      ) {
        this.issues.push(
          createIssue(
            SEVERITY.CRITICAL,
            'blocking-all',
            'Disallow: / blocks all crawlers from entire site',
            'Remove or modify if unintended. This prevents search engine indexing.',
            { userAgent: rule.userAgent, line: rule.line }
          )
        );
      }

      if (
        rule.userAgent !== '*' &&
        rule.disallow.includes('/') &&
        rule.allow.length === 0
      ) {
        this.passed.push(
          createPassed('bot-blocked', `${rule.userAgent} is blocked from site`, {
            userAgent: rule.userAgent,
          })
        );
      }
    }
  }

  private generateReport(): FileReport {
    return {
      file: 'robots.txt',
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
      stats: {
        userAgents: this.rules.length,
        sitemaps: this.sitemaps.length,
      },
    };
  }
}

export function createNotFoundReport(source: string): FileReport {
  return {
    file: 'robots.txt',
    source,
    found: false,
    valid: true,
    summary: { critical: 0, important: 0, recommended: 1, passed: 0 },
    issues: [
      createIssue(
        SEVERITY.RECOMMENDED,
        'not-found',
        'robots.txt not found',
        'Consider adding robots.txt to control crawler access'
      ),
    ],
    passed: [],
  };
}
