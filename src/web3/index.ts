/**
 * WEB3 MODULE EXPORTS
 * 
 * Core Web3 SDK functionality for blockchain operations
 */

// Core client
export { Web3Client, WalletState } from "./client";
export type {
  WalletConnection,
  TransactionRequest,
  SubmitTransactionOptions,
  ConnectWalletOptions,
  Web3ClientConfig,
} from "./client";

// Transaction monitoring
export { TransactionMonitor } from "./transaction-monitor";
export type {
  TransactionMonitorConfig,
  TransactionProgressCallback,
} from "./transaction-monitor";

// Event subscriptions
export { EventSubscriptionManager, SubscriptionState } from "./event-subscriptions";
export type {
  EventFilter,
  SmartContractEvent,
  EventSubscription,
  EventCallback,
  SubscriptionStrategy,
} from "./event-subscriptions";

// Type safety utilities
export {
  address,
  chainId,
  txHash,
  validateTransactionOptions,
  CHAIN_IDS,
} from "./typing";
export type {
  Address,
  ChainId,
  TxHash,
  Amount,
  ContractABI,
  TransactionOptions,
} from "./typing";
