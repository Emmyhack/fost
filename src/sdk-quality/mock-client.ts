/**
 * Mock Client Generator for SDK Quality
 *
 * Generates mock clients for testing SDK implementations.
 * Supports response recording, replaying, and custom handlers.
 */

/**
 * Mock response configuration
 */
export interface MockResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
  delay?: number; // Simulated network delay in ms
  error?: Error; // Simulate error
}

/**
 * Mock request matcher
 */
export interface RequestMatcher {
  method?: string;
  path?: string;
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, any>;
}

/**
 * Mock call log
 */
export interface MockCallLog {
  timestamp: number;
  method: string;
  path: string;
  query?: Record<string, any>;
  body?: any;
  headers: Record<string, string>;
  response: MockResponse;
  duration: number;
}

/**
 * Mock request handler
 */
export type MockHandler = (
  method: string,
  path: string,
  body?: any,
  query?: Record<string, any>
) => MockResponse | Promise<MockResponse>;

/**
 * Mock client for testing
 */
export class MockClient {
  private handlers: Map<string, MockHandler> = new Map();
  private callLogs: MockCallLog[] = [];
  private defaultDelay = 0;
  private defaultResponse: Partial<MockResponse> = {
    status: 200,
    headers: { "content-type": "application/json" },
  };

  /**
   * Register a mock handler
   */
  on(
    method: string,
    path: string,
    handler: (body?: any, query?: Record<string, any>) => MockResponse | Promise<MockResponse> | any
  ): this {
    const key = `${method}:${path}`;
    this.handlers.set(key, async (m, p, body, query) => {
      const result = await handler(body, query);

      // If handler returns a plain object, wrap it as response body
      if (typeof result === "object" && !("status" in result || "body" in result)) {
        return {
          status: 200,
          headers: { "content-type": "application/json" },
          body: result,
        };
      }

      return result;
    });

    return this;
  }

  /**
   * Register GET handler
   */
  get(path: string, handler: (query?: Record<string, any>) => any): this {
    return this.on("GET", path, (body, query) => handler(query));
  }

  /**
   * Register POST handler
   */
  post(path: string, handler: (body?: any) => any): this {
    return this.on("POST", path, handler);
  }

  /**
   * Register PUT handler
   */
  put(path: string, handler: (body?: any) => any): this {
    return this.on("PUT", path, handler);
  }

  /**
   * Register PATCH handler
   */
  patch(path: string, handler: (body?: any) => any): this {
    return this.on("PATCH", path, handler);
  }

  /**
   * Register DELETE handler
   */
  delete(path: string, handler: (query?: Record<string, any>) => any): this {
    return this.on("DELETE", path, (body, query) => handler(query));
  }

  /**
   * Set default network delay for all requests
   */
  setDefaultDelay(ms: number): this {
    this.defaultDelay = ms;
    return this;
  }

  /**
   * Set default response
   */
  setDefaultResponse(response: Partial<MockResponse>): this {
    this.defaultResponse = response;
    return this;
  }

  /**
   * Make a mock request
   */
  async request(
    method: string,
    path: string,
    body?: any,
    query?: Record<string, any>,
    headers: Record<string, string> = {}
  ): Promise<MockResponse> {
    const startTime = Date.now();
    const key = `${method}:${path}`;

    // Try exact match
    let handler = this.handlers.get(key);

    // Try wildcard match
    if (!handler) {
      for (const [handlerKey, h] of this.handlers.entries()) {
        const [hMethod, hPath] = handlerKey.split(":");
        const pathRegex = new RegExp(`^${hPath.replace(/\*/g, ".*")}$`);

        if (hMethod === method && pathRegex.test(path)) {
          handler = h;
          break;
        }
      }
    }

    // Call handler or return default
    let response: MockResponse;
    if (handler) {
      response = await handler(method, path, body, query);
    } else {
      response = {
        ...this.defaultResponse,
        status: 404,
        body: { error: "Not found" },
      } as MockResponse;
    }

    // Simulate network delay
    const delay = response.delay ?? this.defaultDelay;
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Log the call
    this.callLogs.push({
      timestamp: Date.now(),
      method,
      path,
      query,
      body,
      headers,
      response,
      duration: Date.now() - startTime,
    });

    // Simulate error if configured
    if (response.error) {
      throw response.error;
    }

    return response;
  }

  /**
   * Get all call logs
   */
  getCallLogs(): MockCallLog[] {
    return [...this.callLogs];
  }

  /**
   * Get calls matching criteria
   */
  getCalls(matcher: RequestMatcher): MockCallLog[] {
    return this.callLogs.filter((log) => {
      if (matcher.method && log.method !== matcher.method) return false;
      if (matcher.path && log.path !== matcher.path) return false;
      if (matcher.query && JSON.stringify(log.query) !== JSON.stringify(matcher.query)) return false;
      if (matcher.body && JSON.stringify(log.body) !== JSON.stringify(matcher.body)) return false;

      return true;
    });
  }

  /**
   * Assert a call was made
   */
  assertCalled(method: string, path: string): boolean {
    return this.callLogs.some((log) => log.method === method && log.path === path);
  }

  /**
   * Assert a call was made N times
   */
  assertCalledTimes(method: string, path: string, times: number): boolean {
    const count = this.callLogs.filter((log) => log.method === method && log.path === path).length;
    return count === times;
  }

  /**
   * Clear call logs
   */
  clearLogs(): this {
    this.callLogs = [];
    return this;
  }

  /**
   * Clear all handlers
   */
  clearHandlers(): this {
    this.handlers.clear();
    return this;
  }

  /**
   * Reset mock client
   */
  reset(): this {
    this.clearLogs();
    this.clearHandlers();
    this.defaultDelay = 0;
    this.defaultResponse = {
      status: 200,
      headers: { "content-type": "application/json" },
    };
    return this;
  }
}

/**
 * Mock response recorder
 */
export class ResponseRecorder {
  private recordings: Map<string, MockResponse[]> = new Map();

  /**
   * Record a response
   */
  record(method: string, path: string, response: MockResponse): void {
    const key = `${method}:${path}`;
    if (!this.recordings.has(key)) {
      this.recordings.set(key, []);
    }
    this.recordings.get(key)!.push(response);
  }

  /**
   * Play back responses
   */
  playback(client: MockClient): void {
    for (const [key, responses] of this.recordings.entries()) {
      const [method, path] = key.split(":");
      let index = 0;

      client.on(method, path, () => {
        if (index < responses.length) {
          return responses[index++];
        }
        return responses[responses.length - 1]; // Return last response if exhausted
      });
    }
  }

  /**
   * Export as JSON for persistence
   */
  toJSON(): string {
    const data: Record<string, any> = {};
    for (const [key, responses] of this.recordings.entries()) {
      data[key] = responses;
    }
    return JSON.stringify(data);
  }

  /**
   * Import from JSON
   */
  static fromJSON(json: string): ResponseRecorder {
    const recorder = new ResponseRecorder();
    const data = JSON.parse(json);

    for (const [key, responses] of Object.entries(data)) {
      const [method, path] = key.split(":");
      for (const response of responses as MockResponse[]) {
        recorder.record(method, path, response);
      }
    }

    return recorder;
  }
}

/**
 * Helper to create mock client
 */
export function createMockClient(): MockClient {
  return new MockClient();
}

/**
 * Helper to create response recorder
 */
export function createResponseRecorder(): ResponseRecorder {
  return new ResponseRecorder();
}
