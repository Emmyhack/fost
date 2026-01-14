"use strict";
// Determinism Controls - Reproducibility and consistency
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelVersionManager = exports.ReproducibilityTester = exports.DeterminismManager = exports.DETERMINISM_PRESETS = void 0;
/**
 * Predefined determinism configurations for common use cases
 */
exports.DETERMINISM_PRESETS = {
    // Highly deterministic for code generation
    CODE_GENERATION: {
        temperature: 0.1,
        topP: 0.95,
        seed: 42,
        model: 'gpt-4-turbo-2024-04-09',
        timeoutMs: 30000,
    },
    // Deterministic but slightly more flexible
    TYPE_GENERATION: {
        temperature: 0.15,
        topP: 0.95,
        seed: 42,
        model: 'gpt-4-turbo-2024-04-09',
        timeoutMs: 30000,
    },
    // Deterministic for documentation
    DOCUMENTATION: {
        temperature: 0.3,
        topP: 0.95,
        seed: 42,
        model: 'gpt-4-turbo-2024-04-09',
        timeoutMs: 30000,
    },
    // Slightly creative for examples
    EXAMPLE_GENERATION: {
        temperature: 0.5,
        topP: 0.9,
        model: 'gpt-4-turbo-2024-04-09',
        timeoutMs: 30000,
    },
    // Creative for brainstorming
    CREATIVE: {
        temperature: 0.8,
        topP: 0.9,
        model: 'gpt-4-turbo-2024-04-09',
        timeoutMs: 30000,
    },
};
/**
 * Determinism Manager - Controls reproducibility
 */
