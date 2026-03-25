/**
 * Retry and Timeout Middleware for SDK Quality
 *
 * Provides robust retry strategies with exponential backoff,
 * timeout handling, and circuit breaker patterns.
 */

/**
 * Retry strategy configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitter?: boolean;
  retryableStatusCodes?: number[];
  retryableErrors?: Array<new (...args: any[]) => Error>;
}

/**
 * Retry metadata
 */
export interface RetryMetadata {
  attempt: number;
  totalAttempts: number;
  delayMs: number;
  lastError?: Error;
  isRetryable: boolean;
}

/**
 * Timeout configuration
 */
export interface TimeoutConfig {
  connect: number; // Connection timeout
  request: number; // Request timeout
  response: number; // Response timeout
  total: number; // Total operation timeout
}

/**
 * Exponential backoff strategy
 */
export class ExponentialBackoff {
  constructor(
    private initialDelayMs: number,
    private maxDelayMs: number,
    private multiplier: number = 2,
    private jitter: boolean = false
  ) {}

  /**
   * Calculate delay for attempt
   */
  getDelay(attempt: number): number {
    let delay = this.initialDelayMs * Math.pow(this.multiplier, attempt - 1);
    delay = Math.min(delay, this.maxDelayMs);

    if (this.jitter) {
      // Add random jitter: 0 to delay
      delay = delay * Math.random();
    }

    return Math.round(delay);
  }

  /**
   * Get total time for all attempts
   */
  getTotalTime(attempts: number): number {
    let total = 0;
    for (let i = 1; i <= attempts; i++) {
      total += this.getDelay(i);
    }
    return total;
  }
}

/**
 * Retry strategy implementation
 */
export class RetryStrategy {
  private backoff: ExponentialBackoff;
  private retryableStatusCodes: Set<number>;
  private retryableErrors: Map<string, boolean>;

  constructor(private config: RetryConfig) {
    this.backoff = new ExponentialBackoff(
      config.initialDelayMs,
      config.maxDelayMs,
      config.backoffMultiplier,
      config.jitter
    );

    this.retryableStatusCodes = new Set(config.retryableStatusCodes || [429, 500, 502, 503, 504]);

    this.retryableErrors = new Map();
    if (config.retryableErrors) {
      for (const ErrorClass of config.retryableErrors) {
        this.retryableErrors.set(ErrorClass.name, true);
      }
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryable(error: Error | { status?: number }): boolean {
    // Check HTTP status codes
    if ("status" in error && typeof error.status === "number") {
      return this.retryableStatusCodes.has(error.status);
    }

    // Check error type
    if (error instanceof Error) {
      return this.retryableErrors.has(error.constructor.name);
    }

    return false;
  }

  /**
   * Execute function with retry
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        const isRetryable = this.isRetryable(lastError);
        const isLastAttempt = attempt === this.config.maxAttempts;

        if (!isRetryable || isLastAttempt) {
          throw lastError;
        }

        // Calculate delay and wait
        const delayMs = this.backoff.getDelay(attempt);
        await this.sleep(delayMs);
      }
    }

    if (lastError) {
      throw lastError;
    }

    throw new Error("Retry exhausted");
  }

  /**
   * Get retry metadata
   */
  getMetadata(attempt: number, error?: Error): RetryMetadata {
    return {
      attempt,
      totalAttempts: this.config.maxAttempts,
      delayMs: this.backoff.getDelay(attempt),
      lastError: error,
      isRetryable: error ? this.isRetryable(error) : false,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Timeout manager
 */
export class TimeoutManager {
  constructor(private config: TimeoutConfig) {}

  /**
   * Wrap promise with timeout
   */
  async withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => {
          reject(new TimeoutError(`Operation timed out after ${milliseconds}ms`));
        }, milliseconds)
      ),
    ]);
  }

  /**
   * Get appropriate timeout for operation
   */
  getTimeout(operation: keyof TimeoutConfig): number {
    return this.config[operation];
  }

  /**
   * Create timeout for connect
   */
  connectTimeout<T>(promise: Promise<T>): Promise<T> {
    return this.withTimeout(promise, this.config.connect);
  }

