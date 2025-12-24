/**
 * CLI argument parsing for SEO Analyzer
 */
import type { CLIConfig } from './types.js';
export declare function parseArgs(args: string[]): {
    filepath: string | null;
    config: CLIConfig;
};
export declare function printHelp(): void;
