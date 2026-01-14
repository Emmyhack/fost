"use strict";
// LLM Operations Module - Complete Implementation
// Handles prompts, validation, retries, fallbacks, and monitoring
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMOperationsManager = void 0;
__exportStar(require("./prompt-registry"), exports);
__exportStar(require("./llm-client"), exports);
__exportStar(require("./output-validator"), exports);
__exportStar(require("./retry-strategy"), exports);
__exportStar(require("./fallback-strategy"), exports);
__exportStar(require("./monitoring"), exports);
__exportStar(require("./determinism"), exports);
const prompt_registry_1 = require("./prompt-registry");
const llm_client_1 = require("./llm-client");
const output_validator_1 = require("./output-validator");
const retry_strategy_1 = require("./retry-strategy");
const fallback_strategy_1 = require("./fallback-strategy");
const monitoring_1 = require("./monitoring");
/**
 * Main LLM Operations Manager
 * Orchestrates all LLM interactions with validation, retry, fallback, and monitoring
 */
class LLMOperationsManager {
    constructor(config) {
        this.promptRegistry = new prompt_registry_1.PromptRegistry();
        this.llmClient = new llm_client_1.LLMClient(config);
        this.validator = new output_validator_1.OutputValidator();
        this.retryStrategy = new retry_strategy_1.RetryStrategy();
        this.fallbackStrategy = new fallback_strategy_1.FallbackStrategy();
        this.monitor = new monitoring_1.LLMMonitor(config.enableMonitoring);
    }
    /**
     * Call LLM with full safety: validation, retry, fallback, monitoring
     */
    async callWithSafety(options) {
        const startTime = Date.now();
        const prompt = this.promptRegistry.get(options.promptId, options.promptVersion);
        if (!prompt) {
            throw new Error(`Prompt not found: ${options.promptId}@${options.promptVersion}`);
        }
        try {
            // Call with retry
            const output = await this.retryStrategy.executeWithRetry(async () => {
                return await this.llmClient.call({
                    prompt,
                    input: options.input,
                    context: options.context,
                });
            });
            // Validate output
            const validationResult = this.validator.validate(output, prompt.validationSchema);
            if (!validationResult.valid) {
                throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
            }
            // Record success (estimate tokens and cost for string output)
            const estimatedTokens = Math.ceil(output.length / 4);
            const estimatedCost = estimatedTokens * 0.00001; // Rough estimate
            this.monitor.recordSuccess({
                promptId: options.promptId,
                duration: Date.now() - startTime,
                tokens: estimatedTokens,
                cost: estimatedCost,
            });
            return validationResult.output;
        }
        catch (error) {
            // Try fallback
            try {
                const fallbackOutput = await this.fallbackStrategy.execute({
                    promptId: options.promptId,
                    input: options.input,
                    context: options.context,
                    originalError: error instanceof Error ? error : new Error(String(error)),
                });
                this.monitor.recordFallback({
                    promptId: options.promptId,
                    reason: error instanceof Error ? error.message : String(error),
                    fallbackTier: fallbackOutput.tier,
                });
                return fallbackOutput.result;
            }
            catch (fallbackError) {
                this.monitor.recordFailure({
                    promptId: options.promptId,
                    error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
                    duration: Date.now() - startTime,
                });
                throw fallbackError;
            }
        }
    }
    /**
     * Get registered prompt metadata
     */
    getPrompt(promptId, version) {
        return this.promptRegistry.get(promptId, version);
    }
    /**
     * Register a new prompt version
     */
    registerPrompt(prompt) {
        this.promptRegistry.register(prompt);
    }
    /**
     * Get current metrics
     */
    getMetrics() {
        return this.monitor.getMetrics();
    }
    /**
     * Check health
     */
    checkHealth() {
        return this.monitor.checkHealth();
    }
}
exports.LLMOperationsManager = LLMOperationsManager;
//# sourceMappingURL=index.js.map