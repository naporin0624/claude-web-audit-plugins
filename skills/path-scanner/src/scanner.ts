/**
 * Path Scanner
 * Core scanning logic that orchestrates all components
 */

import { SitemapParser } from './crawlers/sitemap.js';
import { RobotsParser } from './crawlers/robots.js';
import { LinkCrawler } from './crawlers/link-crawler.js';
import { FormExtractor } from './extractors/form-extractor.js';
import { URLNormalizer } from './extractors/url-normalizer.js';
import type { ScannerConfig, ScanResult, URLInfo, FormInfo } from './types.js';

export class PathScanner {
  private config: ScannerConfig;
  private sitemapParser: SitemapParser;
  private robotsParser: RobotsParser;
  private formExtractor: FormExtractor;
  private urlNormalizer: URLNormalizer;

  constructor(config: Partial<ScannerConfig> = {}) {
    this.config = {
      maxDepth: config.maxDepth ?? 2,
      rateLimit: config.rateLimit ?? 2,
      maxUrls: config.maxUrls ?? 100,
      respectRobots: config.respectRobots ?? true,
      timeout: config.timeout ?? 10000,
    };

    this.sitemapParser = new SitemapParser();
    this.robotsParser = new RobotsParser();
    this.formExtractor = new FormExtractor();
    this.urlNormalizer = new URLNormalizer();
  }

  /**
   * Scan a target URL
   * @param targetUrl - Target URL to scan
   * @returns Scan results
   */
  async scan(targetUrl: string): Promise<ScanResult> {
    const startTime = Date.now();

    try {
      new URL(targetUrl); // Validate URL
    } catch {
      throw new Error(`Invalid target URL: ${targetUrl}`);
    }

    const stats = {
      sitemapUrls: 0,
      crawledUrls: 0,
      skippedUrls: 0,
      errors: 0,
    };

    const allUrls: URLInfo[] = [];
    const allForms: FormInfo[] = [];

    console.error('🔍 Fetching robots.txt...');
    const robotsDirective = await this.robotsParser.fetchAndParse(targetUrl, this.config.timeout);

    console.error('🗺️  Fetching sitemap.xml...');
    const sitemapUrls = await this.fetchSitemaps(targetUrl, robotsDirective.sitemaps);
    stats.sitemapUrls = sitemapUrls.length;

    // Add sitemap URLs
    for (const url of sitemapUrls) {
      if (this.config.respectRobots) {
        const path = new URL(url).pathname;
        if (!this.robotsParser.isAllowed(path, robotsDirective)) {
          stats.skippedUrls++;
          continue;
        }
      }

      allUrls.push({
        url,
        source: 'sitemap',
        depth: 0,
        hasForms: false,
        formCount: 0,
        bountyPotential: 'medium',
      });
    }

    // Add initial target URL if not in sitemap
    const normalizedTarget = this.urlNormalizer.normalize(targetUrl);
    if (!allUrls.some((u) => this.urlNormalizer.normalize(u.url) === normalizedTarget)) {
      allUrls.push({
        url: targetUrl,
        source: 'initial',
        depth: 0,
        hasForms: false,
        formCount: 0,
        bountyPotential: 'medium',
      });
    }

    // Crawl links
    if (this.config.maxDepth > 0) {
      console.error(`🕷️  Crawling links (depth=${this.config.maxDepth}, rate=${this.config.rateLimit} req/s)...`);
      const crawler = new LinkCrawler(targetUrl, this.config.rateLimit, this.config.timeout);

      // Update rate limit based on robots.txt
      if (robotsDirective.crawlDelay) {
        crawler.updateRateLimit(robotsDirective.crawlDelay);
        console.error(`⏱️  Using Crawl-delay: ${robotsDirective.crawlDelay}s from robots.txt`);
      }

      const crawlQueue = [...allUrls];
      const maxUrlsLimit = this.config.maxUrls;

      for (const urlInfo of crawlQueue) {
        if (allUrls.length >= maxUrlsLimit) {
          console.error(`⚠️  Reached max URL limit (${maxUrlsLimit})`);
          break;
        }

        if (urlInfo.depth >= this.config.maxDepth) {
          continue;
        }

        try {
          const discoveredUrls = await crawler.crawl(
            urlInfo.url,
            urlInfo.depth,
            this.config.maxDepth
          );

          for (const discovered of discoveredUrls) {
            if (allUrls.length >= maxUrlsLimit) break;

            // Check robots.txt
            if (this.config.respectRobots) {
              const path = new URL(discovered.url).pathname;
              if (!this.robotsParser.isAllowed(path, robotsDirective)) {
                stats.skippedUrls++;
                continue;
              }
            }

            allUrls.push(discovered);
            crawlQueue.push(discovered);
          }

          stats.crawledUrls += discoveredUrls.length;
        } catch (error) {
          stats.errors++;
        }
      }
    }

    // Extract forms
    console.error('📝 Extracting forms...');
    await this.extractForms(allUrls, allForms);

    // Normalize and sort URLs
    const processedUrls = this.urlNormalizer.process(allUrls);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    return {
      summary: {
        target: targetUrl,
        urlsDiscovered: processedUrls.length,
        formsFound: allForms.length,
        depth: this.config.maxDepth,
        duration: `${duration}s`,
      },
      urls: processedUrls,
      forms: allForms,
      crawlStats: {
        ...stats,
        duration: parseFloat(duration),
      },
      robotsDirectives: robotsDirective,
    };
  }

