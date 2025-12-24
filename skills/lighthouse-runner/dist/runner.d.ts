/**
 * Core Lighthouse runner using Playwright
 */
import type { LighthouseConfig, Metrics, FailedAudits } from './types.js';
interface LHR {
    lighthouseVersion: string;
    categories: Record<string, {
        score: number;
        auditRefs: Array<{
            id: string;
        }>;
    }>;
    audits: Record<string, {
        id: string;
        title: string;
        description: string;
        score: number | null;
        numericValue?: number;
        displayValue?: string;
    }>;
}
export declare function runLighthouse(url: string, config: LighthouseConfig): Promise<LHR>;
export declare function extractMetrics(lhr: LHR): Metrics;
export declare function extractFailedAudits(lhr: LHR): FailedAudits;
export {};
//# sourceMappingURL=runner.d.ts.map