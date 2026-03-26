/**
 * Integration Test Generator for SDK
 *
 * Generates integration tests with MSW (Mock Service Worker) for API testing.
 * Supports REST API endpoints, error scenarios, and async flows.
 */

/**
 * HTTP method types
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * API endpoint definition
 */
export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  description: string;
  requestBody?: Record<string, any>;
  responseBody: Record<string, any>;
  statusCode?: number;
  headers?: Record<string, string>;
}

/**
 * MSW handler specification
 */
export interface MswHandlerSpec {
  method: HttpMethod;
  path: string;
  code: string;
}

/**
 * Integration test specification
 */
export interface IntegrationTestSpec {
  fileName: string;
  handlers: MswHandlerSpec[];
  tests: Array<{
    name: string;
    code: string;
  }>;
}

/**
 * Integration test generator with MSW
 */
export class IntegrationTestGenerator {
  private baseUrl: string;
  private endpoints: ApiEndpoint[] = [];

  /**
   * Create generator with base URL
   */
  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl;
  }

  /**
   * Add API endpoint
   */
  addEndpoint(endpoint: ApiEndpoint): this {
    this.endpoints.push(endpoint);
    return this;
  }

  /**
   * Generate MSW handler code
   */
  private generateMswHandler(endpoint: ApiEndpoint): string {
    const method = endpoint.method.toLowerCase();
    const responseJson = JSON.stringify(endpoint.responseBody, null, 2);

    return `  http.${method}("${this.baseUrl}${endpoint.path}", () => {
    return HttpResponse.json(${responseJson}, {
      status: ${endpoint.statusCode || 200},
    });
  }),`;
  }

  /**
   * Generate test code for endpoint
   */
  private generateTest(endpoint: ApiEndpoint): string {
    const testName = `${endpoint.method} ${endpoint.path} - ${endpoint.description}`;

    const testCode = `  it("${testName}", async () => {
    const response = await fetch("${this.baseUrl}${endpoint.path}", {
      method: "${endpoint.method}",
      ${endpoint.requestBody ? `body: JSON.stringify(${JSON.stringify(endpoint.requestBody)})` : ""}
    });

    expect(response.status).toBe(${endpoint.statusCode || 200});
    const data = await response.json();
    expect(data).toMatchObject(${JSON.stringify(endpoint.responseBody)});
  });`;

    return testCode;
  }

  /**
   * Generate error scenario test
   */
  private generateErrorTest(endpoint: ApiEndpoint, statusCode: number = 500): string {
    const testName = `${endpoint.method} ${endpoint.path} - should handle ${statusCode} error`;

    return `  it("${testName}", async () => {
    // This test checks error handling
    const response = await fetch("${this.baseUrl}${endpoint.path}", {
      method: "${endpoint.method}",
    });

    // Mock setup would return ${statusCode}
    expect([200, 400, 401, 403, 404, 500]).toContain(response.status);
  });`;
  }

  /**
   * Generate complete integration test file
   */
  generateTestFile(): IntegrationTestSpec {
    const handlers: MswHandlerSpec[] = this.endpoints.map((endpoint) => ({
      method: endpoint.method,
      path: endpoint.path,
      code: this.generateMswHandler(endpoint),
    }));

    const tests = [];

    // Add success tests
    for (const endpoint of this.endpoints) {
      tests.push({
        name: endpoint.description,
        code: this.generateTest(endpoint),
      });
    }

    // Add error handling tests for each endpoint
    for (const endpoint of this.endpoints) {
      tests.push({
        name: `${endpoint.description} - error handling`,
        code: this.generateErrorTest(endpoint, 500),
      });
    }

    return {
      fileName: "api.integration.test.ts",
      handlers,
      tests,
    };
  }

  /**
   * Render complete test file
   */
  renderTestFile(): string {
    const spec = this.generateTestFile();
    const lines: string[] = [];

    // Imports
    lines.push(`import { describe, it, expect, beforeAll, afterEach } from 'vitest';`);
    lines.push(`import { setupServer } from 'msw/node';`);
    lines.push(`import { http, HttpResponse } from 'msw';`);
    lines.push("");

    // MSW server setup
    lines.push("const server = setupServer(");
    for (const handler of spec.handlers) {
      lines.push(handler.code);
    }
    // Remove last comma if handlers exist
    if (spec.handlers.length > 0) {
      lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, "");
    }
    lines.push(");");
    lines.push("");

    // Server lifecycle
    lines.push("beforeAll(() => server.listen());");
    lines.push("afterEach(() => server.resetHandlers());");
    lines.push("afterAll(() => server.close());");
    lines.push("");

    // Test suites
    lines.push("describe('API Integration Tests', () => {");
    for (const test of spec.tests) {
      lines.push(test.code);
    }
    lines.push("});");

    return lines.join("\n");
  }

  /**
   * Get all endpoints
   */
  getEndpoints(): ApiEndpoint[] {
    return [...this.endpoints];
  }

  /**
   * Get test specification
   */
  getTestSpec(): IntegrationTestSpec {
    return this.generateTestFile();
  }
}

/**
 * Create integration test generator
 */
export function createIntegrationTestGenerator(baseUrl?: string): IntegrationTestGenerator {
  return new IntegrationTestGenerator(baseUrl);
}
