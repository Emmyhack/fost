/**
 * Type-Safe Request Builder for SDK Quality
 *
 * Provides a fluent API for constructing type-safe requests with validation.
 * Supports headers, parameters, body, and middleware.
 */

/**
 * Request configuration
 */
export interface RequestConfig {
  method: string;
  url: string;
  headers: Record<string, string>;
  query: Record<string, any>;
  body?: any;
  timeout?: number;
  retries?: number;
  middleware?: Array<(config: RequestConfig) => void | Promise<void>>;
}

/**
 * Type-safe field configuration
 */
export interface FieldSchema {
  name: string;
  type: string;
  required?: boolean;
  validator?: (value: any) => boolean | Promise<boolean>;
  transform?: (value: any) => any;
  description?: string;
}

/**
 * Field validation error
 */
export interface FieldError {
  field: string;
  error: string;
  value?: any;
}

/**
 * Request builder with type safety
 */
export class TypeSafeRequestBuilder<T extends Record<string, any>> {
  private config: RequestConfig = {
    method: "GET",
    url: "",
    headers: {},
    query: {},
  };

  private schema: Map<string, FieldSchema> = new Map();
  private data: Partial<T> = {};
  private errors: FieldError[] = [];

  /**
   * Set HTTP method
   */
  method(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"): this {
    this.config.method = method;
    return this;
  }

  /**
   * Set request URL
   */
  url(url: string): this {
    this.config.url = url;
    return this;
  }

  /**
   * Set request header
   */
  header(key: string, value: string): this {
    this.config.headers[key] = value;
    return this;
  }

  /**
   * Set multiple headers
   */
  headers(headers: Record<string, string>): this {
    this.config.headers = { ...this.config.headers, ...headers };
    return this;
  }

  /**
   * Add query parameter
   */
  query(key: string, value: any): this {
    this.config.query[key] = value;
    return this;
  }

  /**
   * Add multiple query parameters
   */
  queryParams(params: Record<string, any>): this {
    this.config.query = { ...this.config.query, ...params };
    return this;
  }

  /**
   * Set request body
   */
  body(body: any): this {
    this.config.body = body;
    return this;
  }

  /**
   * Set timeout in milliseconds
   */
  timeout(ms: number): this {
    this.config.timeout = ms;
    return this;
  }

  /**
   * Set retry count
   */
  retries(count: number): this {
    this.config.retries = count;
    return this;
  }

  /**
   * Add middleware function
   */
  use(middleware: (config: RequestConfig) => void | Promise<void>): this {
    if (!this.config.middleware) {
      this.config.middleware = [];
    }
    this.config.middleware.push(middleware);
    return this;
  }

  /**
   * Define a field with schema
   */
  defineField<K extends keyof T>(
    name: K,
    schema: FieldSchema
  ): this {
    this.schema.set(String(name), schema);
    return this;
  }

  /**
   * Set a field value
   */
  set<K extends keyof T>(name: K, value: T[K]): this {
    const fieldName = String(name);
    const fieldSchema = this.schema.get(fieldName);

    if (!fieldSchema) {
      throw new Error(`Field ${fieldName} not defined in schema`);
    }

    // Type check
    if (typeof value !== "undefined" && fieldSchema.type && typeof value !== fieldSchema.type) {
      // Allow for loose equality (number vs string, etc.)
      if (!(fieldSchema.type === "number" && !isNaN(Number(value)))) {
        this.errors.push({
          field: fieldName,
          error: `Expected ${fieldSchema.type}, got ${typeof value}`,
          value,
        });
        return this;
      }
    }

    // Validate
    if (fieldSchema.validator) {
      const isValid = fieldSchema.validator(value);
      if (!isValid) {
        this.errors.push({
          field: fieldName,
          error: `Validation failed for field ${fieldName}`,
          value,
        });
        // Still store the value so validate() can check it
      }
    }

    // Transform
    const finalValue = fieldSchema.transform ? fieldSchema.transform(value) : value;
    this.data[name as K] = finalValue;

    return this;
  }

  /**
   * Set multiple field values
   */
  setFields(data: Partial<T>): this {
    for (const [key, value] of Object.entries(data)) {
      this.set(key as keyof T, value as any);
    }
    return this;
  }

