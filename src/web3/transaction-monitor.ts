/**
 * TRANSACTION MONITOR
 * 
 * Monitors blockchain transactions through their complete lifecycle.
 * Tracks state transitions, confirmations, and blocks.
 * 
 * Design principles:
 * - Explicit state tracking (no hidden states)
 * - Configurable confirmation thresholds per chain
 * - Detects block reorganization (reorgs)
 * - Provides progression callbacks for UI updates
 */

import { TransactionLifecycle, TransactionState } from "../schemas/web3-extensions";

/**
 * Configuration for transaction monitoring
 */
export interface TransactionMonitorConfig {
  /** RPC provider URL for polling */
  providerUrl: string;

  /** Polling interval in milliseconds */
  pollingIntervalMs?: number;

  /** Number of confirmations required for finalization */
  confirmationThreshold: number;

  /** Enable block reorg detection */
  blockReorgDetection?: boolean;

  /** Maximum number of blocks to detect reorg for */
  reorgLookbackBlocks?: number;
}

/**
 * Callback for transaction state updates
 */
export type TransactionProgressCallback = (
  lifecycle: TransactionLifecycle,
  previousState: TransactionState
) => void | Promise<void>;

/**
 * Represents a monitored transaction
 */
interface MonitoredTransaction {
  hash: string;
  lifecycle: TransactionLifecycle;
  callbacks: TransactionProgressCallback[];
  lastKnownBlockNumber?: number;
  pollCount: number;
  createdAt: number;
}

/**
 * Monitors transaction lifecycle from submission to finalization
 */
export class TransactionMonitor {
  private config: TransactionMonitorConfig;
  private monitoredTransactions: Map<string, MonitoredTransaction> = new Map();
  private pollIntervals: Map<string, NodeJS.Timeout> = new Map();
  private cachedBlockNumber: number = 0;
  private lastSeenBlocks: Map<number, string> = new Map(); // For reorg detection

  constructor(config: TransactionMonitorConfig) {
    this.config = {
      pollingIntervalMs: 2000,
      blockReorgDetection: true,
      reorgLookbackBlocks: 12,
      ...config,
    };
  }

