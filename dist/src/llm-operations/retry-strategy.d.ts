export interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    jitterFactor: number;
    retryableErrors: string[];
}
export declare const DEFAULT_RETRY_CONFIG: RetryConfig;
/**
 * Retry Strategy with exponential backoff and jitter
 * Handles transient LLM service failures
 */
export declare class RetryStrategy {
    private config;
    constructor(config?: Partial<RetryConfig>);
    /**
     * Execute function with retry logic
     */
    executeWithRetry<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Check if error is retryable
     */
    private isRetryable;
    private sleep;
    /**
     * Get current config
     */
    getConfig(): RetryConfig;
    /**
     * Update config
     */
    setConfig(config: Partial<RetryConfig>): void;
}
/**
 * Circuit Breaker Pattern - Prevents cascading failures
 */
export interface CircuitBreakerState {
    status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
    failureCount: number;
    successCount: number;
    lastFailureTime?: Date;
}
export declare class CircuitBreaker {
    private state;
    private failureThreshold;
    private successThreshold;
    private resetTimeoutMs;
    constructor(failureThreshold?: number, successThreshold?: number, resetTimeoutMs?: number);
    /**
     * Execute function with circuit breaker protection
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
    private onSuccess;
    private onFailure;
    /**
     * Get circuit breaker state
     */
    getState(): CircuitBreakerState;
    /**
     * Reset circuit breaker
     */
    reset(): void;
}
//# sourceMappingURL=retry-strategy.d.ts.map