  /**
   * Validate all fields
   */
  validate(): { valid: boolean; errors: FieldError[] } {
    const errors: FieldError[] = [];

    for (const [fieldName, schema] of this.schema.entries()) {
      const value = this.data[fieldName as keyof T];

      // Check required fields
      if (schema.required && (value === undefined || value === null)) {
        errors.push({
          field: fieldName,
          error: `Required field ${fieldName} is missing`,
        });
        continue;
      }

      // Validate non-empty values
      if (value !== undefined && value !== null) {
        if (schema.validator && !schema.validator(value)) {
          errors.push({
            field: fieldName,
            error: `Validation failed for field ${fieldName}`,
            value,
          });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Get validation errors
   */
  getErrors(): FieldError[] {
    return [...this.errors];
  }

  /**
   * Clear validation errors
   */
  clearErrors(): this {
    this.errors = [];
    return this;
  }

  /**
   * Get the built request configuration
   */
  build(): RequestConfig & { data: Partial<T> } {
    const validation = this.validate();
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map((e) => e.error).join(", ")}`);
    }

    return {
      ...this.config,
      data: this.data,
    };
  }

  /**
   * Get the built request configuration without validation
   */
  buildUnsafe(): RequestConfig & { data: Partial<T> } {
    return {
      ...this.config,
      data: this.data,
    };
  }

  /**
   * Get current data
   */
  getData(): Partial<T> {
    return { ...this.data };
  }

  /**
   * Get current configuration
   */
  getConfig(): RequestConfig {
    return { ...this.config };
  }

  /**
   * Clone the builder
   */
  clone(): TypeSafeRequestBuilder<T> {
    const clone = new TypeSafeRequestBuilder<T>();
    clone.config = { ...this.config };
    clone.schema = new Map(this.schema);
    clone.data = { ...this.data };
    clone.errors = [...this.errors];
    return clone;
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.config = {
      method: "GET",
      url: "",
      headers: {},
      query: {},
    };
    this.data = {};
    this.errors = [];
    return this;
  }
}

/**
 * Fluent request builder factory
 */
export class RequestBuilderFactory<T extends Record<string, any>> {
  private builder: TypeSafeRequestBuilder<T>;

  constructor() {
    this.builder = new TypeSafeRequestBuilder<T>();
  }

  /**
   * Create a new builder
   */
  static create<U extends Record<string, any>>(): RequestBuilderFactory<U> {
    return new RequestBuilderFactory<U>();
  }

  /**
   * Get the builder
   */
  getBuilder(): TypeSafeRequestBuilder<T> {
    return this.builder;
  }

  /**
   * Configure builder
   */
  configure(fn: (builder: TypeSafeRequestBuilder<T>) => void): this {
    fn(this.builder);
    return this;
  }

  /**
   * Build and return
   */
  build(): RequestConfig & { data: Partial<T> } {
    return this.builder.build();
  }

  /**
   * Clone factory
   */
  clone(): RequestBuilderFactory<T> {
    const cloned = new RequestBuilderFactory<T>();
    cloned.builder = this.builder.clone();
    return cloned;
  }
}

/**
 * Helper to create a request builder
 */
export function createRequestBuilder<T extends Record<string, any>>(): TypeSafeRequestBuilder<T> {
  return new TypeSafeRequestBuilder();
}

/**
 * Chainable query builder
 */
export class QueryBuilder {
  private filters: Array<{ key: string; value: any; operator?: string }> = [];
  private sorts: Array<{ field: string; direction: "asc" | "desc" }> = [];
  private limit: number = 10;
  private offset: number = 0;

  /**
   * Add filter
   */
  filter(key: string, value: any, operator: string = "eq"): this {
    this.filters.push({ key, value, operator });
    return this;
  }

  /**
   * Add sort
   */
  sortBy(field: string, direction: "asc" | "desc" = "asc"): this {
    this.sorts.push({ field, direction });
    return this;
  }

  /**
   * Set limit
   */
  setLimit(limit: number): this {
    this.limit = limit;
    return this;
  }

  /**
   * Set offset
   */
  setOffset(offset: number): this {
    this.offset = offset;
    return this;
  }

  /**
   * Build query string
   */
  buildQueryString(): string {
    /* global URLSearchParams */
    const params = new URLSearchParams();

    for (const filter of this.filters) {
      const key = filter.operator ? `${filter.key}[${filter.operator}]` : filter.key;
      params.append(key, String(filter.value));
    }

    for (const sort of this.sorts) {
      params.append("sort", `${sort.field}:${sort.direction}`);
    }

    params.append("limit", String(this.limit));
    params.append("offset", String(this.offset));

    return params.toString();
  }

  /**
   * Build query object
   */
  buildQuery(): Record<string, any> {
    const query: Record<string, any> = {};

    for (const filter of this.filters) {
      const key = filter.operator && filter.operator !== "eq" ? `${filter.key}[${filter.operator}]` : filter.key;
      query[key] = filter.value;
    }

    if (this.sorts.length > 0) {
      query.sort = this.sorts.map((s) => `${s.field}:${s.direction}`).join(",");
    }

    query.limit = this.limit;
    query.offset = this.offset;

    return query;
  }

  /**
   * Clone the builder
   */
  clone(): QueryBuilder {
    const cloned = new QueryBuilder();
    cloned.filters = [...this.filters];
    cloned.sorts = [...this.sorts];
    cloned.limit = this.limit;
    cloned.offset = this.offset;
    return cloned;
  }
}
