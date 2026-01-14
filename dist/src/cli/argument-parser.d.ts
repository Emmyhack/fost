/**
 * CLI Argument Parser
 * Parses command-line arguments and options
 */
export interface ParsedArguments {
    command?: string;
    options: Record<string, any>;
}
export interface CLIConfig {
    defaultLanguage?: string;
    defaultType?: string;
    defaultOutput?: string;
    generation?: {
        includeTests?: boolean;
        includeDocumentation?: boolean;
    };
    validation?: {
        strict?: boolean;
    };
    logging?: {
        level?: string;
        colorize?: boolean;
    };
}
/**
 * Parse command-line arguments
 */
export declare function parseArguments(args: string[]): ParsedArguments;
/**
 * Parse configuration file
 */
export declare function parseConfig(configPath: string): CLIConfig;
/**
 * Validate parsed options
 */
export declare function validateOptions(options: Record<string, any>, command: string): void;
/**
 * Get option value (checks both long and short forms)
 */
export declare function getOption(options: Record<string, any>, name: string): any;
//# sourceMappingURL=argument-parser.d.ts.map