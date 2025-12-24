/**
 * CLI for Web Resource Checker
 */
import type { CLIOptions } from './types.js';
interface ParsedArgs {
    target: string;
    options: CLIOptions;
}
export declare function parseArgs(args: string[]): ParsedArgs | null;
export {};
