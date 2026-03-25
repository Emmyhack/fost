/**
 * Pagination Support for SDK Quality
 *
 * Provides flexible pagination patterns: offset/limit, cursor-based, and keyset pagination.
 * Integrates with AsyncIterator for convenient iteration over paginated results.
 */

/**
 * Pagination parameters for offset/limit pattern
 */
export interface OffsetPaginationParams {
  offset: number;
  limit: number;
}

/**
 * Pagination parameters for cursor/next-token pattern
 */
export interface CursorPaginationParams {
  cursor?: string;
  limit: number;
}

/**
 * Pagination parameters for keyset pagination (efficient for large datasets)
 */
export interface KeysetPaginationParams {
  lastKey?: any;
  limit: number;
  direction?: "forward" | "backward";
}

export type PaginationParams = OffsetPaginationParams | CursorPaginationParams | KeysetPaginationParams;

/**
 * Result from a single page fetch
 */
export interface PageResult<T> {
  items: T[];
  hasMore: boolean;
  nextParams?: PaginationParams;
  totalCount?: number; // Optional, may not be available for all endpoints
  pageMetadata?: Record<string, any>;
}

/**
 * Strategy interface for different pagination implementations
 */
export interface PaginationStrategy<T, P extends PaginationParams = PaginationParams> {
  /**
   * Identify pagination type (offset, cursor, keyset)
   */
  type: "offset" | "cursor" | "keyset";

  /**
   * Fetch a single page
   */
  fetchPage(params: P): Promise<PageResult<T>>;

  /**
   * Get next pagination params
   */
  getNextParams(result: PageResult<T>, currentParams: P): P | null;

  /**
   * Create initial pagination params
   */
  createInitialParams(limit: number): P;
}

/**
 * Offset/Limit Pagination Strategy
 */
export class OffsetPaginationStrategy<T> implements PaginationStrategy<T, OffsetPaginationParams> {
  type = "offset" as const;

  constructor(
    private fetcher: (params: OffsetPaginationParams) => Promise<PageResult<T>>
  ) {}

  async fetchPage(params: OffsetPaginationParams): Promise<PageResult<T>> {
    return this.fetcher(params);
  }

  getNextParams(result: PageResult<T>, currentParams: OffsetPaginationParams): OffsetPaginationParams | null {
    if (!result.hasMore) return null;

    return {
      offset: currentParams.offset + currentParams.limit,
      limit: currentParams.limit,
    };
  }

  createInitialParams(limit: number): OffsetPaginationParams {
    return { offset: 0, limit };
  }
}

/**
 * Cursor-based Pagination Strategy
 */
export class CursorPaginationStrategy<T> implements PaginationStrategy<T, CursorPaginationParams> {
  type = "cursor" as const;

  constructor(
    private fetcher: (params: CursorPaginationParams) => Promise<PageResult<T>>
  ) {}

  async fetchPage(params: CursorPaginationParams): Promise<PageResult<T>> {
    return this.fetcher(params);
  }

  getNextParams(result: PageResult<T>, currentParams: CursorPaginationParams): CursorPaginationParams | null {
    if (!result.hasMore || !result.nextParams) return null;

    const nextParams = result.nextParams as CursorPaginationParams;
    return {
      cursor: nextParams.cursor,
      limit: currentParams.limit,
    };
  }

  createInitialParams(limit: number): CursorPaginationParams {
    return { limit };
  }
}

/**
 * Keyset Pagination Strategy (for efficient large dataset pagination)
 */
export class KeysetPaginationStrategy<T> implements PaginationStrategy<T, KeysetPaginationParams> {
  type = "keyset" as const;

  constructor(
    private fetcher: (params: KeysetPaginationParams) => Promise<PageResult<T>>
  ) {}

  async fetchPage(params: KeysetPaginationParams): Promise<PageResult<T>> {
    return this.fetcher(params);
  }

  getNextParams(result: PageResult<T>, currentParams: KeysetPaginationParams): KeysetPaginationParams | null {
    if (!result.hasMore || result.items.length === 0) return null;

    const lastItem = result.items[result.items.length - 1];
    return {
      lastKey: lastItem,
      limit: currentParams.limit,
      direction: currentParams.direction,
    };
  }

  createInitialParams(limit: number): KeysetPaginationParams {
    return { limit, direction: "forward" };
  }
}

/**
 * AsyncIterator over paginated results
 * Automatically fetches pages as you iterate
 */
export class PaginatedAsyncIterator<T, P extends PaginationParams = PaginationParams> {
  private currentPage: T[] = [];
  private currentIndex = 0;
  private hasMore = true;
  private currentParams: P;
  private isFinished = false;