class DeterminismManager {
    /**
     * Validate determinism config
     */
    static validate(config) {
        const errors = [];
        if (config.temperature < 0 || config.temperature > 1) {
            errors.push('Temperature must be between 0 and 1');
        }
        if (config.topP && (config.topP < 0 || config.topP > 1)) {
            errors.push('topP must be between 0 and 1');
        }
        if (!config.model || config.model.trim().length === 0) {
            errors.push('Model must be specified');
        }
        if (config.timeoutMs && config.timeoutMs < 1000) {
            errors.push('Timeout must be at least 1000ms');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * Get config recommendations based on use case
     */
    static getRecommendation(useCase) {
        switch (useCase) {
            case 'code':
                return exports.DETERMINISM_PRESETS.CODE_GENERATION;
            case 'docs':
                return exports.DETERMINISM_PRESETS.DOCUMENTATION;
            case 'tests':
                return exports.DETERMINISM_PRESETS.TYPE_GENERATION;
            case 'examples':
                return exports.DETERMINISM_PRESETS.EXAMPLE_GENERATION;
            case 'creative':
                return exports.DETERMINISM_PRESETS.CREATIVE;
            default:
                return exports.DETERMINISM_PRESETS.CODE_GENERATION;
        }
    }
    /**
     * Make config more deterministic
     */
    static makeMoreDeterministic(config) {
        return {
            ...config,
            temperature: Math.max(0, config.temperature - 0.1),
            topP: config.topP ? Math.min(1, config.topP + 0.05) : 0.95,
        };
    }
    /**
     * Make config more creative
     */
    static makeMoreCreative(config) {
        return {
            ...config,
            temperature: Math.min(1, config.temperature + 0.1),
            topP: config.topP ? Math.max(0.5, config.topP - 0.05) : 0.85,
        };
    }
    /**
     * Calculate reproducibility score (0-1)
     * Higher temperature = lower reproducibility
     */
    static getReproducibilityScore(config) {
        // Temperature is the main factor affecting reproducibility
        // 0.0 = 1.0 reproducibility
        // 1.0 = 0.0 reproducibility
        const tempScore = 1 - config.temperature;
        // Seed also affects reproducibility
        const seedScore = config.seed ? 0.1 : 0;
        return Math.min(1, tempScore + seedScore);
    }
}
exports.DeterminismManager = DeterminismManager;
class ReproducibilityTester {
    constructor() {
        this.executedTests = [];
    }
    /**
     * Create a reproducibility test
     */
    createTest(options) {
        return {
            promptId: options.promptId,
            input: options.input,
            expectedOutput: options.expectedOutput,
            tolerance: options.tolerance ?? 0.95,
            runs: options.runs ?? 5,
            config: options.config ?? exports.DETERMINISM_PRESETS.CODE_GENERATION,
        };
    }
    /**
     * Run reproducibility test (would be called by integration)
     */
    async runTest(test) {
        const outputs = [];
        const latencies = [];
        const costs = [];
        const errors = [];
        // Validate config
        const validation = DeterminismManager.validate(test.config);
        if (!validation.valid) {
            return {
                passed: false,
                reproducibilityPercent: 0,
                runs: 0,
                matches: 0,
                errors: validation.errors,
                averageLatencyMs: 0,
                totalCostUsd: 0,
            };
        }
        // Run test multiple times (would call LLM in real implementation)
        for (let i = 0; i < test.runs; i++) {
            try {
                // This is where actual LLM call would happen
                // For now, simulate consistent behavior
                const output = await this.simulateLLMCall(test.input);
                outputs.push(output);
                // Simulate latency and cost
                latencies.push(Math.random() * 3000 + 500);
                costs.push(Math.random() * 0.01 + 0.005);
            }
            catch (error) {
                errors.push(`Run ${i + 1}: ${error}`);
            }
        }
        // Analyze reproducibility
        let matches = 0;
        if (test.expectedOutput) {
            // Compare against expected output
            matches = outputs.filter(o => this.similarity(o, test.expectedOutput) > test.tolerance)
                .length;
        }
        else {
            // Compare outputs against each other
            const firstOutput = outputs[0];
            matches = outputs.filter(o => this.similarity(o, firstOutput) > test.tolerance).length;
        }
        const reproducibilityPercent = (matches / outputs.length) * 100;
        const passed = reproducibilityPercent >= 80; // 80% threshold
        const averageLatency = latencies.length > 0
            ? latencies.reduce((a, b) => a + b, 0) / latencies.length
            : 0;
        const totalCost = costs.reduce((a, b) => a + b, 0);
        return {
            passed,
            reproducibilityPercent,
            runs: outputs.length,
            matches,
            errors,
            averageLatencyMs: Math.round(averageLatency),
            totalCostUsd: totalCost,
        };
    }
    /**
     * Get all executed tests
     */
    getExecutedTests() {
        return this.executedTests;
    }
    /**
     * Simulate LLM call for testing (would be replaced by actual LLM)
     */
    async simulateLLMCall(input) {
        // Simulate with consistent but slightly random output
        return JSON.stringify({ simulated: true, input });
    }
    /**
     * Calculate similarity between two strings
     */
    similarity(a, b) {
        // Simple similarity metric (would use more sophisticated comparison in real impl)
        if (a === b)
            return 1;
        const shorter = a.length < b.length ? a : b;
        const longer = a.length < b.length ? b : a;
        const editDistance = this.levenshteinDistance(shorter, longer);
        return 1 - editDistance / longer.length;
    }
    /**
     * Levenshtein distance for string comparison
     */
    levenshteinDistance(s1, s2) {
        const costs = [];
        for (let i = 0; i <= s1.length; i++) {
            let lastValue = i;
            for (let j = 0; j <= s2.length; j++) {
                if (i === 0) {
                    costs[j] = j;
                }
                else if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }
}
exports.ReproducibilityTester = ReproducibilityTester;
/**
 * Model version manager - Track and pin models
 */
class ModelVersionManager {
    constructor() {
        this.pinned = new Map();
    }
    /**
     * Pin a model version for a use case
     */
    pin(useCase, modelVersion) {
        this.pinned.set(useCase, modelVersion);
        console.log(`Pinned ${useCase} to ${modelVersion}`);
    }
    /**
     * Get pinned version
     */
    getPinned(useCase) {
        return this.pinned.get(useCase);
    }
    /**
     * Unpin
     */
    unpin(useCase) {
        this.pinned.delete(useCase);
    }
    /**
     * List all pinned versions
     */
    listPinned() {
        const result = {};
        for (const [key, value] of this.pinned.entries()) {
            result[key] = value;
        }
        return result;
    }
    /**
     * Check if version is up to date
     */
    isLatest(modelVersion, latestVersion) {
        return modelVersion === latestVersion;
    }
    /**
     * Migrate to new version
     */
    migrate(useCase, newVersion) {
        const old = this.pinned.get(useCase);
        this.pin(useCase, newVersion);
        console.log(`Migrated ${useCase}: ${old} -> ${newVersion}`);
    }
}
exports.ModelVersionManager = ModelVersionManager;
//# sourceMappingURL=determinism.js.map