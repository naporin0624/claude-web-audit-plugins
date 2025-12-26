/**
 * URL Normalizer
 * Deduplicates and sorts URLs
 */

import type { URLInfo, BountyPotential } from '../types.js';

export class URLNormalizer {
  /**
   * Normalize URL (remove fragment, sort query params)
   * @param url - URL to normalize
   * @returns Normalized URL
   */
  normalize(url: string): string {
    try {
      const urlObj = new URL(url);

      // Remove fragment
      urlObj.hash = '';

      // Sort query parameters for consistent comparison
      const params = Array.from(urlObj.searchParams.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      urlObj.search = '';
      params.forEach(([key, value]) => {
        urlObj.searchParams.append(key, value);
      });

      return urlObj.href;
    } catch {
      // Invalid URL, return as-is
      return url;
    }
  }

  /**
   * Deduplicate URLs
   * @param urls - Array of URL info
   * @returns Deduplicated array
   */
  deduplicate(urls: URLInfo[]): URLInfo[] {
    const seen = new Map<string, URLInfo>();

    for (const urlInfo of urls) {
      const normalized = this.normalize(urlInfo.url);

      if (!seen.has(normalized)) {
        seen.set(normalized, { ...urlInfo, url: normalized });
      } else {
        // Keep the one with higher bounty potential or earlier source
        const existing = seen.get(normalized)!;
        if (
          this.compareBountyPotential(urlInfo.bountyPotential, existing.bountyPotential) > 0
        ) {
          seen.set(normalized, { ...urlInfo, url: normalized });
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Sort URLs by bounty potential (high > medium > low), then alphabetically
   * @param urls - Array of URL info
   * @returns Sorted array
   */
  sortByBountyPotential(urls: URLInfo[]): URLInfo[] {
    return urls.sort((a, b) => {
      // First compare by bounty potential
      const bountyCompare = this.compareBountyPotential(
        b.bountyPotential,
        a.bountyPotential
      );
      if (bountyCompare !== 0) {
        return bountyCompare;
      }

      // Then by has forms
      if (a.hasForms !== b.hasForms) {
        return a.hasForms ? -1 : 1;
      }

      // Then by form count
      if (a.formCount !== b.formCount) {
        return b.formCount - a.formCount;
      }

      // Finally alphabetically
      return a.url.localeCompare(b.url);
    });
  }

  /**
   * Deduplicate and sort URLs
   * @param urls - Array of URL info
   * @returns Processed array
   */
  process(urls: URLInfo[]): URLInfo[] {
    const deduplicated = this.deduplicate(urls);
    return this.sortByBountyPotential(deduplicated);
  }

  /**
   * Compare bounty potential levels
   * @param a - First level
   * @param b - Second level
   * @returns -1 if a < b, 0 if equal, 1 if a > b
   */
  private compareBountyPotential(a: BountyPotential, b: BountyPotential): number {
    const levels: Record<BountyPotential, number> = {
      high: 3,
      medium: 2,
      low: 1,
    };

    return levels[a] - levels[b];
  }
}
