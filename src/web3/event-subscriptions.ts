/**
 * EVENT SUBSCRIPTIONS MANAGER
 * 
 * Manages smart contract event subscriptions with explicit lifecycle.
 * Supports both WebSocket and polling-based event delivery.
 * 
 * Design principles:
 * - Event subscription state is explicit and trackable
 * - Easy to unsubscribe and clean up
 * - Supports multiple strategies (WebSocket, polling, GraphQL)
 * - Filters and decoding are configurable
 */

/**
 * Subscription strategies for event monitoring
 */
export type SubscriptionStrategy = "websocket" | "polling" | "graphql";

/**
 * Event filter criteria
 */
export interface EventFilter {
  /** Smart contract address(es) to listen on */
  address?: string | string[];

  /** Event topic(s) to filter */
  topics?: (string | string[] | null)[];

  /** Start block for historical events */
  fromBlock?: number | "latest" | "pending";

  /** End block for range queries */
  toBlock?: number | "latest" | "pending";
}

/**
 * Decoded smart contract event
 */
export interface SmartContractEvent {
  /** Event name */
  name: string;

  /** Contract address that emitted the event */
  address: string;

  /** Event topic signature */
  signature: string;

  /** Decoded event arguments */
  args: Record<string, any>;

  /** Transaction hash */
  transactionHash: string;

  /** Block number where event occurred */
  blockNumber: number;

  /** Transaction index in block */
  transactionIndex: number;

  /** Log index in block */
  logIndex: number;

  /** Timestamp when event occurred */
  timestamp: number;

  /** Raw log data */
  rawData: string;
}

/**
 * Subscription state
 */
export enum SubscriptionState {
  /** Subscription created but not yet active */
  PENDING = "PENDING",

  /** Subscription is actively listening */
  ACTIVE = "ACTIVE",

  /** Subscription is paused but can be resumed */
  PAUSED = "PAUSED",

  /** Subscription has been terminated */
  CLOSED = "CLOSED",

  /** Subscription encountered an error */
  ERROR = "ERROR",
}

/**
 * Represents an active event subscription
 */
export interface EventSubscription {
  /** Unique subscription identifier */
  id: string;

  /** Current subscription state */
  state: SubscriptionState;

  /** Event filter criteria */
  filter: EventFilter;

  /** Subscription strategy */
  strategy: SubscriptionStrategy;

  /** Whether to include historical events */
  includeHistorical: boolean;

  /** Events received so far */
  eventCount: number;

  /** Time subscription was created */
  createdAt: number;

  /** Time subscription was connected */
  connectedAt?: number;

  /** Any error message if in ERROR state */
  error?: string;
}

/**
 * Event callback function
 */
export type EventCallback = (event: SmartContractEvent) => void | Promise<void>;

/**
 * Manages smart contract event subscriptions
 */
export class EventSubscriptionManager {
  private subscriptions: Map<string, EventSubscription> = new Map();
  private callbacks: Map<string, EventCallback[]> = new Map();
  private subscriptionCounter: number = 0;

  /**
   * Create a new event subscription
   */
  subscribe(
    filter: EventFilter,
    strategy: SubscriptionStrategy = "polling",
    includeHistorical: boolean = false,
    onEvent?: EventCallback
  ): string {
    const subscriptionId = `sub-${this.subscriptionCounter++}`;

    const subscription: EventSubscription = {
      id: subscriptionId,
      state: SubscriptionState.PENDING,
      filter,
      strategy,
      includeHistorical,
      eventCount: 0,
      createdAt: Date.now(),
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.callbacks.set(subscriptionId, onEvent ? [onEvent] : []);

    // In production, this would actually set up the subscription with the provider
    this.activateSubscription(subscriptionId);

    return subscriptionId;
  }

  /**
   * Activate a subscription
   */
  private activateSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    subscription.state = SubscriptionState.ACTIVE;
    subscription.connectedAt = Date.now();

    // Load historical events if requested
    if (subscription.includeHistorical) {
      this.loadHistoricalEvents(subscriptionId);
    }
  }

  /**
   * Add a callback to an existing subscription
   */
  addCallback(
    subscriptionId: string,
    callback: EventCallback
  ): void {
    const cbs = this.callbacks.get(subscriptionId);
    if (cbs) {
      cbs.push(callback);
    }
  }

  /**
   * Remove a callback from a subscription
   */
  removeCallback(
    subscriptionId: string,
    callback: EventCallback
  ): void {
    const cbs = this.callbacks.get(subscriptionId);
    if (cbs) {
      const index = cbs.indexOf(callback);
      if (index > -1) {
        cbs.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all subscriptions that match
   */
  async emitEvent(event: SmartContractEvent): Promise<void> {
    for (const [subId, subscription] of this.subscriptions) {
      if (this.matchesFilter(event, subscription.filter)) {
        subscription.eventCount++;

        const cbs = this.callbacks.get(subId) || [];
        for (const callback of cbs) {
          try {
            await callback(event);
          } catch (error) {
            console.error(`Error in event callback for ${subId}:`, error);
          }
        }
      }
    }
  }

  /**
   * Check if an event matches a filter
   */
  private matchesFilter(event: SmartContractEvent, filter: EventFilter): boolean {
    // Match address
    if (filter.address) {
      const addresses = Array.isArray(filter.address)
        ? filter.address
        : [filter.address];
      if (!addresses.includes(event.address)) {
        return false;
      }
    }

    // Match topics
    if (filter.topics && filter.topics.length > 0) {
      for (let i = 0; i < filter.topics.length; i++) {
        const filterTopic = filter.topics[i];
        if (filterTopic === null) {
          // Wildcard
          continue;
        }

        // Skip unused variable
        // In production, would compare with event.signature or event.args
        // For now, simplified matching
      }
    }

    return true;
  }

  /**
   * Load historical events for a subscription
   */
  private loadHistoricalEvents(_subscriptionId: string): void {
    // In production, would fetch historical events from RPC
    // for (const event of await this.provider.getLogs(filter)) {
    //   await this.emitEvent(event);
    // }
  }

  /**
   * Pause a subscription
   */
  pause(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription && subscription.state === SubscriptionState.ACTIVE) {
      subscription.state = SubscriptionState.PAUSED;
    }
  }

  /**
   * Resume a paused subscription
   */
  resume(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription && subscription.state === SubscriptionState.PAUSED) {
      subscription.state = SubscriptionState.ACTIVE;
    }
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.state = SubscriptionState.CLOSED;
      this.subscriptions.delete(subscriptionId);
      this.callbacks.delete(subscriptionId);
    }
  }

  /**
   * Get subscription status
   */
  getSubscription(subscriptionId: string): EventSubscription | null {
    return this.subscriptions.get(subscriptionId) || null;
  }

  /**
   * Get all active subscriptions
   */
  getAllSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Get subscriptions matching a filter
   */
  getSubscriptionsByFilter(filter: Partial<EventFilter>): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter((sub) => {
      if (filter.address && sub.filter.address !== filter.address) {
        return false;
      }
      return true;
    });
  }

  /**
   * Unsubscribe all subscriptions
   */
  unsubscribeAll(): void {
    for (const subscriptionId of this.subscriptions.keys()) {
      this.unsubscribe(subscriptionId);
    }
  }

  /**
   * Mark subscription as errored
   */
  markError(subscriptionId: string, error: Error): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.state = SubscriptionState.ERROR;
      subscription.error = error.message;
    }
  }
}
