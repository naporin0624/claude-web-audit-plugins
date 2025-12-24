/**
 * CLI argument parsing for Lighthouse Runner
 */
import type { LighthouseConfig } from './types.js';
export declare function parseArgs(args: string[]): {
    target: string | null;
    config: LighthouseConfig;
};
export declare function printHelp(): void;
export declare function isUrl(target: string): boolean;
//# sourceMappingURL=cli.d.ts.map