  /**
   * Start monitoring a transaction
   */
  async monitor(
    transactionHash: string,
    initialLifecycle: TransactionLifecycle,
    onProgress?: TransactionProgressCallback
  ): Promise<TransactionLifecycle> {
    const monitored: MonitoredTransaction = {
      hash: transactionHash,
      lifecycle: {
        ...initialLifecycle,
        state: TransactionState.SUBMITTED,
      },
      callbacks: onProgress ? [onProgress] : [],
      pollCount: 0,
      createdAt: Date.now(),
    };

    this.monitoredTransactions.set(transactionHash, monitored);

    // Start polling for updates
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const updated = await this.pollTransaction(transactionHash);

          if (
            updated.state === TransactionState.FINALIZED ||
            updated.state === TransactionState.REVERTED ||
            updated.state === TransactionState.FAILED ||
            updated.state === TransactionState.DROPPED
          ) {
            // Terminal state reached
            clearInterval(interval);
            this.pollIntervals.delete(transactionHash);
            this.monitoredTransactions.delete(transactionHash);
            resolve(updated);
          }
        } catch (error) {
          clearInterval(interval);
          this.pollIntervals.delete(transactionHash);
          this.monitoredTransactions.delete(transactionHash);
          reject(error);
        }
      }, this.config.pollingIntervalMs);

      this.pollIntervals.set(transactionHash, interval);
    });
  }

  /**
   * Poll transaction status from RPC
   */
  private async pollTransaction(
    transactionHash: string
  ): Promise<TransactionLifecycle> {
    const monitored = this.monitoredTransactions.get(transactionHash);
    if (!monitored) {
      throw new Error(`Transaction ${transactionHash} not being monitored`);
    }

    monitored.pollCount++;
    const previousState = monitored.lifecycle.state;

    // Simulate RPC call - in production, use ethers.js or similar
    // This is a placeholder for actual RPC implementation
    const receipt = await this.fetchTransactionReceipt(transactionHash);
    const currentBlockNumber = await this.fetchCurrentBlockNumber();

    if (!receipt) {
      // Transaction not yet included
      // Check if it should be marked as dropped
      if (monitored.pollCount > 60) {
        // After ~2 minutes of polling with 2s interval
        monitored.lifecycle.state = TransactionState.DROPPED;
      }
      return monitored.lifecycle;
    }

    // Transaction has been included
    monitored.lifecycle.state = TransactionState.INCLUDED_IN_BLOCK;
    monitored.lifecycle.blockNumber = receipt.blockNumber;
    monitored.lifecycle.blockHash = receipt.blockHash;
    monitored.lifecycle.transactionIndex = receipt.transactionIndex;
    monitored.lifecycle.includedAt = Date.now();

    // Check for reorg
    if (this.config.blockReorgDetection) {
      await this.checkBlockReorg(receipt.blockNumber);
    }

    // Calculate confirmations
    const confirmations = currentBlockNumber - receipt.blockNumber;
    monitored.lifecycle.confirmations = confirmations;

    // Check if finalized
    if (confirmations >= this.config.confirmationThreshold) {
      monitored.lifecycle.state = TransactionState.FINALIZED;
      monitored.lifecycle.finalizedAt = Date.now();
    }

    // Check if reverted
    if (receipt.status === 0) {
      monitored.lifecycle.state = TransactionState.REVERTED;
      monitored.lifecycle.error = "Transaction reverted";
    }

    // Store gas information
    if (receipt.gasUsed) {
      monitored.lifecycle.gasUsed = receipt.gasUsed.toString();
    }

    if (previousState !== monitored.lifecycle.state) {
      // Emit callbacks
      for (const callback of monitored.callbacks) {
        try {
          await callback(monitored.lifecycle, previousState);
        } catch (error) {
          console.error("Error in transaction progress callback:", error);
        }
      }
    }

    return monitored.lifecycle;
  }

  /**
   * Detect block reorganization
   */
  private async checkBlockReorg(blockNumber: number): Promise<void> {
    // In production, implement actual reorg detection by checking block hashes
    // For now, this is a placeholder
    const blockHash = await this.fetchBlockHash(blockNumber);

    if (
      this.lastSeenBlocks.has(blockNumber) &&
      this.lastSeenBlocks.get(blockNumber) !== blockHash
    ) {
      // Reorg detected
      console.warn(
        `Block reorg detected at block ${blockNumber}: hash changed`
      );
      // Notify affected transactions
      for (const [, tx] of this.monitoredTransactions) {
        if (
          tx.lifecycle.blockNumber &&
          tx.lifecycle.blockNumber <= blockNumber
        ) {
          // Could be affected by reorg
          // In production, would need to verify transaction is still in block
        }
      }
    }

    this.lastSeenBlocks.set(blockNumber, blockHash);

    // Clean up old block hashes beyond lookback window
    const lookbackThreshold =
      blockNumber - (this.config.reorgLookbackBlocks || 12);
    for (const [bn] of this.lastSeenBlocks) {
      if (bn < lookbackThreshold) {
        this.lastSeenBlocks.delete(bn);
      }
    }
  }

  /**
   * Add a progress callback to existing transaction
   */
  addProgressCallback(
    transactionHash: string,
    callback: TransactionProgressCallback
  ): void {
    const monitored = this.monitoredTransactions.get(transactionHash);
    if (monitored) {
      monitored.callbacks.push(callback);
    }
  }

  /**
   * Get current state of monitored transaction
   */
  getTransactionState(transactionHash: string): TransactionLifecycle | null {
    const monitored = this.monitoredTransactions.get(transactionHash);
    return monitored ? monitored.lifecycle : null;
  }

  /**
   * Stop monitoring a transaction
   */
  stopMonitoring(transactionHash: string): void {
    const interval = this.pollIntervals.get(transactionHash);
    if (interval) {
      clearInterval(interval);
      this.pollIntervals.delete(transactionHash);
    }
    this.monitoredTransactions.delete(transactionHash);
  }

  /**
   * Stop all monitoring
   */
  stopAll(): void {
    for (const [hash] of this.monitoredTransactions) {
      this.stopMonitoring(hash);
    }
  }

  // =========================================================================
  // RPC Simulation Methods (Replace with actual ethers.js/web3.js calls)
  // =========================================================================

  private async fetchTransactionReceipt(
    _hash: string
  ): Promise<{
    blockNumber: number;
    blockHash: string;
    transactionIndex: number;
    status: number;
    gasUsed: string;
  } | null> {
    // Placeholder: In production, use ethers.getTransactionReceipt()
    // This would call: const provider = new ethers.JsonRpcProvider(this.config.providerUrl);
    // return provider.getTransactionReceipt(hash);
    return null;
  }

  private async fetchCurrentBlockNumber(): Promise<number> {
    // Placeholder: In production, use ethers.getBlockNumber()
    // This would call: const provider = new ethers.JsonRpcProvider(this.config.providerUrl);
    // return provider.getBlockNumber();
    return this.cachedBlockNumber;
  }

  private async fetchBlockHash(_blockNumber: number): Promise<string> {
    // Placeholder: In production, use ethers.getBlock()
    // This would call: const provider = new ethers.JsonRpcProvider(this.config.providerUrl);
    // const block = await provider.getBlock(blockNumber);
    // return block.hash;
    return `0x${"0".repeat(64)}`;
  }

  /**
   * Update cached block number (called externally or during polling)
   */
  setCachedBlockNumber(blockNumber: number): void {
    this.cachedBlockNumber = blockNumber;
  }
}