  /**
   * Create timeout for request
   */
  requestTimeout<T>(promise: Promise<T>): Promise<T> {
    return this.withTimeout(promise, this.config.request);
  }

  /**
   * Create timeout for response
   */
  responseTimeout<T>(promise: Promise<T>): Promise<T> {
    return this.withTimeout(promise, this.config.response);
  }

  /**
   * Create timeout for total operation
   */
  totalTimeout<T>(promise: Promise<T>): Promise<T> {
    return this.withTimeout(promise, this.config.total);
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

/**
 * Circuit breaker for handling cascading failures
 */
export class CircuitBreaker {
  private state: "closed" | "open" | "half-open" = "closed";
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(
    private failureThreshold: number = 5,
    private resetTimeoutMs: number = 60000,
    private successThreshold: number = 2
  ) {}

  /**
   * Get current state
   */
  getState(): string {
    return this.state;
  }

  /**
   * Record success
   */
  recordSuccess(): void {
    this.failureCount = 0;

    if (this.state === "half-open") {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = "closed";
        this.successCount = 0;
      }
    }
  }

  /**
   * Record failure
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "open";
    }
  }

  /**
   * Check if can attempt
   */
  canAttempt(): boolean {
    if (this.state === "closed") return true;

    if (this.state === "open") {
      // Check if reset timeout has expired
      if (Date.now() - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = "half-open";
        this.successCount = 0;
        return true;
      }
      return false;
    }

    // half-open: allow attempt
    return true;
  }

  /**
   * Execute with circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canAttempt()) {
      throw new Error(`Circuit breaker is ${this.state}`);
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      timeSinceLastFailure: Date.now() - this.lastFailureTime,
    };
  }

  /**
   * Reset the breaker
   */
  reset(): void {
    this.state = "closed";
    this.failureCount = 0;
    this.successCount = 0;
  }
}

/**
 * Combined retry + timeout manager
 */
export class ResilientExecutor {
  private retryStrategy: RetryStrategy;
  private timeoutManager: TimeoutManager;
  private circuitBreaker: CircuitBreaker;

  constructor(
    retryConfig?: Partial<RetryConfig>,
    timeoutConfig?: Partial<TimeoutConfig>,
    circuitBreakerConfig?: { failureThreshold?: number; resetTimeoutMs?: number }
  ) {
    const defaultRetryConfig: RetryConfig = {
      maxAttempts: 3,
      initialDelayMs: 100,
      maxDelayMs: 5000,
      backoffMultiplier: 2,
      jitter: true,
      ...retryConfig,
    };

    const defaultTimeoutConfig: TimeoutConfig = {
      connect: 5000,
      request: 10000,
      response: 10000,
      total: 30000,
      ...timeoutConfig,
    };

    this.retryStrategy = new RetryStrategy(defaultRetryConfig);
    this.timeoutManager = new TimeoutManager(defaultTimeoutConfig);
    this.circuitBreaker = new CircuitBreaker(
      circuitBreakerConfig?.failureThreshold,
      circuitBreakerConfig?.resetTimeoutMs
    );
  }

  /**
   * Execute with all resilience patterns
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const withCircuitBreaker = () => this.circuitBreaker.execute(() => fn());

    const withTimeout = async () => {
      return this.timeoutManager.withTimeout(withCircuitBreaker(), this.timeoutManager.getTimeout("total"));
    };

    return this.retryStrategy.execute(withTimeout);
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      circuitBreaker: this.circuitBreaker.getStats(),
    };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.circuitBreaker.reset();
  }
}

/**
 * Helper to create resilient executor
 */
export function createResilientExecutor(
  retryConfig?: Partial<RetryConfig>,
  timeoutConfig?: Partial<TimeoutConfig>
): ResilientExecutor {
  return new ResilientExecutor(retryConfig, timeoutConfig);
}

/**
 * Helper to create retry strategy
 */
export function createRetryStrategy(config: Partial<RetryConfig> = {}): RetryStrategy {
  const defaultConfig: RetryConfig = {
    maxAttempts: 3,
    initialDelayMs: 100,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
    ...config,
  };
  return new RetryStrategy(defaultConfig);
}
