# Web3 SDK Generation System - Comprehensive Guide

**Date:** January 14, 2026  
**Status:** Complete Design & Examples  
**Audience:** SDK architects, code generation engineers

---

## Executive Summary

This document describes the Web3-specific extensions to the SDK generation system. The system generates production-grade blockchain SDKs that:

- **Respect blockchain async semantics** - Every important state is exposed
- **Separate concerns explicitly** - Read vs write, estimate vs execute, prepare vs sign
- **Prevent hidden failures** - No silent state changes, clear error recovery paths
- **Prioritize correctness over convenience** - Developer control over wallet, transactions, confirmations

**Key Philosophy:** Focus on correctness. Blockchain operations have real costs and irreversible consequences. The SDK must make every step explicit and reversible where possible.

---

## 1. Core Design Principles for Web3 SDKs

### 1.1 Explicit State Tracking

**Problem:** Web2 APIs often hide async state. Web3 operations involve multiple critical states (pending, submitted, included, finalized) that affect user experience and risk.

**Solution:** Every important state is exposed as an enum, tracked through the lifecycle:

```typescript
// Transaction states are EXPLICIT
enum TransactionState {
  PENDING_SUBMISSION,    // Prepared, not sent
  SUBMITTED,             // In mempool
  INCLUDED_IN_BLOCK,     // In a block
  FINALIZED,             // Can't be reverted
  DROPPED,               // Removed from mempool
  REVERTED,              // Reverted during execution
  FAILED                 // Other failure
}

interface TransactionLifecycle {
  state: TransactionState;
  hash?: string;         // Only after SUBMITTED
  blockNumber?: number;  // Only after INCLUDED_IN_BLOCK
  confirmations: number; // Updated as confirmed
  gasUsed?: string;      // Only after execution
  error?: string;        // If failed/reverted
}
```

Developers always know where their transaction is and can react appropriately.

### 1.2 Read vs Write Operations

**Problem:** Blockchain has fundamentally different operation types with different semantics, costs, and guarantees.

**Solution:** Operations declare their type explicitly:

```typescript
interface Web3ReadOperation {
  operationType: "read";
  
  // Reads don't cost gas
  // Return immediately or with simple polling
  // Can be retried safely
  isSafeForBatching: boolean;
  idempotent: boolean;
  expectedLatencyMs: number;
}

interface Web3WriteOperation {
  operationType: "write";
  
  // Writes change state
  // Require signer and gas
  // Multi-step: estimate -> sign -> submit -> confirm
  stateVariablesAffected: string[];
  gasEstimationAvailable: boolean;
  confirmationStrategy: ConfirmationStrategy;
  expectedFinalityMs: number;
}
```

Example API usage:

```typescript
// READ: Query, immediate result
const balance = await sdk.token.balanceOf(account);

// WRITE: Multi-step with explicit states
const estimate = await sdk.token.estimateGas(params);  // User approves cost
const lifecycle = await sdk.token.transfer(params);    // Signed and submitted
const confirmed = await sdk.waitForConfirmation(lifecycle.hash); // Wait
```

### 1.3 Separation of Concerns

**Problem:** Conflating separate concerns (estimate vs execute, prepare vs sign, sign vs submit) hides complexity and prevents developer control.

**Solution:** Each step is a separate method:

```typescript
// Step 1: ESTIMATE (no commitment)
const estimate = await sdk.estimateGas({
  to: contractAddress,
  data: functionCall,
  value: amountWei
});
// User reviews and approves cost
if (!userApproves(estimate.estimatedCostUsd)) return;

// Step 2: PREPARE (create unsigned transaction)
const prepared = await sdk.prepareTransaction({
  to: contractAddress,
  data: functionCall,
  gasLimit: estimate.gasUnits,
  gasPrice: estimate.gasPrice
});

// Step 3: REQUEST SIGNATURE (show to user, wait for approval)
const signingRequest = await sdk.requestSignature(prepared);
if (signingRequest.state === 'rejected') {
  console.log('User rejected');
  return;
}

// Step 4: SUBMIT (send to network)
const submitted = await sdk.submitSigned(signingRequest);
console.log('In mempool:', submitted.hash);

// Step 5: WAIT FOR CONFIRMATION (use explicit strategy)
const confirmed = await sdk.waitForConfirmation(submitted.hash, {
  strategy: 'block_confirmations',
  blockConfirmations: 12,
  timeoutMs: 300000
});
```

Each step can fail independently and be handled separately. Developers have full control.

### 1.4 Wallet Connection as First-Class

