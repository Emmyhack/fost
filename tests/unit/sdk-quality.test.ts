/**
 * SDK Quality - Pagination, Streaming, Builders, Resilience Tests
 */

import { describe, it, beforeEach, expect, vi } from "vitest";
import {
  PaginationBuilder,
  OffsetPaginationStrategy,
  CursorPaginationStrategy,
  PaginatedAsyncIterator,
  PaginatedCollector,
} from "../../src/sdk-quality/pagination";
import {
  StreamingRequest,
  StreamingResponse,
  StreamableRequest,
} from "../../src/sdk-quality/streaming";
import {
  TypeSafeRequestBuilder,
  QueryBuilder,
} from "../../src/sdk-quality/request-builder";
import {
  RetryStrategy,
  TimeoutManager,
  CircuitBreaker,
  ResilientExecutor,
  TimeoutError,
} from "../../src/sdk-quality/resilience";
import {
  MockClient,
  ResponseRecorder,
} from "../../src/sdk-quality/mock-client";

// ============================================================================
// PAGINATION TESTS
// ============================================================================

describe("Pagination - Offset/Limit Strategy", () => {
  it("should paginate with offset/limit", async () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

    const strategy = new OffsetPaginationStrategy(async (params) => {
      const start = params.offset;
      const end = start + params.limit;
      const page = items.slice(start, end);

      return {
        items: page,
        hasMore: end < items.length,
        nextParams: end < items.length ? { offset: end, limit: params.limit } : undefined,
      };
    });

    const collector = new PaginatedCollector(strategy as any, 10);
    const result = await collector.collect();

    expect(result.length).toBe(25);
    expect(result[0].id).toBe(1);
    expect(result[24].id).toBe(25);
  });

  it("should create async iterator", async () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
    let callCount = 0;

    const strategy = new OffsetPaginationStrategy(async (params) => {
      callCount++;
      const start = params.offset;
      const page = items.slice(start, start + params.limit);
      return {
        items: page,
        hasMore: start + params.limit < items.length,
      };
    });

    const iterator = new PaginatedAsyncIterator(strategy as any, 2);
    const collected: any[] = [];

    for await (const item of iterator) {
      collected.push(item);
    }

    expect(collected.length).toBe(3);
    expect(callCount).toBeGreaterThan(0); // Multiple calls for pagination
  });

  it("should collect limited items", async () => {
    const items = Array.from({ length: 100 }, (_, i) => i + 1);

    const strategy = new OffsetPaginationStrategy(async (params) => {
      const page = items.slice(params.offset, params.offset + params.limit);
      return {
        items: page,
        hasMore: params.offset + params.limit < items.length,
      };
    });

    const collector = new PaginatedCollector(strategy as any, 10);
    const result = await collector.collectUpTo(25);

    expect(result.length).toBe(25);
    expect(result[0]).toBe(1);
    expect(result[24]).toBe(25);
  });
});

describe("Pagination - Cursor Strategy", () => {
  it("should paginate with cursor", async () => {
    const strategy = new CursorPaginationStrategy(async (params) => {
      const mockData = [
        { id: "1", name: "A", cursor: "cursor_2" },
        { id: "2", name: "B", cursor: "cursor_3" },
        { id: "3", name: "C", cursor: null },
      ];

      const startIndex = params.cursor ? parseInt(params.cursor.split("_")[1]) : 1;
      const item = mockData.find((d) => d.id === String(startIndex));

      return {
        items: item ? [item] : [],
        hasMore: item?.cursor !== null,
        nextParams: item?.cursor ? { cursor: item.cursor, limit: params.limit } : undefined,
      };
    });

    const collector = new PaginatedCollector(strategy as any, 1);
    const result = await collector.collect();

    expect(result.length).toBeGreaterThan(0);
  });
});

describe("PaginationBuilder", () => {
  it("should build pagination with fluent API", async () => {
    const items = [1, 2, 3, 4, 5];

    const builder = new PaginationBuilder<number>()
      .withFetcher(async (params: any) => ({
        items: items.slice(params.offset, params.offset + params.limit),
        hasMore: params.offset + params.limit < items.length,
      }))
      .withType("offset")
      .withPageSize(2);

    const iterator = builder.buildIterator();
    const collected: number[] = [];

    for await (const item of iterator) {
      collected.push(item);
    }

    expect(collected.length).toBe(5);
  });
});

// ============================================================================
// STREAMING TESTS
// ============================================================================

