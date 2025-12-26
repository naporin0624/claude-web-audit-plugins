/**
 * Path Scanner Types
 */

export type BountyPotential = 'high' | 'medium' | 'low';
export type URLSource = 'sitemap' | 'robots' | 'crawl' | 'initial';

export interface ScannerConfig {
  /** Maximum crawl depth (default: 2, max: 3) */
  maxDepth: number;
  /** Requests per second (default: 2, max: 5) */
  rateLimit: number;
  /** Maximum URLs to discover (default: 100) */
  maxUrls: number;
  /** Respect robots.txt directives (default: true) */
  respectRobots: boolean;
  /** Request timeout in milliseconds (default: 10000) */
  timeout: number;
}

export interface URLInfo {
  /** Full URL */
  url: string;
  /** Source of discovery */
  source: URLSource;
  /** Crawl depth level */
  depth: number;
  /** Whether this URL has forms */
  hasForms: boolean;
  /** Number of forms found */
  formCount: number;
  /** Bounty potential estimation */
  bountyPotential: BountyPotential;
}

export interface FormField {
  /** Input field name */
  name: string;
  /** Input type (text, password, email, etc.) */
  type: string;
  /** Whether field is required */
  required?: boolean;
}

export interface FormInfo {
  /** URL where form is located */
  url: string;
  /** Form action URL */
  action: string;
  /** HTTP method (GET, POST) */
  method: string;
  /** Input fields */
  fields: FormField[];
  /** Whether CSRF token is present */
  csrfToken: boolean;
  /** Detected vulnerability indicators */
  vulnerabilityIndicators: string[];
}

export interface RobotsDirective {
  /** User-agent this directive applies to */
  userAgent: string;
  /** Disallowed paths */
  disallow: string[];
  /** Allowed paths */
  allow: string[];
  /** Crawl delay in seconds */
  crawlDelay?: number;
  /** Sitemap URLs found in robots.txt */
  sitemaps: string[];
}

export interface CrawlStats {
  /** URLs from sitemap.xml */
  sitemapUrls: number;
  /** URLs from crawling */
  crawledUrls: number;
  /** URLs skipped (robots.txt, errors, etc.) */
  skippedUrls: number;
  /** Errors encountered */
  errors: number;
  /** Crawl duration in seconds */
  duration?: number;
}

export interface ScanSummary {
  /** Target URL */
  target: string;
  /** Total URLs discovered */
  urlsDiscovered: number;
  /** Total forms found */
  formsFound: number;
  /** Maximum depth reached */
  depth: number;
  /** Scan duration (e.g., "8.3s") */
  duration?: string;
}

export interface ScanResult {
  /** Summary statistics */
  summary: ScanSummary;
  /** Discovered URLs */
  urls: URLInfo[];
  /** Extracted forms */
  forms: FormInfo[];
  /** Crawl statistics */
  crawlStats: CrawlStats;
  /** Robots.txt directives */
  robotsDirectives?: RobotsDirective;
}

export interface CLIOptions {
  /** Target URL to scan */
  target: string;
  /** Crawl depth */
  depth?: number;
  /** Rate limit (requests per second) */
  rateLimit?: number;
  /** Respect robots.txt */
  respectRobots?: boolean;
  /** Maximum URLs to discover */
  maxUrls?: number;
  /** Output JSON format */
  json?: boolean;
}
