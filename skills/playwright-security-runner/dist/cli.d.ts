/**
 * CLI argument parsing for Playwright Security Runner
 */
import type { TestOptions } from './types.js';
export declare function parseArgs(args: string[]): TestOptions;
export declare function printHelp(): void;
export declare function isProductionUrl(url: string): boolean;
export declare function printProductionWarning(url: string): void;
//# sourceMappingURL=cli.d.ts.map