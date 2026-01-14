"use strict";
// Retry Strategy - Handles transient failures with exponential backoff and jitter
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = exports.RetryStrategy = exports.DEFAULT_RETRY_CONFIG = void 0;
exports.DEFAULT_RETRY_CONFIG = {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 60000,
    backoffMultiplier: 2.0,
    jitterFactor: 0.1,
    retryableErrors: [
        'RATE_LIMIT_EXCEEDED',
        'SERVICE_UNAVAILABLE',
        'TIMEOUT',
        'GATEWAY_TIMEOUT',
        'CONNECTION_ERROR',
    ],
};
/**
 * Retry Strategy with exponential backoff and jitter
 * Handles transient LLM service failures
 */
class RetryStrategy {
    constructor(config = {}) {
        this.config = { ...exports.DEFAULT_RETRY_CONFIG, ...config };
    }
    /**
     * Execute function with retry logic
     */
    async executeWithRetry(fn) {
        let lastError;
        let delay = this.config.initialDelayMs;
        for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
            try {
                return await fn();
            }
            catch (error) {
                lastError = error;
                // Check if error is retryable
                if (!this.isRetryable(error)) {
                    throw error; // Not retryable, fail immediately
                }
                // Check if we have retries left
                if (attempt === this.config.maxRetries) {
                    break; // Will throw below
                }
                // Calculate delay with jitter
                const jitter = Math.random() * this.config.jitterFactor;
                const actualDelay = delay * (1 + jitter);
                console.warn(`Attempt ${attempt + 1} failed, retrying in ${Math.round(actualDelay)}ms: ${error}`);
                await this.sleep(Math.round(actualDelay));
                // Increase delay for next iteration
                delay = Math.min(delay * this.config.backoffMultiplier, this.config.maxDelayMs);
            }
        }
        // All retries exhausted
        throw lastError;
    }
    /**
     * Check if error is retryable
     */
    isRetryable(error) {
        const errorCode = error.code || error.message || '';
        // Check if error code matches retryable list
        for (const retryableError of this.config.retryableErrors) {
            if (errorCode.includes(retryableError)) {
                return true;
            }
        }
        // Check HTTP status codes
        const status = error.status || error.statusCode;
        if (status) {
            // 429: Rate limit, 5xx: Server errors (except 501)
            if (status === 429 || (status >= 500 && status !== 501)) {
                return true;
            }
        }
        return false;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Get current config
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update config
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
}
exports.RetryStrategy = RetryStrategy;
class CircuitBreaker {
    constructor(failureThreshold = 5, successThreshold = 2, resetTimeoutMs = 60000) {
        this.state = {
            status: 'CLOSED',
            failureCount: 0,
            successCount: 0,
        };
        this.failureThreshold = failureThreshold;
        this.successThreshold = successThreshold;
        this.resetTimeoutMs = resetTimeoutMs;
    }
    /**
     * Execute function with circuit breaker protection
     */
    async execute(fn) {
        // Check if circuit should reset
        if (this.state.status === 'OPEN') {
            const timeSinceFailure = Date.now() - (this.state.lastFailureTime?.getTime() || 0);
            if (timeSinceFailure > this.resetTimeoutMs) {
                console.log('Circuit breaker transitioning to HALF_OPEN');
                this.state.status = 'HALF_OPEN';
                this.state.successCount = 0;
            }
            else {
                throw new Error(`Circuit breaker is OPEN, service unavailable for ${Math.ceil((this.resetTimeoutMs - timeSinceFailure) / 1000)}s`);
            }
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure();
            throw error;
        }
    }
    onSuccess() {
        this.state.failureCount = 0;
        if (this.state.status === 'HALF_OPEN') {
            this.state.successCount++;
            if (this.state.successCount >= this.successThreshold) {
                console.log('Circuit breaker transitioning to CLOSED');
                this.state.status = 'CLOSED';
                this.state.successCount = 0;
            }
        }
    }
    onFailure() {
        this.state.lastFailureTime = new Date();
        this.state.failureCount++;
        if (this.state.failureCount >= this.failureThreshold) {
            console.warn('Circuit breaker transitioning to OPEN');
            this.state.status = 'OPEN';
        }
    }
    /**
     * Get circuit breaker state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Reset circuit breaker
     */
    reset() {
        this.state = {
            status: 'CLOSED',
            failureCount: 0,
            successCount: 0,
        };
    }
}
exports.CircuitBreaker = CircuitBreaker;
//# sourceMappingURL=retry-strategy.js.map