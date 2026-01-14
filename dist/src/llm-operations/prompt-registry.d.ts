export interface PromptVersion {
    id: string;
    version: string;
    description: string;
    model: string;
    temperature: number;
    maxTokens: number;
    topP?: number;
    seed?: number;
    systemPrompt: string;
    userPromptTemplate: string;
    validationSchema: any;
    examples: PromptExample[];
    tags: string[];
    createdAt: Date;
    modifiedAt: Date;
    retiredAt?: Date;
    guardrails?: HallucinationGuardrails;
}
export interface PromptExample {
    input: string;
    output: string;
    explanation?: string;
}
export interface HallucinationGuardrails {
    sourceReferences: boolean;
    chainOfThought: boolean;
    fewShotExamples: number;
    constraints: string[];
    selfReview: boolean;
    confidenceScoring: boolean;
    negations: string[];
}
export declare class PromptRegistry {
    private prompts;
    private registryPath;
    constructor(registryPath?: string);
    /**
     * Register a new prompt or update existing
     */
    register(prompt: PromptVersion): void;
    /**
     * Get specific prompt version or latest stable version
     */
    get(promptId: string, version?: string): PromptVersion | null;
    /**
     * Get all versions of a prompt
     */
    getAll(promptId: string): PromptVersion[];
    /**
     * List all active prompt IDs
     */
    listActive(): string[];
    /**
     * Mark a version as deprecated (add sunset date)
     */
    deprecate(promptId: string, version: string, sunsetDate: Date): void;
    /**
     * Retire a prompt version (remove from registry)
     */
    retire(promptId: string, version: string): void;
    /**
     * Get registry statistics
     */
    getStats(): {
        totalPrompts: number;
        activePrompts: number;
        totalVersions: number;
        deprecatedVersions: number;
    };
    /**
     * Export registry as JSON
     */
    export(): Record<string, PromptVersion[]>;
    /**
     * Import registry from JSON
     */
    import(data: Record<string, PromptVersion[]>): void;
    private saveToDisk;
    private loadFromDisk;
    private compareSemver;
}
/**
 * Pre-built prompt registry with FOST standard prompts
 */
export declare function createDefaultPromptRegistry(): PromptRegistry;
//# sourceMappingURL=prompt-registry.d.ts.map