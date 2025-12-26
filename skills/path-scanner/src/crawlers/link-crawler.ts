/**
 * Link Crawler
 * Lightweight HTML link extractor with rate limiting
 */

import * as cheerio from 'cheerio';
import type { URLInfo } from '../types.js';

export class RateLimiter {
  private lastRequest: number = 0;
  private delayMs: number;

  constructor(requestsPerSecond: number) {
    this.delayMs = 1000 / requestsPerSecond;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;

    if (elapsed < this.delayMs) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs - elapsed));
    }

    this.lastRequest = Date.now();
  }

  /**
   * Update rate limit based on robots.txt Crawl-delay
   * @param crawlDelay - Delay in seconds from robots.txt
   */
  updateFromRobots(crawlDelay: number): void {
    const delayFromRobots = crawlDelay * 1000;
    // Use the more conservative (longer) delay
    if (delayFromRobots > this.delayMs) {
      this.delayMs = delayFromRobots;
    }
  }
}

export class LinkCrawler {
  private rateLimiter: RateLimiter;
  private timeout: number;
  private visited: Set<string> = new Set();
  private baseOrigin: string;

  constructor(
    baseUrl: string,
    rateLimit = 2,
    timeout = 10000
  ) {
    this.rateLimiter = new RateLimiter(rateLimit);
    this.timeout = timeout;
    try {
      this.baseOrigin = new URL(baseUrl).origin;
    } catch (error) {
      throw new Error(`Invalid base URL: ${baseUrl}`);
    }
  }

  /**
   * Update rate limiter with robots.txt Crawl-delay
   * @param crawlDelay - Delay in seconds
   */
  updateRateLimit(crawlDelay: number): void {
    this.rateLimiter.updateFromRobots(crawlDelay);
  }

  /**
   * Crawl a URL and extract links
   * @param url - URL to crawl
   * @param currentDepth - Current depth level
   * @param maxDepth - Maximum depth to crawl
   * @returns Discovered URLs
   */
  async crawl(url: string, currentDepth: number, maxDepth: number): Promise<URLInfo[]> {
    if (currentDepth >= maxDepth) {
      return [];
    }

    if (this.visited.has(url)) {
      return [];
    }

    this.visited.add(url);

    // Wait for rate limit
    await this.rateLimiter.wait();

    try {
      const html = await this.fetchHTML(url);
      const links = this.extractLinks(html, url);

      const results: URLInfo[] = [];

      for (const link of links) {
        if (!this.visited.has(link) && this.isSameOrigin(link)) {
          results.push({
            url: link,
            source: 'crawl',
            depth: currentDepth + 1,
            hasForms: false, // Will be updated by form extractor
            formCount: 0,
            bountyPotential: 'medium',
          });
        }
      }

      return results;
    } catch (error) {
      console.error(`Crawl error for ${url}: ${error instanceof Error ? error.message : 'Unknown'}`);
      return [];
    }
  }

  /**
   * Fetch HTML content from URL
   * @param url - URL to fetch
   * @returns HTML content
   */
  private async fetchHTML(url: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'path-scanner/1.0',
          Accept: 'text/html',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        throw new Error(`Not HTML: ${contentType}`);
      }

      return await response.text();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Timeout');
      }
      throw error;
    }
  }

  /**
   * Extract links from HTML
   * @param html - HTML content
   * @param baseUrl - Base URL for resolving relative links
   * @returns Array of absolute URLs
   */
  private extractLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const links: string[] = [];
    const seen = new Set<string>();

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (!href) return;

      try {
        // Resolve relative URLs
        const absoluteUrl = new URL(href, baseUrl).href;

        // Remove fragment
        const cleanUrl = absoluteUrl.split('#')[0];

        // Deduplicate
        if (cleanUrl && !seen.has(cleanUrl)) {
          seen.add(cleanUrl);
          links.push(cleanUrl);
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });

    return links;
  }

  /**
   * Check if URL belongs to the same origin
   * @param url - URL to check
   * @returns true if same origin
   */
  private isSameOrigin(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.origin === this.baseOrigin;
    } catch {
      return false;
    }
  }

  /**
   * Reset visited URLs
   */
  reset(): void {
    this.visited.clear();
  }

  /**
   * Get count of visited URLs
   */
  getVisitedCount(): number {
    return this.visited.size;
  }
}
