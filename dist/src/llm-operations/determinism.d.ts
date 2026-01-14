export interface DeterminismConfig {
    temperature: number;
    topP?: number;
    seed?: number;
    model: string;
    timeoutMs?: number;
}
/**
 * Predefined determinism configurations for common use cases
 */
export declare const DETERMINISM_PRESETS: {
    CODE_GENERATION: DeterminismConfig;
    TYPE_GENERATION: DeterminismConfig;
    DOCUMENTATION: DeterminismConfig;
    EXAMPLE_GENERATION: DeterminismConfig;
    CREATIVE: DeterminismConfig;
};
/**
 * Determinism Manager - Controls reproducibility
 */
export declare class DeterminismManager {
    /**
     * Validate determinism config
     */
    static validate(config: DeterminismConfig): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Get config recommendations based on use case
     */
    static getRecommendation(useCase: 'code' | 'docs' | 'tests' | 'examples' | 'creative'): DeterminismConfig;
    /**
     * Make config more deterministic
     */
    static makeMoreDeterministic(config: DeterminismConfig): DeterminismConfig;
    /**
     * Make config more creative
     */
    static makeMoreCreative(config: DeterminismConfig): DeterminismConfig;
    /**
     * Calculate reproducibility score (0-1)
     * Higher temperature = lower reproducibility
     */
    static getReproducibilityScore(config: DeterminismConfig): number;
}
/**
 * Reproducibility Tester - Validates determinism
 */
export interface ReproducibilityTest {
    promptId: string;
    input: any;
    expectedOutput?: string;
    tolerance: number;
    runs: number;
    config: DeterminismConfig;
}
export interface ReproducibilityTestResult {
    passed: boolean;
    reproducibilityPercent: number;
    runs: number;
    matches: number;
    errors: string[];
    averageLatencyMs: number;
    totalCostUsd: number;
}
export declare class ReproducibilityTester {
    private executedTests;
    /**
     * Create a reproducibility test
     */
    createTest(options: {
        promptId: string;
        input: any;
        expectedOutput?: string;
        tolerance?: number;
        runs?: number;
        config?: DeterminismConfig;
    }): ReproducibilityTest;
    /**
     * Run reproducibility test (would be called by integration)
     */
    runTest(test: ReproducibilityTest): Promise<ReproducibilityTestResult>;
    /**
     * Get all executed tests
     */
    getExecutedTests(): ReproducibilityTest[];
    /**
     * Simulate LLM call for testing (would be replaced by actual LLM)
     */
    private simulateLLMCall;
    /**
     * Calculate similarity between two strings
     */
    private similarity;
    /**
     * Levenshtein distance for string comparison
     */
    private levenshteinDistance;
}
/**
 * Model version manager - Track and pin models
 */
export declare class ModelVersionManager {
    private pinned;
    /**
     * Pin a model version for a use case
     */
    pin(useCase: string, modelVersion: string): void;
    /**
     * Get pinned version
     */
    getPinned(useCase: string): string | undefined;
    /**
     * Unpin
     */
    unpin(useCase: string): void;
    /**
     * List all pinned versions
     */
    listPinned(): Record<string, string>;
    /**
     * Check if version is up to date
     */
    isLatest(modelVersion: string, latestVersion: string): boolean;
    /**
     * Migrate to new version
     */
    migrate(useCase: string, newVersion: string): void;
}
//# sourceMappingURL=determinism.d.ts.map