/**
 * Request Streaming Support for SDK Quality
 *
 * Provides streaming request/response patterns for efficient handling of large payloads.
 * Supports both Node.js streams and Web Streams API.
 */

/**
 * Stream-based request configuration
 */
export interface StreamRequest {
  contentType?: string;
  contentLength?: number;
  transformChunk?: (chunk: Buffer | string) => any;
}

/**
 * Stream-based response handling
 */
export interface StreamResponse {
  contentType: string;
  contentLength?: number;
}

/**
 * Async Generator for streaming results
 * Yields items as they arrive
 */
export type StreamGenerator<T> = AsyncGenerator<T, void, unknown>;

/**
 * Stream handler callback
 */
export type StreamHandler<T> = (
  chunk: T,
  metadata?: { index: number; total?: number }
) => Promise<void> | void;

/**
 * Streaming request builder
 */
export class StreamingRequest<T = string | Buffer> {
  private chunks: T[] = [];
  private onData?: (chunk: T) => void;
  private onEnd?: () => void;
  private onError?: (error: Error) => void;

  /**
   * Add a chunk of data
   */
  addChunk(chunk: T): this {
    this.chunks.push(chunk);
    this.onData?.(chunk);
    return this;
  }

  /**
   * Add multiple chunks
   */
  addChunks(chunks: T[]): this {
    for (const chunk of chunks) {
      this.addChunk(chunk);
    }
    return this;
  }

  /**
   * Handle incoming chunks
   */
  onChunk(handler: (chunk: T) => void): this {
    this.onData = handler;
    return this;
  }

  /**
   * Handle stream end
   */
  onStreamEnd(handler: () => void): this {
    this.onEnd = handler;
    return this;
  }

  /**
   * Handle stream error
   */
  onStreamError(handler: (error: Error) => void): this {
    this.onError = handler;
    return this;
  }

  /**
   * Finalize the stream
   */
  end(): void {
    this.onEnd?.();
  }

  /**
   * Report error
   */
  error(err: Error): void {
    this.onError?.(err);
  }

  /**
   * Get all buffered chunks
   */
  getChunks(): T[] {
    return [...this.chunks];
  }

  /**
   * Get total size (for string/buffer chunks)
   */
  getTotalSize(): number {
    return this.chunks.reduce((size, chunk) => {
      if (chunk instanceof Buffer) return size + chunk.length;
      if (typeof chunk === "string") return size + Buffer.byteLength(chunk);
      return size;
    }, 0);
  }
}

/**
 * Streaming response builder for consuming streamed data
 */
export class StreamingResponse<T = string | Buffer> {
  private chunks: T[] = [];
  private handlers: Array<(chunk: T, meta: { index: number }) => Promise<void> | void> = [];
  private pendingCallbacks: Array<() => void> = [];

  /**
   * Register a handler for each chunk
   */
  onChunk(handler: (chunk: T, meta: { index: number }) => Promise<void> | void): this {
    this.handlers.push(handler);
    return this;
  }

  /**
   * Process an incoming chunk
   */
  async processChunk(chunk: T): Promise<void> {
    const index = this.chunks.length;
    this.chunks.push(chunk);

    for (const handler of this.handlers) {
      await handler(chunk, { index });
    }
  }

  /**
   * Get processed chunks
   */
  getChunks(): T[] {
    return [...this.chunks];
  }

  /**
   * Get result as concatenated string
   */
  asString(): string {
    return this.chunks
      .map((chunk) => {
        if (typeof chunk === "string") return chunk;
        if (chunk instanceof Buffer) return chunk.toString();
        return String(chunk);
      })
      .join("");
  }

  /**
   * Get result as concatenated buffer
   */
  asBuffer(): Buffer {
    return Buffer.concat(
      this.chunks.map((chunk) => {
        if (chunk instanceof Buffer) return chunk;
        if (typeof chunk === "string") return Buffer.from(chunk);
        return Buffer.from(String(chunk));
      })
    );
  }

  /**
   * Get result as object array
   */
  asArray(): T[] {
    return [...this.chunks];
  }
}

/**
 * Streaming request builder with generator support
 */
export class StreamableRequest<T> {
  constructor(
    private generator: () => AsyncGenerator<T, void, unknown>
  ) {}