describe("Streaming - Request & Response", () => {
  it("should build streaming request with chunks", () => {
    const request = new StreamingRequest<string>();
    let receivedChunks: string[] = [];

    request
      .onChunk((chunk) => {
        receivedChunks.push(chunk);
      })
      .addChunk("Hello ")
      .addChunk("World");

    expect(request.getChunks()).toEqual(["Hello ", "World"]);
    expect(receivedChunks).toEqual(["Hello ", "World"]);
  });

  it("should process streaming response with handlers", async () => {
    const response = new StreamingResponse<string>();
    let processedCount = 0;

    response.onChunk(async () => {
      processedCount++;
    });

    await response.processChunk("chunk1");
    await response.processChunk("chunk2");

    expect(processedCount).toBe(2);
    expect(response.asString()).toBe("chunk1chunk2");
  });

  it("should create streamable request with generator", async () => {
    async function* dataGenerator() {
      yield { id: 1, name: "Item 1" };
      yield { id: 2, name: "Item 2" };
      yield { id: 3, name: "Item 3" };
    }

    const request = StreamableRequest.fromGenerator(dataGenerator);
    const collected = await request.collect();

    expect(collected.length).toBe(3);
    expect(collected[0].id).toBe(1);
  });

  it("should transform streamable request items", async () => {
    const request = StreamableRequest.fromArray([1, 2, 3, 4, 5]);
    const doubled = request
      .map((n) => n * 2)
      .filter((n) => n > 4)
      .take(3);

    const result = await doubled.collect();

    expect(result).toEqual([6, 8, 10]);
  });
});

// ============================================================================
// REQUEST BUILDER TESTS
// ============================================================================

describe("Type-Safe Request Builder", () => {
  it("should build request with fluent API", () => {
    const builder = new TypeSafeRequestBuilder<{ userId: string; name: string }>();

    builder
      .method("POST")
      .url("/api/users")
      .header("Authorization", "Bearer token")
      .query("filter", "active")
      .timeout(5000);

    const config = builder.buildUnsafe();

    expect(config.method).toBe("POST");
    expect(config.url).toBe("/api/users");
    expect(config.headers.Authorization).toBe("Bearer token");
    expect(config.query.filter).toBe("active");
    expect(config.timeout).toBe(5000);
  });

  it("should validate required fields", () => {
    const builder = new TypeSafeRequestBuilder<{ id: string; name: string }>();

    builder.defineField("id", { name: "id", type: "string", required: true });
    builder.defineField("name", { name: "name", type: "string", required: true });

    // Only set id, not name
    builder.set("id", "123");

    const validation = builder.validate();

    // name is required but not set, so validation should fail
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors.some((e) => e.field === "name")).toBe(true);
  });

  it("should transform field values", () => {
    const builder = new TypeSafeRequestBuilder<{ email: string }>();

    builder.defineField("email", {
      name: "email",
      type: "string",
      transform: (v) => v.toLowerCase(),
    });

    builder.set("email", "USER@EXAMPLE.COM");
    const data = builder.getData();

    expect(data.email).toBe("user@example.com");
  });

  it("should validate with custom validator", () => {
    const builder = new TypeSafeRequestBuilder<{ age: number }>();

    builder.defineField("age", {
      name: "age",
      type: "number",
      validator: (v) => v >= 18,
    });

    builder.set("age", 15);
    const validation = builder.validate();

    expect(validation.valid).toBe(false);
  });
});

describe("Query Builder", () => {
  it("should build query with filters and sorts", () => {
    const query = new QueryBuilder()
      .filter("status", "active")
      .filter("age", 25, "gte")
      .sortBy("created", "desc")
      .setLimit(20)
      .setOffset(10);

    const queryObj = query.buildQuery();

    // Filters are stored with operator in key
    expect(queryObj["status"]).toBe("active");
    expect(queryObj["age[gte]"]).toBe(25);
    expect(queryObj.sort).toContain("created:desc");
    expect(queryObj.limit).toBe(20);
    expect(queryObj.offset).toBe(10);
  });

  it("should build query string", () => {
    const query = new QueryBuilder()
      .filter("search", "test")
      .setLimit(10);

    const queryString = query.buildQueryString();

    // URLSearchParams encodes brackets as %5B and %5D
    expect(queryString).toMatch(/search.*test/);
    expect(queryString).toMatch(/limit=10/);
  });
});

// ============================================================================
// RESILIENCE TESTS
// ============================================================================

describe("Retry Strategy", () => {
  it("should retry failed operation", async () => {
    let attempts = 0;
    const strategy = new RetryStrategy({
      maxAttempts: 3,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2,
      retryableErrors: [Error],
    });

    const fn = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error("Temporary error");
      }
      return "success";
    };

    const result = await strategy.execute(fn);

    expect(result).toBe("success");
    expect(attempts).toBe(3);
  });

  it("should fail after max attempts", async () => {
    let attempts = 0;
    const strategy = new RetryStrategy({
      maxAttempts: 2,
      initialDelayMs: 10,
      maxDelayMs: 100,
      backoffMultiplier: 2,
      retryableErrors: [Error],
    });

    const fn = async () => {
      attempts++;
      throw new Error("Always fails");
    };

    try {
      await strategy.execute(fn);
      expect.fail("Should have thrown");
    } catch (error) {
      expect(attempts).toBe(2);
    }
  });
});