**Problem:** Wallet management is often bolted on, causing hidden failures and unclear state.

**Solution:** Wallet is managed explicitly with clear states:

```typescript
enum WalletConnectionState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  CONNECTION_LOST,
  CONNECTION_FAILED,
  WRONG_CHAIN,
  ACCOUNT_CHANGED
}

interface WalletConnection {
  state: WalletConnectionState;
  address?: string;
  chainId?: string;
  accounts?: string[];
  connectedAt?: number;
}

// Before any operation:
if (sdk.wallet.getState().state !== WalletConnectionState.CONNECTED) {
  await sdk.wallet.connect();
}

// Operations that need wallet check it:
async function executeTransaction() {
  const wallet = sdk.wallet.getState();
  if (wallet.state !== WalletConnectionState.CONNECTED) {
    throw new Error(`Wallet not ready: ${wallet.state}`);
  }
  // Continue
}
```

---

## 2. Schema Extensions

### 2.1 Web3Config Extension

Added to `ProductCanonicalSchema`:

```typescript
interface Web3Config {
  // Supported chains
  chains: Web3Chain[];

  // What "confirmation" means per chain
  transactionConfirmation: {
    blockConfirmations: number;
    timeoutMs: number;
  };

  // Gas settings
  gas: {
    estimationAvailable: boolean;
    presetGasPrices?: Record<string, string>;
    customGasPrice: boolean;
  };

  // Wallet connection
  walletIntegration: {
    injectedProviderName: string;
    supportedWallets: string[];
    autoConnect: boolean;
  };

  // Token standards (ERC20, ERC721, SPL, etc.)
  tokenStandards?: string[];

  // Smart contract ABIs to generate bindings
  smartContracts?: SmartContractDefinition[];

  // Event subscription method
  events?: {
    subscriptionMethod: "websocket" | "polling" | "event_log";
    maxConcurrentSubscriptions: number;
  };

  // Multi-sig support
  multiSig?: {
    supported: boolean;
    requiredSignatures: number;
  };
}
```

### 2.2 Transaction Lifecycle Types

```typescript
// Explicit states (no hidden intermediate states)
enum TransactionState {
  PENDING_SUBMISSION,  // Prepared, not sent
  SUBMITTED,           // In mempool
  INCLUDED_IN_BLOCK,   // In a block
  FINALIZED,           // Can't be reverted
  DROPPED,             // Removed from mempool
  REVERTED,            // Execution failed
  FAILED               // Other failure
}

// Complete transaction information
interface TransactionLifecycle {
  state: TransactionState;
  hash?: string;
  blockNumber?: number;
  blockHash?: string;
  nonce: number;
  confirmations: number;
  gasUsed?: string;
  gasPrice?: string;
  transactionFee?: string;
  createdAt: number;
  submittedAt?: number;
  includedAt?: number;
  finalizedAt?: number;
  error?: string;
  revertReason?: string;
  receipt?: any;
}
```

### 2.3 Gas Estimation

```typescript
interface GasEstimate {
  // Estimated gas units and price
  gasUnits: string;
  gasPrice: string;

  // Multiple pricing options
  gasPricePresets?: Record<string, {
    speed: "slow" | "standard" | "fast";
    gasPrice: string;
    estimatedTimeSeconds: number;
    estimatedCostInNativeToken: string;
    estimatedCostUsd?: string;
  }>;

  // Max total cost
  maxTotalCostNativeToken: string;
  estimatedCostUsd?: string;

  // When this estimate expires
  isStale: boolean;
  generatedAt: number;
  validForMs: number; // How long valid
}
```

### 2.4 Wallet Connection

```typescript
enum WalletConnectionState {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  CONNECTION_LOST,
  CONNECTION_FAILED,
  WRONG_CHAIN,
  ACCOUNT_CHANGED
}

interface WalletConnection {
  state: WalletConnectionState;
  address?: string;
  chainId?: string;
  accounts?: string[];
  connectedAt?: number;
  lastActivityAt?: number;
}
```

### 2.5 Event Subscriptions

```typescript
enum SubscriptionState {
  INACTIVE,
  SUBSCRIBING,
  ACTIVE,
  PAUSED,
  ENDED,
  FAILED,
  RECONNECTING
}

interface SmartContractEventSubscription {
  subscriptionId: string;
  eventName: string;
  contractAddress: string;
  state: SubscriptionState;
  subscribedAt: number;
  lastEventAt?: number;
  eventCount: number;
  error?: { code: string; message: string };
}

interface BlockchainEventEmission {
  id: string;
  name: string;
  contractAddress: string;
  data: Record<string, any>;
  blockNumber: number;
  transactionHash: string;
  confirmations: number;
  isFinalized: boolean;
  wasReverted: boolean; // If reorg happened
}
```

