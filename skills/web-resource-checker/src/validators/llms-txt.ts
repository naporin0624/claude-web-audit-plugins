/**
 * llms.txt and llms-full.txt Validator
 * Validates against llmstxt.org specification
 */

import type { FileReport, Issue, PassedCheck } from '../types.js';
import { SEVERITY, createIssue, createPassed } from './common.js';

interface TitleInfo {
  text: string;
  line: number;
}

interface SummaryInfo {
  text: string;
  line: number;
}

interface SectionInfo {
  title: string;
  line: number;
  content: string[];
}

interface LinkInfo {
  text: string;
  url: string;
  line: number;
}

interface Structure {
  title: TitleInfo | null;
  summary: SummaryInfo | null;
  sections: SectionInfo[];
  links: LinkInfo[];
}

export class LlmsTxtValidator {
  private content: string;
  private source: string;
  private isFullVersion: boolean;
  private issues: Issue[] = [];
  private passed: PassedCheck[] = [];
  private structure: Structure = {
    title: null,
    summary: null,
    sections: [],
    links: [],
  };

  constructor(content: string, source = 'llms.txt', isFullVersion = false) {
    this.content = content;
    this.source = source;
    this.isFullVersion = isFullVersion;
  }

  validate(): FileReport {
    if (!this.content || this.content.trim() === '') {
      this.issues.push(
        createIssue(
          SEVERITY.CRITICAL,
          'empty-file',
          `${this.getFileName()} is empty`,
          'Add H1 title and content per llmstxt.org specification'
        )
      );
      return this.generateReport();
    }

    this.parse();
    this.checkTitle();
    this.checkSummary();
    this.checkSections();
    this.checkLinks();
    this.checkSize();

    return this.generateReport();
  }

  private getFileName(): string {
    return this.isFullVersion ? 'llms-full.txt' : 'llms.txt';
  }

  private parse(): void {
    const lines = this.content.split(/\r?\n/);
    let currentSection: SectionInfo | null = null;
    let inBlockquote = false;
    let blockquoteContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      if (line.startsWith('# ') && !this.structure.title) {
        this.structure.title = {
          text: line.substring(2).trim(),
          line: lineNumber,
        };
        continue;
      }

      if (line.startsWith('> ')) {
        inBlockquote = true;
        blockquoteContent.push(line.substring(2).trim());
        continue;
      } else if (inBlockquote && line.trim() === '') {
        if (!this.structure.summary && blockquoteContent.length > 0) {
          this.structure.summary = {
            text: blockquoteContent.join(' '),
            line: lineNumber - blockquoteContent.length,
          };
        }
        inBlockquote = false;
        blockquoteContent = [];
      }

      if (line.startsWith('## ')) {
        currentSection = {
          title: line.substring(3).trim(),
          line: lineNumber,
          content: [],
        };
        this.structure.sections.push(currentSection);
        continue;
      }

      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const matches = [...line.matchAll(linkRegex)];
      for (const match of matches) {
        this.structure.links.push({
          text: match[1],
          url: match[2],
          line: lineNumber,
        });
      }

      if (currentSection && line.trim()) {
        currentSection.content.push(line);
      }
    }

