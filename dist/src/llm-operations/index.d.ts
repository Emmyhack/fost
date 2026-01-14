export * from './prompt-registry';
export * from './llm-client';
export * from './output-validator';
export * from './retry-strategy';
export * from './fallback-strategy';
export * from './monitoring';
export * from './determinism';
export interface LLMOperationsConfig {
    modelProvider: 'openai' | 'anthropic' | 'custom';
    apiKey: string;
    environment: 'development' | 'production';
    enableMonitoring: boolean;
    enableLogging: boolean;
}
/**
 * Main LLM Operations Manager
 * Orchestrates all LLM interactions with validation, retry, fallback, and monitoring
 */
export declare class LLMOperationsManager {
    private promptRegistry;
    private llmClient;
    private validator;
    private retryStrategy;
    private fallbackStrategy;
    private monitor;
    constructor(config: LLMOperationsConfig);
    /**
     * Call LLM with full safety: validation, retry, fallback, monitoring
     */
    callWithSafety(options: {
        promptId: string;
        promptVersion?: string;
        input: Record<string, any>;
        context?: Record<string, any>;
    }): Promise<any>;
    /**
     * Get registered prompt metadata
     */
    getPrompt(promptId: string, version?: string): import("./prompt-registry").PromptVersion | null;
    /**
     * Register a new prompt version
     */
    registerPrompt(prompt: any): void;
    /**
     * Get current metrics
     */
    getMetrics(): import("./monitoring").LLMMetrics;
    /**
     * Check health
     */
    checkHealth(): {
        healthy: boolean;
        issues: string[];
    };
}
//# sourceMappingURL=index.d.ts.map