---

## 3. Generated SDK Components

### 3.1 Web3 Client Class

```typescript
class UniswapV4SDK {
  // Wallet management
  async connectWallet(options?: ConnectOptions): Promise<WalletConnection>;
  getWalletState(): WalletConnection;
  async disconnect(): Promise<void>;

  // READ operations (view functions, queries)
  async balanceOf(token: string, account: string): Promise<string>;
  async allowance(token: string, owner: string, spender: string): Promise<string>;
  async quoteSwap(params: SwapQuoteParams): Promise<string>;

  // WRITE operations (state-changing)
  async swap(params: SwapParams): Promise<TransactionLifecycle>;
  async approve(token: string, spender: string, amount: string): Promise<TransactionLifecycle>;

  // Gas management
  async estimateGas(tx: TransactionRequest): Promise<GasEstimate>;

  // Confirmation tracking
  async waitForConfirmation(hash: string, strategy?: ConfirmationStrategy): Promise<TransactionLifecycle>;

  // Event subscriptions
  async onSwap(handler: (event: SwapEvent) => void): Promise<string>;
  unsubscribeFromEvents(subscriptionId: string): void;

  // Chain management
  async switchChain(chainId: string): Promise<void>;
  getSupportedNetworks(): BlockchainNetwork[];
  getNetwork(chainId: string): BlockchainNetwork | undefined;
}
```

### 3.2 Transaction Monitor

Tracks transactions through complete lifecycle:

```typescript
class TransactionMonitor {
  // Monitor from submission to finalization
  async monitorTransaction(
    lifecycle: TransactionLifecycle,
    strategy: ConfirmationStrategy
  ): Promise<TransactionLifecycle>;

  // Wait with explicit confirmation strategy
  async waitForConfirmation(
    hash: string,
    strategy: ConfirmationStrategy
  ): Promise<TransactionLifecycle>;

  // Get current state
  getTransaction(hash: string): TransactionLifecycle | undefined;
}
```

### 3.3 Wallet Connector

Manages wallet connection lifecycle:

```typescript
class WalletConnector {
  async connect(options?: ConnectOptions): Promise<WalletConnection>;
  getState(): WalletConnection;
  async disconnect(): Promise<void>;

  // Event callbacks
  onConnect: (connection: WalletConnection) => void;
  onDisconnect: () => void;
  onAccountChange: (address: string) => void;
  onChainChange: (chainId: string) => void;
}
```

### 3.4 Event Subscription Manager

Manages event subscriptions with state tracking:

```typescript
class EventSubscriptionManager {
  async subscribe(filter: EventFilter): Promise<string>;
  unsubscribe(subscriptionId: string): void;
  getSubscription(subscriptionId: string): SmartContractEventSubscription | undefined;

  // Events
  onEvent: (event: BlockchainEventEmission) => void;
  onSubscriptionStateChange: (subscriptionId: string, newState: SubscriptionState) => void;
}
```

---

## 4. Code Generation Pipeline for Web3

### 4.1 Design Plan Extension

```typescript
interface Web3SDKDesignPlan extends SDKDesignPlan {
  web3: {
    primaryChain: BlockchainNetwork;
    supportedChains: BlockchainNetwork[];
    
    walletIntegration: {
      autoConnect: boolean;
      connectorOptions: { walletType: string; displayName: string }[];
    };
    
    confirmationStrategy: ConfirmationStrategy;
    autoGasEstimation: boolean;
    userCustomizableGas: boolean;
    eventSubscriptionMethod: "websocket" | "polling";
    exposeLowLevelProvider: boolean;
    
    contracts: {
      name: string;
      abi: string;
      address?: Record<string, string>;
    }[];
    
    resilience: {
      rpcFailoverEnabled: boolean;
      maxRpcRetries: number;
      blockReorgDetection: boolean;
    };
  };
}
```

### 4.2 Generator Classes

**Web3ClientBuilder** - Generates main SDK client:

```typescript
Web3ClientBuilder.build(plan: Web3SDKDesignPlan): ASTClassDeclaration
// Generates:
// - Constructor with wallet initialization
// - Wallet management methods
// - Read/write operation methods  
// - Event subscription setup
// - Chain switching
```

**TransactionMonitorBuilder** - Generates transaction tracking:

