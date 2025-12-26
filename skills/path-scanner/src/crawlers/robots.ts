/**
 * Robots.txt Parser
 * Parses robots.txt and extracts directives (Allow, Disallow, Crawl-delay, Sitemap)
 */

import type { RobotsDirective } from '../types.js';

export class RobotsParser {
  /**
   * Parse robots.txt content
   * @param content - robots.txt content
   * @returns Parsed directives
   */
  parse(content: string): RobotsDirective {
    const directive: RobotsDirective = {
      userAgent: '*',
      disallow: [],
      allow: [],
      sitemaps: [],
    };

    if (!content || content.trim() === '') {
      return directive;
    }

    const lines = content.split('\n');
    let currentUserAgent = '*';
    const directives: Record<string, RobotsDirective> = {
      '*': { ...directive },
    };

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmed.substring(0, colonIndex).trim().toLowerCase();
      const value = trimmed.substring(colonIndex + 1).trim();

      if (!value) continue;

      switch (key) {
        case 'user-agent':
          currentUserAgent = value;
          if (!directives[currentUserAgent]) {
            directives[currentUserAgent] = {
              userAgent: currentUserAgent,
              disallow: [],
              allow: [],
              sitemaps: [],
            };
          }
          break;

        case 'disallow':
          if (directives[currentUserAgent]) {
            directives[currentUserAgent].disallow.push(value);
          }
          break;

        case 'allow':
          if (directives[currentUserAgent]) {
            directives[currentUserAgent].allow.push(value);
          }
          break;

        case 'crawl-delay':
          const delay = parseFloat(value);
          if (!isNaN(delay) && directives[currentUserAgent]) {
            directives[currentUserAgent].crawlDelay = delay;
          }
          break;

        case 'sitemap':
          // Sitemaps apply globally
          for (const ua in directives) {
            if (!directives[ua].sitemaps.includes(value)) {
              directives[ua].sitemaps.push(value);
            }
          }
          break;
      }
    }

    // Return directives for '*' or first user-agent
    return directives['*'] || directives[Object.keys(directives)[0]] || directive;
  }

  /**
   * Fetch and parse robots.txt from URL
   * @param baseUrl - Base URL (e.g., https://example.com)
   * @param timeout - Request timeout in ms
   * @returns Parsed directives
   */
  async fetchAndParse(baseUrl: string, timeout = 10000): Promise<RobotsDirective> {
    try {
      const url = new URL('/robots.txt', baseUrl).href;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'path-scanner/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // robots.txt not found - allow all
        if (response.status === 404) {
          return {
            userAgent: '*',
            disallow: [],
            allow: [],
            sitemaps: [],
          };
        }
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const content = await response.text();
      return this.parse(content);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.error(`Robots.txt fetch timeout: ${baseUrl}`);
      } else {
        console.error(`Robots.txt fetch error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
      // Default: allow all on error
      return {
        userAgent: '*',
        disallow: [],
        allow: [],
        sitemaps: [],
      };
    }
  }

  /**
   * Check if a path is allowed by robots.txt
   * @param path - Path to check (e.g., /admin/users)
   * @param directive - Parsed robots directive
   * @returns true if allowed, false if disallowed
   */
  isAllowed(path: string, directive: RobotsDirective): boolean {
    // Check Allow rules first (more specific)
    for (const allow of directive.allow) {
      if (this.matchesPattern(path, allow)) {
        return true;
      }
    }

    // Check Disallow rules
    for (const disallow of directive.disallow) {
      if (this.matchesPattern(path, disallow)) {
        return false;
      }
    }

    // Default: allow
    return true;
  }

  private matchesPattern(path: string, pattern: string): boolean {
    if (pattern === '/') return true; // Disallow all
    if (pattern === '') return false; // Allow all

    // Simple prefix matching (robots.txt spec)
    if (pattern.endsWith('*')) {
      const prefix = pattern.slice(0, -1);
      return path.startsWith(prefix);
    }

    return path.startsWith(pattern);
  }
}
