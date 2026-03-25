/**
 * SDK Quality Module - Public API
 *
 * Comprehensive SDK quality improvements including pagination, streaming,
 * type-safe builders, resilience patterns, and mock clients.
 */

// Pagination
export {
  OffsetPaginationParams,
  CursorPaginationParams,
  KeysetPaginationParams,
  PaginationParams,
  PageResult,
  PaginationStrategy,
  OffsetPaginationStrategy,
  CursorPaginationStrategy,
  KeysetPaginationStrategy,
  PaginatedAsyncIterator,
  PaginatedCollector,
  PaginationBuilder,
  createPagination,
} from "./pagination";

// Streaming
export {
  StreamRequest,
  StreamResponse,
  StreamGenerator,
  StreamHandler,
  StreamingRequest,
  StreamingResponse,
  StreamableRequest,
  StreamPipeline,
  createStream,
  createStreamResponse,
  streamFrom,
} from "./streaming";

// Request Builder
export {
  RequestConfig,
  FieldSchema,
  FieldError,
  TypeSafeRequestBuilder,
  RequestBuilderFactory,
  createRequestBuilder,
  QueryBuilder,
} from "./request-builder";

// Resilience (Retry + Timeout)
export {
  RetryConfig,
  RetryMetadata,
  TimeoutConfig,
  ExponentialBackoff,
  RetryStrategy,
  TimeoutManager,
  TimeoutError,
  CircuitBreaker,
  ResilientExecutor,
  createResilientExecutor,
  createRetryStrategy,
} from "./resilience";

// Mock Client
export {
  MockResponse,
  RequestMatcher,
  MockCallLog,
  MockHandler,
  MockClient,
  ResponseRecorder,
  createMockClient,
  createResponseRecorder,
} from "./mock-client";