describe("Timeout Manager", () => {
  it("should timeout promise", async () => {
    const manager = new TimeoutManager({
      connect: 1000,
      request: 1000,
      response: 1000,
      total: 1000,
    });

    const promise = new Promise((resolve) => setTimeout(resolve, 5000));

    try {
      await manager.withTimeout(promise, 100);
      expect.fail("Should have timed out");
    } catch (error) {
      expect(error).toBeInstanceOf(TimeoutError);
    }
  });

  it("should complete before timeout", async () => {
    const manager = new TimeoutManager({
      connect: 1000,
      request: 1000,
      response: 1000,
      total: 1000,
    });

    const promise = Promise.resolve("success");
    const result = await manager.withTimeout(promise, 100);

    expect(result).toBe("success");
  });
});

describe("Circuit Breaker", () => {
  it("should open circuit after failures", async () => {
    const breaker = new CircuitBreaker(3, 100);

    for (let i = 0; i < 3; i++) {
      breaker.recordFailure();
    }

    expect(breaker.getState()).toBe("open");
    expect(breaker.canAttempt()).toBe(false);
  });

  it("should recover with half-open state", async () => {
    const breaker = new CircuitBreaker(2, 100);

    // Trip the breaker
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe("open");

    // Wait for reset
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should be half-open and allow attempt
    expect(breaker.canAttempt()).toBe(true);
    expect(breaker.getState()).toBe("half-open");

    // Success should close it
    breaker.recordSuccess();
    breaker.recordSuccess();
    expect(breaker.getState()).toBe("closed");
  });

  it("should execute with circuit breaker", async () => {
    const breaker = new CircuitBreaker(2, 100);
    let attempts = 0;

    try {
      await breaker.execute(async () => {
        attempts++;
        throw new Error("Fail");
      });
    } catch {
      // Expected
    }

    expect(attempts).toBe(1);
  });
});

describe("Resilient Executor", () => {
  it("should execute with retry and timeout", async () => {
    let attempts = 0;
    const executor = new ResilientExecutor(
      { maxAttempts: 3, initialDelayMs: 10, maxDelayMs: 50, backoffMultiplier: 2, retryableErrors: [Error] },
      { connect: 5000, request: 5000, response: 5000, total: 5000 }
    );

    const result = await executor.execute(async () => {
      attempts++;
      if (attempts < 2) {
        throw new Error("Retry me");
      }
      return "success";
    });

    expect(result).toBe("success");
    expect(attempts).toBe(2);
  });
});

// ============================================================================
// MOCK CLIENT TESTS
// ============================================================================

describe("Mock Client", () => {
  let client: MockClient;

  beforeEach(() => {
    client = new MockClient();
  });

  it("should handle GET requests", async () => {
    client.get("/users", (query) => ({
      users: [{ id: 1, name: "Alice" }],
      filter: query?.filter,
    }));

    const response = await client.request("GET", "/users", undefined, { filter: "active" });

    expect(response.body.users).toHaveLength(1);
    expect(response.body.filter).toBe("active");
  });

  it("should handle POST requests", async () => {
    client.post("/users", (body) => ({
      id: 1,
      ...body,
    }));

    const response = await client.request("POST", "/users", { name: "Bob" });

    expect(response.body.id).toBe(1);
    expect(response.body.name).toBe("Bob");
  });

  it("should record call logs", async () => {
    client.get("/test", () => ({ status: "ok" }));

    await client.request("GET", "/test");
    await client.request("GET", "/test");

    const logs = client.getCallLogs();

    expect(logs).toHaveLength(2);
    expect(logs[0].method).toBe("GET");
    expect(logs[0].path).toBe("/test");
  });

  it("should assert calls", async () => {
    client.get("/users", () => []);

    await client.request("GET", "/users");

    expect(client.assertCalled("GET", "/users")).toBe(true);
    expect(client.assertCalledTimes("GET", "/users", 1)).toBe(true);
  });

  it("should simulate network delay", async () => {
    client.get("/delayed", () => ({ data: "test" }));
    client.setDefaultDelay(50);

    const start = Date.now();
    await client.request("GET", "/delayed");
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(40);
  });

  it("should simulate errors", async () => {
    const error = new Error("Network error");
    client.on("GET", "/error", async () => ({
      status: 500,
      body: { error: "Server error" },
      error,
    }));

    try {
      await client.request("GET", "/error");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBe(error);
    }
  });
});

describe("Response Recorder", () => {
  it("should record and playback responses", async () => {
    const recorder = new ResponseRecorder();

    recorder.record("GET", "/users", {
      status: 200,
      headers: { "content-type": "application/json" },
      body: [{ id: 1 }],
    });

    const client = new MockClient();
    recorder.playback(client);

    const response = await client.request("GET", "/users");

    expect(response.body).toEqual([{ id: 1 }]);
  });

  it("should serialize to JSON", () => {
    const recorder = new ResponseRecorder();

    recorder.record("GET", "/test", {
      status: 200,
      headers: {},
      body: { data: "test" },
    });

    const json = recorder.toJSON();

    expect(json).toContain("GET:/test");
    expect(json).toContain("data");
  });
});