```typescript
TransactionMonitorBuilder.build(): ASTClassDeclaration
// Generates:
// - Transaction lifecycle tracking
// - Confirmation waiting with strategies
// - Reorg detection
// - Gas tracking
```

**WalletConnectionBuilder** - Generates wallet management:

```typescript
WalletConnectionBuilder.build(): ASTClassDeclaration
// Generates:
// - Wallet connection lifecycle
// - Account change handling
// - Chain change handling
// - Connection state events
```

**EventSubscriptionBuilder** - Generates event management:

```typescript
EventSubscriptionBuilder.build(): ASTClassDeclaration
// Generates:
// - Event filter setup
// - Subscription state tracking
// - Event emission
// - Reorg handling
```

---

## 5. SDK Usage Patterns

### Pattern 1: Wallet Connection with State Tracking

```typescript
async function setupWallet() {
  const connection = await sdk.connectWallet('metamask');
  
  if (connection.state === WalletConnectionState.CONNECTED) {
    console.log('Ready to use');
  } else if (connection.state === WalletConnectionState.WRONG_CHAIN) {
    console.log('Switch to correct chain first');
  } else {
    console.log('Connection failed:', connection.state);
  }
}
```

### Pattern 2: Clear Read vs Write

```typescript
// READ: Fast, no gas
const balance = await sdk.token.balanceOf(account);

// WRITE: Multi-step with explicit states
const estimate = await sdk.token.estimateGas(params);
const lifecycle = await sdk.token.transfer(params);
const confirmed = await sdk.waitForConfirmation(lifecycle.hash);
```

### Pattern 3: Gas Estimation Separation

```typescript
// Estimate without commitment
const estimate = await sdk.estimateGas(tx);
console.log('Cost:', estimate.estimatedCostUsd);

// User reviews and approves
if (!userApproves(estimate)) return;

// Then execute
const lifecycle = await sdk.submitTransaction(tx, {
  gasPrice: estimate.gasPricePresets.standard.gasPrice
});
```

### Pattern 4: Explicit Transaction Lifecycle

```typescript
const tx = await sdk.submitTransaction(params);

if (tx.state === TransactionState.SUBMITTED) {
  console.log('In mempool:', tx.hash);
}

const included = await sdk.waitForConfirmation(tx.hash, {
  blockConfirmations: 1
});

if (included.state === TransactionState.INCLUDED_IN_BLOCK) {
  console.log('In block:', included.blockNumber);
}

const finalized = await sdk.waitForConfirmation(tx.hash, {
  blockConfirmations: 12
});

if (finalized.state === TransactionState.FINALIZED) {
  console.log('Finalized, gas used:', finalized.gasUsed);
}
```

### Pattern 5: Event Subscriptions with Lifecycle

```typescript
const subId = await sdk.events.subscribe(filter, (event) => {
  console.log('Event:', event);
  console.log('Confirmations:', event.confirmations);
  console.log('Finalized:', event.isFinalized);
});

// Monitor subscription
sdk.events.onSubscriptionStateChange((id, state) => {
  if (state === SubscriptionState.RECONNECTING) {
    console.warn('Reconnecting...');
  }
});

// Cleanup
sdk.events.unsubscribe(subId);
```

### Pattern 6: Chain Switching

```typescript
// Validate chain compatibility
if (!sdk.isOperationSupportedOnChain('swap', 'arbitrum')) {
  console.log('Operation not supported on this chain');
  return;
}

// Switch explicitly
await sdk.switchChain('arbitrum');

// Verify
if (sdk.wallet.getState().chainId === 'arbitrum') {
  console.log('Ready to execute on Arbitrum');
}
```

### Pattern 7: Error Handling

```typescript
async function executeWithErrorHandling(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      console.error('Balance:', await sdk.getBalance());
    } else if (error.code === 'WRONG_CHAIN') {
      await sdk.switchChain(error.requiredChainId);
      return executeWithErrorHandling(operation); // Retry
    } else if (error.code === 'TRANSACTION_REVERTED') {
      console.error('Revert reason:', error.revertReason);
    }
    throw error;
  }
}
```

---

## 6. Error Handling

### Web3-Specific Error Types

