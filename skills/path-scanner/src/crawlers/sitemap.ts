/**
 * Sitemap.xml Parser
 * Extracts URLs from sitemap.xml and sitemap index files
 * Based on web-resource-checker/src/validators/sitemap.ts
 */

import { parseStringPromise } from 'xml2js';

interface SitemapData {
  urlset?: {
    url?: SitemapUrl | SitemapUrl[];
  };
  sitemapindex?: {
    sitemap?: SitemapEntry | SitemapEntry[];
  };
}

interface SitemapUrl {
  loc?: string | { _: string };
  lastmod?: string;
}

interface SitemapEntry {
  loc?: string;
}

export class SitemapParser {
  /**
   * Parse sitemap content and extract URLs
   * @param content - XML content of sitemap
   * @returns Array of absolute URLs
   */
  async parse(content: string): Promise<string[]> {
    if (!content || content.trim() === '') {
      return [];
    }

    try {
      const data: SitemapData = await parseStringPromise(content, {
        explicitArray: false,
        ignoreAttrs: false,
      });

      // Handle regular sitemap (<urlset>)
      if (data.urlset) {
        return this.extractUrlsFromUrlset(data.urlset);
      }

      // Handle sitemap index (<sitemapindex>)
      if (data.sitemapindex) {
        return this.extractUrlsFromIndex(data.sitemapindex);
      }

      return [];
    } catch (error) {
      console.error(
        `Sitemap parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return [];
    }
  }

  /**
   * Fetch and parse sitemap from URL
   * @param url - Sitemap URL
   * @param timeout - Request timeout in ms
   * @returns Array of URLs
   */
  async fetchAndParse(url: string, timeout = 10000): Promise<string[]> {
    try {
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
        console.error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
        return [];
      }

      const content = await response.text();
      return this.parse(content);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.error(`Sitemap fetch timeout: ${url}`);
      } else {
        console.error(`Sitemap fetch error: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
      return [];
    }
  }

  private extractUrlsFromUrlset(urlset: SitemapData['urlset']): string[] {
    if (!urlset || !urlset.url) {
      return [];
    }

    const urls = Array.isArray(urlset.url) ? urlset.url : [urlset.url];
    const result: string[] = [];

    for (const url of urls) {
      if (!url.loc) continue;

      const loc = typeof url.loc === 'string' ? url.loc : url.loc._;

      // Only include absolute HTTP(S) URLs
      if (loc && (loc.startsWith('http://') || loc.startsWith('https://'))) {
        result.push(loc);
      }
    }

    return result;
  }

  private extractUrlsFromIndex(sitemapindex: SitemapData['sitemapindex']): string[] {
    if (!sitemapindex || !sitemapindex.sitemap) {
      return [];
    }

    const sitemaps = Array.isArray(sitemapindex.sitemap)
      ? sitemapindex.sitemap
      : [sitemapindex.sitemap];
    const result: string[] = [];

    for (const sitemap of sitemaps) {
      if (sitemap.loc) {
        result.push(sitemap.loc);
      }
    }

    return result;
  }
}
