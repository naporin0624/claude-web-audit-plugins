/**
 * CLI argument parsing for Form Security Analyzer
 */
export interface CLIConfig {
    jsonOutput: boolean;
}
export declare function parseArgs(args: string[]): {
    filepath: string | null;
    config: CLIConfig;
};
export declare function printHelp(): void;
