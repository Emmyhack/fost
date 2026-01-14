/**
 * SDK CODE GENERATOR - Main orchestrator
 *
 * Takes an SDK Design Plan and generates production-ready code.
 * Coordinates all builders and emitters to produce complete SDK.
 */
/**
 * Result of code generation
 */
export interface GenerationResult {
    success: boolean;
    files: GeneratedFile[];
    errors?: string[];
    warnings?: string[];
}
/**
 * Generated code file
 */
export interface GeneratedFile {
    path: string;
    language: string;
    content: string;
    type: "source" | "types" | "errors" | "config" | "example";
}
/**
 * Main SDK code generator
 */
export declare class SDKCodeGenerator {
    private plan;
    constructor(plan: any);
    /**
     * Validate that the design plan is complete
     */
    private validatePlan;
    /**
     * Generate complete SDK
     */
    generate(): GenerationResult;
    /**
     * Generate main client file
     */
    private generateClientFile;
    /**
     * Generate errors file
     */
    private generateErrorsFile;
    /**
     * Generate config file
     */
    private generateConfigFile;
    /**
     * Generate types file
     */
    private generateTypesFile;
    /**
     * Generate example usage file
     */
    private generateExampleFile;
    /**
     * Generate package.json
     */
    private generatePackageJson;
    /**
     * Generate README
     */
    private generateReadme;
    /**
     * Build error handler method
     */
    private buildErrorHandlerMethod;
    /**
     * Build retry logic method
     */
    private buildRetryLogicMethod;
}
//# sourceMappingURL=index.d.ts.map