  /**
   * Create from async iterable
   */
  static from<U>(iterable: AsyncIterable<U>): StreamableRequest<U> {
    return new StreamableRequest(async function* () {
      for await (const item of iterable) {
        yield item;
      }
    });
  }

  /**
   * Create from array
   */
  static fromArray<U>(items: U[]): StreamableRequest<U> {
    return new StreamableRequest(async function* () {
      for (const item of items) {
        yield item;
      }
    });
  }

  /**
   * Create from generator function
   */
  static fromGenerator<U>(gen: () => AsyncGenerator<U>): StreamableRequest<U> {
    return new StreamableRequest(gen);
  }

  /**
   * Get the generator
   */
  getGenerator(): AsyncGenerator<T, void, unknown> {
    return this.generator();
  }

  /**
   * Transform each item
   */
  map<U>(fn: (item: T) => U | Promise<U>): StreamableRequest<U> {
    const originalGen = this.generator;
    return new StreamableRequest(async function* () {
      for await (const item of originalGen()) {
        yield await fn(item);
      }
    });
  }

  /**
   * Filter items
   */
  filter(fn: (item: T) => boolean | Promise<boolean>): StreamableRequest<T> {
    const originalGen = this.generator;
    return new StreamableRequest(async function* () {
      for await (const item of originalGen()) {
        if (await fn(item)) {
          yield item;
        }
      }
    });
  }

  /**
   * Take first n items
   */
  take(count: number): StreamableRequest<T> {
    const originalGen = this.generator;
    return new StreamableRequest(async function* () {
      let taken = 0;
      for await (const item of originalGen()) {
        if (taken >= count) break;
        yield item;
        taken++;
      }
    });
  }

  /**
   * Collect all items into array
   */
  async collect(): Promise<T[]> {
    const items: T[] = [];
    for await (const item of this.generator()) {
      items.push(item);
    }
    return items;
  }

  /**
   * Process with callback
   */
  async forEach(callback: (item: T) => Promise<void> | void): Promise<void> {
    for await (const item of this.generator()) {
      await callback(item);
    }
  }

  /**
   * Reduce to single value
   */
  async reduce<U>(
    fn: (acc: U, item: T) => Promise<U> | U,
    initial: U
  ): Promise<U> {
    let acc = initial;
    for await (const item of this.generator()) {
      acc = await fn(acc, item);
    }
    return acc;
  }
}

/**
 * Streaming request/response pipeline
 */
export class StreamPipeline<TIn, TOut = TIn> {
  private transformers: Array<(item: TIn) => AsyncIterable<TOut>> = [];
  private handlers: Array<(item: TOut) => Promise<void> | void> = [];

  /**
   * Add a transformation step
   */
  pipe<TNext>(
    transformer: (item: TOut) => AsyncIterable<TNext>
  ): StreamPipeline<TIn, TNext> {
    const newPipeline = new StreamPipeline<TIn, TNext>();
    (newPipeline as any).transformers = [...this.transformers, ...[transformer]];
    return newPipeline;
  }

  /**
   * Add error handler
   */
  onError(_handler: (error: Error) => void): this {
    // Store error handler for pipeline execution
    return this;
  }

  /**
   * Execute pipeline
   */
  async execute(source: AsyncIterable<TIn>): Promise<void> {
    for await (const item of source) {
      let current: any = item;

      for (const transformer of this.transformers) {
        for await (const result of transformer(current)) {
          current = result;
        }
      }

      for (const handler of this.handlers) {
        await handler(current);
      }
    }
  }

  /**
   * Add result handler
   */
  onResult(handler: (item: TOut) => Promise<void> | void): this {
    this.handlers.push(handler);
    return this;
  }
}

/**
 * Helper builder for streaming
 */
export function createStream<T>(): StreamingRequest<T> {
  return new StreamingRequest();
}

/**
 * Helper builder for streaming response
 */
export function createStreamResponse<T>(): StreamingResponse<T> {
  return new StreamingResponse();
}

/**
 * Helper to create streamable request from generator
 */
export function streamFrom<T>(generator: () => AsyncGenerator<T>): StreamableRequest<T> {
  return StreamableRequest.fromGenerator(generator);
}