  /**
   * Fetch sitemaps
   * @param targetUrl - Target URL
   * @param sitemapUrls - Sitemap URLs from robots.txt
   * @returns Array of URLs from sitemaps
   */
  private async fetchSitemaps(targetUrl: string, sitemapUrls: string[]): Promise<string[]> {
    const allUrls: string[] = [];

    // Try default sitemap.xml
    const defaultSitemap = new URL('/sitemap.xml', targetUrl).href;
    const defaultUrls = await this.sitemapParser.fetchAndParse(
      defaultSitemap,
      this.config.timeout
    );
    allUrls.push(...defaultUrls);

    // Try robots.txt sitemaps
    for (const sitemapUrl of sitemapUrls) {
      const urls = await this.sitemapParser.fetchAndParse(sitemapUrl, this.config.timeout);
      allUrls.push(...urls);
    }

    return [...new Set(allUrls)]; // Deduplicate
  }

  /**
   * Extract forms from URLs
   * @param urls - URLs to extract forms from
   * @param forms - Array to push extracted forms to
   */
  private async extractForms(urls: URLInfo[], forms: FormInfo[]): Promise<void> {
    const limit = Math.min(urls.length, 20); // Limit form extraction to first 20 URLs

    for (let i = 0; i < limit; i++) {
      const urlInfo = urls[i];

      try {
        const response = await fetch(urlInfo.url, {
          headers: { 'User-Agent': 'path-scanner/1.0' },
          signal: AbortSignal.timeout(this.config.timeout),
        });

        if (!response.ok) continue;

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) continue;

        const html = await response.text();
        const extractedForms = this.formExtractor.extract(html, urlInfo.url);

        if (extractedForms.length > 0) {
          urlInfo.hasForms = true;
          urlInfo.formCount = extractedForms.length;

          // Update bounty potential
          for (const form of extractedForms) {
            const potential = this.formExtractor.estimateBountyPotential(
              form.vulnerabilityIndicators
            );
            if (potential === 'high' && urlInfo.bountyPotential !== 'high') {
              urlInfo.bountyPotential = 'high';
            } else if (potential === 'medium' && urlInfo.bountyPotential === 'low') {
              urlInfo.bountyPotential = 'medium';
            }
          }

          forms.push(...extractedForms);
        }
      } catch (error) {
        // Skip this URL on error
      }
    }
  }
}
