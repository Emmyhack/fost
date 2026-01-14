// LLM Operations Module - Complete Implementation
// Handles prompts, validation, retries, fallbacks, and monitoring

export * from './prompt-registry';
export * from './llm-client';
export * from './output-validator';
export * from './retry-strategy';
export * from './fallback-strategy';
export * from './monitoring';
export * from './determinism';

import { PromptRegistry } from './prompt-registry';
import { LLMClient } from './llm-client';
import { OutputValidator } from './output-validator';
import { RetryStrategy } from './retry-strategy';
import { FallbackStrategy } from './fallback-strategy';
import { LLMMonitor } from './monitoring';

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
export class LLMOperationsManager {
  private promptRegistry: PromptRegistry;
  private llmClient: LLMClient;
  private validator: OutputValidator;
  private retryStrategy: RetryStrategy;
  private fallbackStrategy: FallbackStrategy;
  private monitor: LLMMonitor;

  constructor(config: LLMOperationsConfig) {
    this.promptRegistry = new PromptRegistry();
    this.llmClient = new LLMClient(config);
    this.validator = new OutputValidator();
    this.retryStrategy = new RetryStrategy();
    this.fallbackStrategy = new FallbackStrategy();
    this.monitor = new LLMMonitor(config.enableMonitoring);
  }

  /**
   * Call LLM with full safety: validation, retry, fallback, monitoring
   */
  async callWithSafety(options: {
    promptId: string;
    promptVersion?: string;
    input: Record<string, any>;
    context?: Record<string, any>;
  }): Promise<any> {
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
      const estimatedTokens = Math.ceil((output as string).length / 4);
      const estimatedCost = estimatedTokens * 0.00001; // Rough estimate

      this.monitor.recordSuccess({
        promptId: options.promptId,
        duration: Date.now() - startTime,
        tokens: estimatedTokens,
        cost: estimatedCost,
      });

      return validationResult.output;
    } catch (error) {
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
      } catch (fallbackError) {
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
  getPrompt(promptId: string, version?: string) {
    return this.promptRegistry.get(promptId, version);
  }

  /**
   * Register a new prompt version
   */
  registerPrompt(prompt: any) {
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
