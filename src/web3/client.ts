/**
 * WEB3 CLIENT
 * 
 * Core Web3 SDK client for interacting with blockchain networks.
 * Provides wallet management, transaction handling, and event subscriptions.
 * 
 * Design principles:
 * - Explicit state management (no hidden async operations)
 * - Separation of concerns (wallet, transactions, events)
 * - Production-ready error handling
 * - Type-safe blockchain operations
 */

import { TransactionLifecycle, TransactionState } from "../schemas/web3-extensions";
import {
  TransactionMonitor,
  TransactionMonitorConfig,
  TransactionProgressCallback,
} from "./transaction-monitor";
import {
  EventSubscriptionManager,
  EventFilter,
  SubscriptionStrategy,
  EventCallback,
  SmartContractEvent,
  EventSubscription,
  SubscriptionState,
} from "./event-subscriptions";

/**
 * Wallet connection states
 */
export enum WalletState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTING = "DISCONNECTING",
}

/**
 * Wallet connection information
 */
export interface WalletConnection {
  state: WalletState;
  address?: string;
  chainId?: number;
  balance?: string; // In wei
  connectedAt?: number;
  error?: string;
}

/**
 * Transaction request
 */
export interface TransactionRequest {
  to?: string; // Recipient address
  from?: string; // Sender address (optional, uses connected wallet)
  value?: string; // ETH amount in wei
  data?: string; // Call data (hex)
  chainId?: number;
  nonce?: number;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  customData?: Record<string, any>; // For custom chains
}

/**
 * Options for submitting transactions
 */
export interface SubmitTransactionOptions {
  onProgress?: TransactionProgressCallback;
  skipGasEstimation?: boolean;
  userGasLimit?: string;
  awaitConfirmation?: boolean;
  confirmationBlocks?: number;
}

/**
 * Options for connecting wallet
 */
export interface ConnectWalletOptions {
  /** Wallet type to prefer */
  walletType?: "injected" | "walletconnect" | "coinbase";

  /** Whether to auto-connect on page load */
  autoConnect?: boolean;

  /** Required chain IDs (will prompt user if on different chain) */
  requiredChains?: number[];
}

/**
 * Web3 client configuration
 */
export interface Web3ClientConfig {
  /** RPC provider URLs by chain ID */
  rpcUrls: Record<number, string>;

  /** Current chain ID */
  chainId: number;

  /** Transaction monitoring config */
  monitoringConfig: TransactionMonitorConfig;

  /** Event subscription strategy */
  eventStrategy?: SubscriptionStrategy;

  /** Auto-connect to last used wallet */
  autoConnect?: boolean;
}

/**
 * Main Web3 SDK Client
 */
export class Web3Client {
  private config: Web3ClientConfig;
  private walletConnection: WalletConnection = {
    state: WalletState.DISCONNECTED,
  };
  private transactionMonitor: TransactionMonitor;
  private eventSubscriptions: EventSubscriptionManager;
  private activePendingTransactions: Map<string, TransactionLifecycle> =
    new Map();

  // Event handlers
  private onWalletChange: (wallet: WalletConnection) => void = () => {};
  private onChainChange: (chainId: number) => void = () => {};
  private onError: (error: Error) => void = () => {};

  constructor(config: Web3ClientConfig) {
    this.config = config;
    this.transactionMonitor = new TransactionMonitor(config.monitoringConfig);
    this.eventSubscriptions = new EventSubscriptionManager();
  }

  // =========================================================================
  // WALLET MANAGEMENT
  // =========================================================================