```typescript
enum Web3ErrorCode {
  // Wallet errors
  WALLET_NOT_CONNECTED,
  WALLET_CONNECTION_FAILED,
  WRONG_CHAIN,
  CHAIN_SWITCH_FAILED,

  // Signing errors
  SIGNING_REJECTED,
  SIGNING_FAILED,
  SIGNING_TIMEOUT,

  // Transaction errors
  INSUFFICIENT_FUNDS,
  INSUFFICIENT_GAS,
  TRANSACTION_FAILED,
  TRANSACTION_REVERTED,
  NONCE_CONFLICT,
  TRANSACTION_DROPPED,

  // Gas errors
  GAS_ESTIMATION_FAILED,
  GAS_PRICE_TOO_LOW,

  // Confirmation errors
  CONFIRMATION_TIMEOUT,
  BLOCK_REORG,

  // Event subscription errors
  SUBSCRIPTION_FAILED,
  SUBSCRIPTION_TIMEOUT,

  // Network errors
  NETWORK_ERROR,
  RPC_ENDPOINT_FAILED,
}
```

Each error includes recovery suggestions and next steps.

---

## 7. Key Files Created

| File | Purpose |
|------|---------|
| `WEB3_SCHEMA_EXTENSIONS.ts` | Extended canonical schema for Web3 |
| `src/code-generation/types.ts` | Web3 design plan and configuration types |
| `src/code-generation/web3-generators.ts` | Generator classes for Web3 components |
| `WEB3_SDK_USAGE_PATTERNS.ts` | Best practices and usage examples |
| `EXAMPLE_UNISWAP_V4_SDK.ts` | Complete example generated SDK |

---

## 8. Design Principles Summary

### ✓ Respect Blockchain Semantics

Different chains have different block times, finality requirements, and guarantees. SDKs make these explicit rather than abstract them away.

### ✓ Expose Transaction Lifecycle

Developers need to know transaction state at every step. No silent failures or hidden state changes.

### ✓ Separate Read from Write

Read operations (views) and write operations (transactions) have fundamentally different contracts. Treat them distinctly.

### ✓ Separate Concerns

Each step (estimate, prepare, sign, submit, confirm) can fail independently. Provide separate methods for each.

### ✓ Explicit Wallet Management

Wallet connection is not a detail - it's central to the SDK. Manage it explicitly with clear states.

### ✓ Clear Error Recovery

Every error includes information about why it occurred and what developers can do to recover.

### ✓ No Hidden Costs

Gas costs are estimated before submission. Developers approve costs before committing.

### ✓ Chain-Aware

Multi-chain SDKs make chain requirements explicit. Chain switching is validated and deliberate.

---

## 9. Comparison: Before vs After

### Before (Web2-style, problematic for Web3)

```typescript
// Hides complexity
const result = await sdk.swap({ tokenIn, tokenOut, amount });
// What happened? Hash? Block number? Reverted? Unknown!
```

### After (Web3-aware, explicit and clear)

```typescript
// Step 1: Connect wallet (explicit)
const wallet = await sdk.connectWallet();
if (wallet.state !== WalletConnectionState.CONNECTED) {
  console.error('Connection failed:', wallet.state);
  return;
}

// Step 2: Estimate gas (user approval)
const estimate = await sdk.estimateGas(tx);
console.log('Cost:', estimate.estimatedCostUsd);
if (!userApproves(estimate)) return;

// Step 3: Submit (explicit submission)
const submitted = await sdk.submitTransaction(tx);
console.log('Hash:', submitted.hash);

// Step 4: Wait for states
let current = submitted;
while (current.state !== TransactionState.FINALIZED) {
  current = await sdk.waitForConfirmation(submitted.hash);
  console.log('State:', current.state);
  console.log('Confirmations:', current.confirmations);
  
  if (current.state === TransactionState.REVERTED) {
    console.error('Reverted:', current.revertReason);
    break;
  }
  
  await new Promise(r => setTimeout(r, 2000));
}

console.log('Final gas used:', current.gasUsed);
console.log('Fee:', current.transactionFee);
```

The second approach is longer but every step is explicit, every failure is catchable, and developer has full control.

---

## 10. Future Extensions

Potential areas for future enhancement:

- **Multi-sig support** - Coordinating signatures from multiple parties
- **Account abstraction** - ERC-4337 accounts and bundlers
- **Batch operations** - Multiple calls in single transaction where supported
- **Flashloan operations** - Atomic operations with temporary liquidity
- **Cross-chain operations** - Bridging and multi-chain transactions
- **ZK proofs** - Integration with privacy-preserving operations
- **Intent-based architecture** - Higher-level operation specifications

All while maintaining the core principles of explicit state tracking and developer control.

---

## Conclusion

Web3 SDKs generated by this system prioritize correctness and clarity over convenience. Every important state is exposed, every operation is explicit about its effects, and every error includes recovery guidance.

The result is SDKs that developers can understand completely, trust fully, and control precisely - essential for applications dealing with real value and irreversible state changes.