  constructor(
    private strategy: PaginationStrategy<T, P>,
    pageSize: number = 10
  ) {
    this.currentParams = strategy.createInitialParams(pageSize);
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  async next(): Promise<IteratorResult<T, void>> {
    // If we have more items in the current page, return them
    if (this.currentIndex < this.currentPage.length) {
      return {
        done: false,
        value: this.currentPage[this.currentIndex++],
      };
    }

    // If no more pages, we're done
    if (!this.hasMore || this.isFinished) {
      this.isFinished = true;
      return { done: true, value: undefined };
    }

    // Fetch next page
    try {
      const result = await this.strategy.fetchPage(this.currentParams);
      this.currentPage = result.items;
      this.currentIndex = 0;
      this.hasMore = result.hasMore;

      // Get next params if available
      const nextParams = this.strategy.getNextParams(result, this.currentParams);
      if (nextParams) {
        this.currentParams = nextParams;
      }

      // Return first item from new page (if available)
      if (this.currentPage.length > 0) {
        return {
          done: false,
          value: this.currentPage[this.currentIndex++],
        };
      } else {
        // Empty page, mark as finished
        this.isFinished = true;
        return { done: true, value: undefined };
      }
    } catch (error) {
      this.isFinished = true;
      throw error;
    }
  }
}

/**
 * Paginated Array Collector
 * Collects all paginated results into a single array
 */
export class PaginatedCollector<T, P extends PaginationParams = PaginationParams> {
  constructor(
    private strategy: PaginationStrategy<T, P>,
    private pageSize: number = 10
  ) {}

  /**
   * Collect all items from all pages
   */
  async collect(): Promise<T[]> {
    const items: T[] = [];
    let params = this.strategy.createInitialParams(this.pageSize);
    let hasMore = true;

    while (hasMore) {
      const result = await this.strategy.fetchPage(params);
      items.push(...result.items);
      hasMore = result.hasMore;

      const nextParams = this.strategy.getNextParams(result, params);
      if (nextParams) {
        params = nextParams;
      }
    }

    return items;
  }

  /**
   * Collect items up to a maximum count
   */
  async collectUpTo(maxCount: number): Promise<T[]> {
    const items: T[] = [];
    let params = this.strategy.createInitialParams(this.pageSize);
    let hasMore = true;

    while (hasMore && items.length < maxCount) {
      const result = await this.strategy.fetchPage(params);
      const availableSlots = maxCount - items.length;
      items.push(...result.items.slice(0, availableSlots));
      hasMore = result.hasMore && items.length < maxCount;

      const nextParams = this.strategy.getNextParams(result, params);
      if (nextParams) {
        params = nextParams;
      }
    }

    return items.slice(0, maxCount);
  }

  /**
   * Paginated iteration with callback
   */
  async forEach(callback: (item: T) => Promise<void> | void): Promise<void> {
    let params = this.strategy.createInitialParams(this.pageSize);
    let hasMore = true;

    while (hasMore) {
      const result = await this.strategy.fetchPage(params);

      for (const item of result.items) {
        await callback(item);
      }

      hasMore = result.hasMore;
      const nextParams = this.strategy.getNextParams(result, params);
      if (nextParams) {
        params = nextParams;
      }
    }
  }
}

/**
 * Pagination Builder for convenient pagination setup
 */
export class PaginationBuilder<T> {
  private fetcherFn?: (params: PaginationParams) => Promise<PageResult<T>>;
  private paginationType: "offset" | "cursor" | "keyset" = "offset";
  private pageSize = 10;

  /**
   * Set the fetcher function
   */
  withFetcher(fetcher: (params: PaginationParams) => Promise<PageResult<T>>): this {
    this.fetcherFn = fetcher;
    return this;
  }

  /**
   * Set pagination type
   */
  withType(type: "offset" | "cursor" | "keyset"): this {
    this.paginationType = type;
    return this;
  }

  /**
   * Set page size
   */
  withPageSize(size: number): this {
    this.pageSize = size;
    return this;
  }

  /**
   * Build the pagination strategy
   */
  build(): PaginationStrategy<T, PaginationParams> {
    if (!this.fetcherFn) {
      throw new Error("Fetcher function is required");
    }

    switch (this.paginationType) {
      case "offset":
        return new OffsetPaginationStrategy(this.fetcherFn as any);
      case "cursor":
        return new CursorPaginationStrategy(this.fetcherFn as any);
      case "keyset":
        return new KeysetPaginationStrategy(this.fetcherFn as any);
    }
  }

  /**
   * Build an async iterator
   */
  buildIterator(): PaginatedAsyncIterator<T> {
    const strategy = this.build();
    return new PaginatedAsyncIterator(strategy as any, this.pageSize);
  }

  /**
   * Build a collector
   */
  buildCollector(): PaginatedCollector<T> {
    const strategy = this.build();
    return new PaginatedCollector(strategy as any, this.pageSize);
  }
}

/**
 * Helper to create pagination from fetch function
 */
export function createPagination<T>(
  fetcher: (params: PaginationParams) => Promise<PageResult<T>>,
  type: "offset" | "cursor" | "keyset" = "offset",
  pageSize: number = 10
): PaginationBuilder<T> {
  return new PaginationBuilder<T>()
    .withFetcher(fetcher)
    .withType(type)
    .withPageSize(pageSize);
}