    if (inBlockquote && blockquoteContent.length > 0 && !this.structure.summary) {
      this.structure.summary = {
        text: blockquoteContent.join(' '),
        line: lines.length - blockquoteContent.length + 1,
      };
    }
  }

  private checkTitle(): void {
    if (!this.structure.title) {
      this.issues.push(
        createIssue(
          SEVERITY.CRITICAL,
          'missing-title',
          'Missing H1 title at start of file',
          'Start file with # Your Site Name'
        )
      );
      return;
    }

    if (this.structure.title.line !== 1) {
      const firstNonEmptyLine = this.content
        .split(/\r?\n/)
        .findIndex((l) => l.trim() !== '');
      if (firstNonEmptyLine + 1 !== this.structure.title.line) {
        this.issues.push(
          createIssue(
            SEVERITY.IMPORTANT,
            'title-not-first',
            `H1 title found at line ${this.structure.title.line}, should be first`,
            'Move H1 title to the beginning of the file'
          )
        );
      }
    }

    this.passed.push(
      createPassed('title', this.structure.title.text, {
        line: this.structure.title.line,
      })
    );
  }

  private checkSummary(): void {
    if (!this.structure.summary) {
      this.issues.push(
        createIssue(
          SEVERITY.IMPORTANT,
          'missing-summary',
          'Missing summary blockquote after title',
          'Add > Brief description of your site after the H1 title'
        )
      );
      return;
    }

    const summaryLength = this.structure.summary.text.length;
    if (summaryLength < 20) {
      this.issues.push(
        createIssue(
          SEVERITY.RECOMMENDED,
          'summary-too-short',
          `Summary is very short (${summaryLength} chars)`,
          'Add more context to help LLMs understand your site'
        )
      );
    } else {
      this.passed.push(
        createPassed('summary', `${summaryLength} characters`, {
          preview: this.structure.summary.text.substring(0, 100) + '...',
        })
      );
    }
  }

  private checkSections(): void {
    if (this.structure.sections.length === 0) {
      this.issues.push(
        createIssue(
          SEVERITY.RECOMMENDED,
          'no-sections',
          'No H2 sections found',
          'Add ## Section headings to organize content'
        )
      );
      return;
    }

    const hasOptional = this.structure.sections.some(
      (s) => s.title.toLowerCase() === 'optional'
    );
    if (!hasOptional && !this.isFullVersion) {
      this.issues.push(
        createIssue(
          SEVERITY.RECOMMENDED,
          'no-optional-section',
          'No "Optional" section found',
          'Add ## Optional section for less critical resources'
        )
      );
    }

    this.passed.push(
      createPassed('sections', `${this.structure.sections.length} section(s) found`, {
        sections: this.structure.sections.map((s) => s.title),
      })
    );
  }

  private checkLinks(): void {
    if (this.structure.links.length === 0 && !this.isFullVersion) {
      this.issues.push(
        createIssue(
          SEVERITY.RECOMMENDED,
          'no-links',
          'No markdown links found',
          'Add links in format: - [Link Text](https://example.com/page): Description'
        )
      );
      return;
    }

    let invalidLinks = 0;
    for (const link of this.structure.links) {
      if (
        !link.url.startsWith('http://') &&
        !link.url.startsWith('https://') &&
        !link.url.startsWith('/')
      ) {
        invalidLinks++;
      }
    }

    if (invalidLinks > 0) {
      this.issues.push(
        createIssue(
          SEVERITY.IMPORTANT,
          'invalid-links',
          `${invalidLinks} link(s) have potentially invalid URLs`,
          'Use absolute URLs (https://...) or root-relative paths (/...)',
          { count: invalidLinks }
        )
      );
    }

    if (this.structure.links.length > 0) {
      this.passed.push(
        createPassed('links', `${this.structure.links.length} link(s) found`)
      );
    }
  }

  private checkSize(): void {
    const sizeBytes = Buffer.byteLength(this.content, 'utf8');
    const estimatedTokens = Math.ceil(this.content.length / 4);

    if (this.isFullVersion) {
      if (estimatedTokens > 100000) {
        this.issues.push(
          createIssue(
            SEVERITY.RECOMMENDED,
            'too-large',
            `File may exceed typical LLM context windows (~${estimatedTokens.toLocaleString()} estimated tokens)`,
            'Consider splitting into sections or prioritizing content',
            { estimatedTokens, sizeKB: (sizeBytes / 1024).toFixed(1) }
          )
        );
      } else {
        this.passed.push(
          createPassed('size', `~${estimatedTokens.toLocaleString()} estimated tokens`, {
            sizeKB: (sizeBytes / 1024).toFixed(1),
          })
        );
      }
    } else {
      this.passed.push(
        createPassed('size', `${(sizeBytes / 1024).toFixed(1)}KB`)
      );
    }
  }

  private generateReport(): FileReport {
    const fileName = this.getFileName();
    return {
      file: fileName,
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
      structure: {
        hasTitle: !!this.structure.title,
        hasSummary: !!this.structure.summary,
        sectionCount: this.structure.sections.length,
        linkCount: this.structure.links.length,
      },
    };
  }
}

export function createNotFoundReport(source: string, isFullVersion = false): FileReport {
  const fileName = isFullVersion ? 'llms-full.txt' : 'llms.txt';
  return {
    file: fileName,
    source,
    found: false,
    valid: true,
    summary: { critical: 0, important: 0, recommended: 1, passed: 0 },
    issues: [
      createIssue(
        SEVERITY.RECOMMENDED,
        'not-found',
        `${fileName} not found`,
        `Consider adding ${fileName} to improve LLM accessibility. See llmstxt.org for specification.`
      ),
    ],
    passed: [],
  };
}
