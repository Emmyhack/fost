/**
 * FOST CLI - Command Line Interface for SDK Generation
 * Handles command parsing, execution, and output formatting
 */
export declare class CLIApplication {
    private args;
    private logger;
    private progress;
    private api;
    constructor(argv?: string[]);
    /**
     * Main CLI entry point
     */
    run(): Promise<void>;
    /**
     * Handle generate command
     */
    private handleGenerate;
    /**
     * Handle validate command
     */
    private handleValidate;
    /**
     * Handle test command
     */
    private handleTest;
    /**
     * Handle lint command
     */
    private handleLint;
    /**
     * Handle config command
     */
    private handleConfig;
    /**
     * Handle completion command
     */
    private handleCompletion;
    /**
     * Handle version command
     */
    private handleVersion;
    /**
     * Handle help command
     */
    private handleHelp;
    /**
     * Handle errors
     */
    private handleError;
}
/**
 * CLI Entry point
 */
export declare function runCLI(argv?: string[]): Promise<void>;
//# sourceMappingURL=index.d.ts.map