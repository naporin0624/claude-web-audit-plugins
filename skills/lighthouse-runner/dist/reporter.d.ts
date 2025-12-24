/**
 * Report generation for Lighthouse results
 */
import type { LighthouseReport, Metrics, FailedAudits } from './types.js';
interface LHR {
    lighthouseVersion: string;
    categories: Record<string, {
        score: number;
    }>;
    audits: Record<string, unknown>;
}
export declare function generateTextReport(url: string, lhr: LHR, metrics: Metrics, failed: FailedAudits): string;
export declare function generateJsonReport(url: string, lhr: LHR, metrics: Metrics, failed: FailedAudits): LighthouseReport;
export {};
//# sourceMappingURL=reporter.d.ts.map