  /**
   * Connect to a blockchain wallet
   */
  async connectWallet(
    options?: ConnectWalletOptions
  ): Promise<WalletConnection> {
    try {
      this.walletConnection.state = WalletState.CONNECTING;

      // In production, this would interact with window.ethereum or WalletConnect
      // For now, placeholder implementation
      await this.performWalletConnection(options);

      this.walletConnection.state = WalletState.CONNECTED;
      this.walletConnection.connectedAt = Date.now();

      this.onWalletChange(this.walletConnection);
      return this.walletConnection;
    } catch (error) {
      this.walletConnection.state = WalletState.DISCONNECTED;
      this.walletConnection.error =
        error instanceof Error ? error.message : "Unknown error";
      this.onError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    this.walletConnection.state = WalletState.DISCONNECTING;
    this.transactionMonitor.stopAll();
    this.eventSubscriptions.unsubscribeAll();

    this.walletConnection = {
      state: WalletState.DISCONNECTED,
    };

    this.onWalletChange(this.walletConnection);
  }

  /**
   * Get current wallet connection state
   */
  getWalletConnection(): WalletConnection {
    return this.walletConnection;
  }

  /**
   * Switch to a different blockchain
   */
  async switchChain(chainId: number): Promise<number> {
    if (!this.walletConnection.address) {
      throw new Error("No wallet connected");
    }

    if (!this.config.rpcUrls[chainId]) {
      throw new Error(`Chain ${chainId} not configured`);
    }

    this.config.chainId = chainId;
    this.walletConnection.chainId = chainId;

    this.onChainChange(chainId);
    return chainId;
  }

  /**
   * Get current chain ID
   */
  getChainId(): number {
    return this.config.chainId;
  }

  // =========================================================================
  // TRANSACTION MANAGEMENT
  // =========================================================================

  /**
   * Estimate gas for a transaction
   */
  async estimateGas(tx: TransactionRequest): Promise<string> {
    if (!this.walletConnection.address) {
      throw new Error("No wallet connected");
    }

    // In production: return ethers.estimateGas(tx)
    // For now, return a default estimate
    return "21000";
  }

  /**
   * Submit a transaction to the network
   */
  async submitTransaction(
    tx: TransactionRequest,
    options?: SubmitTransactionOptions
  ): Promise<TransactionLifecycle> {
    // Validate preconditions
    if (!this.walletConnection.address) {
      throw new Error("No wallet connected");
    }

    // Prepare transaction
    const preparedTx = this.prepareTx(tx);

    // Estimate gas if needed
    if (!options?.skipGasEstimation && !preparedTx.gasLimit) {
      preparedTx.gasLimit = await this.estimateGas(preparedTx);
    }

    // Request user signature
    let signedTx: string;
    try {
      signedTx = await this.requestSignature(preparedTx);
    } catch (error) {
      throw new Error(`User rejected signing: ${error}`);
    }

    // Submit to network
    let txHash: string;
    try {
      txHash = await this.submitSignedTransaction(signedTx);
    } catch (error) {
      throw new Error(`Failed to submit transaction: ${error}`);
    }

    // Create lifecycle object
    const lifecycle: TransactionLifecycle = {
      state: TransactionState.SUBMITTED,
      hash: txHash,
      nonce: preparedTx.nonce || 0,
      confirmations: 0,
      createdAt: Date.now(),
      submittedAt: Date.now(),
    };

    this.activePendingTransactions.set(txHash, lifecycle);

    // Start monitoring if requested
    if (options?.awaitConfirmation !== false) {
      const confirmations = options?.confirmationBlocks || 12;
      const monitorConfig = {
        ...this.config.monitoringConfig,
        confirmationThreshold: confirmations,
      };

      const monitoredLifecycle = await this.transactionMonitor.monitor(
        txHash,
        lifecycle,
        options?.onProgress
      );

      this.activePendingTransactions.set(txHash, monitoredLifecycle);
      return monitoredLifecycle;
    }

    return lifecycle;
  }

  /**
   * Get status of a submitted transaction
   */
  getTransactionStatus(txHash: string): TransactionLifecycle | null {
    return (
      this.activePendingTransactions.get(txHash) ||
      this.transactionMonitor.getTransactionState(txHash)
    );
  }

  /**
   * Get all pending transactions
   */
  getPendingTransactions(): TransactionLifecycle[] {
    return Array.from(this.activePendingTransactions.values()).filter(
      (tx) =>
        tx.state !== TransactionState.FINALIZED &&
        tx.state !== TransactionState.REVERTED &&
        tx.state !== TransactionState.FAILED &&
        tx.state !== TransactionState.DROPPED
    );
  }

  /**
   * Cancel monitoring of a transaction (does not cancel on-chain)
   */
  stopMonitoringTransaction(txHash: string): void {
    this.transactionMonitor.stopMonitoring(txHash);
    this.activePendingTransactions.delete(txHash);
  }

  // =========================================================================
  // EVENT SUBSCRIPTIONS
  // =========================================================================

  /**
   * Subscribe to smart contract events
   */
  subscribeToEvents(
    filter: EventFilter,
    callback: EventCallback,
    strategy?: SubscriptionStrategy
  ): string {
    return this.eventSubscriptions.subscribe(
      filter,
      strategy || this.config.eventStrategy || "polling",
      true, // Include historical events
      callback
    );
  }

  /**
   * Unsubscribe from events
   */
  unsubscribeFromEvents(subscriptionId: string): void {
    this.eventSubscriptions.unsubscribe(subscriptionId);
  }

  /**
   * Get subscription status
   */
  getEventSubscription(subscriptionId: string): EventSubscription | null {
    return this.eventSubscriptions.getSubscription(subscriptionId);
  }

  /**
   * Get all active event subscriptions
   */
  getAllEventSubscriptions(): EventSubscription[] {
    return this.eventSubscriptions.getAllSubscriptions();
  }

  /**
   * Manually emit an event (for testing or custom handlers)
   */
  async emitEvent(event: SmartContractEvent): Promise<void> {
    await this.eventSubscriptions.emitEvent(event);
  }

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Register wallet change handler
   */
  onWalletConnected(handler: (wallet: WalletConnection) => void): void {
    this.onWalletChange = handler;
  }

  /**
   * Register chain change handler
   */
  onChainChanged(handler: (chainId: number) => void): void {
    this.onChainChange = handler;
  }

  /**
   * Register error handler
   */
  onErrorOccurred(handler: (error: Error) => void): void {
    this.onError = handler;
  }

  // =========================================================================
  // PRIVATE HELPERS
  // =========================================================================

  private prepareTx(tx: TransactionRequest): TransactionRequest {
    // Set defaults
    return {
      ...tx,
      from: tx.from || this.walletConnection.address,
      chainId: tx.chainId || this.config.chainId,
    };
  }

  private async performWalletConnection(
    options?: ConnectWalletOptions
  ): Promise<void> {
    // In production: interact with window.ethereum or WalletConnect
    // This is a placeholder implementation
    this.walletConnection = {
      state: WalletState.CONNECTED,
      address: "0x0000000000000000000000000000000000000000",
      chainId: this.config.chainId,
      balance: "0",
      connectedAt: Date.now(),
    };
  }

  private async requestSignature(tx: TransactionRequest): Promise<string> {
    // In production: use wallet.signTransaction(tx)
    // This is a placeholder
    return "0x" + "0".repeat(130);
  }

  private async submitSignedTransaction(signedTx: string): Promise<string> {
    // In production: use provider.sendTransaction(signedTx)
    // This is a placeholder
    return "0x" + "1234567890abcdef".repeat(4);
  }

  /**
   * Cleanup and release resources
   */
  async destroy(): Promise<void> {
    await this.disconnectWallet();
  }
}
