# Web3 SDK Generation System - Architecture Summary

**Date:** January 14, 2026  
**Status:** Complete  
**Focus:** System design for generating blockchain SDKs

---

## System Overview

The Web3 SDK generation extension adds specialized code generation for blockchain (Web3) products, with emphasis on:

1. **Explicit transaction lifecycle tracking** - No hidden states
2. **Wallet connection as first-class** - Proper connection management
3. **Clear read vs write semantics** - Different operations, different contracts
4. **Separated concerns** - Each step independent and reversible
5. **Chain-aware operations** - Blockchain differences are explicit

---

## Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│         INPUT INGESTION LAYER                           │
│ (Smart Contract ABI Parser, OpenAPI Parser, etc.)       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│      CANONICALIZATION LAYER                             │
│ (ProductCanonicalSchema + Web3Config)                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│   PRODUCT CLASSIFICATION ENGINE                         │
│ (Detects Web3, selects Web3 design path)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────────┐
         │  SDK DESIGN LAYER         │
         │  (Creates design spec)    │
         └───────────┬───────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
    ┌─────────────┐        ┌──────────────┐
    │  Web2 Path  │        │  Web3 Path   │  ◄─── NEW
    │ (REST,gRPC) │        │(Blockchain) │
    └─────────────┘        └──────────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│      CODE GENERATION LAYER                              │
│ (Web3ClientBuilder, TransactionMonitor, etc.)          │
│ • Wallet management                                     │
│ • Transaction lifecycle tracking                        │
│ • Event subscriptions                                   │
│ • Chain switching                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│       GENERATED SDK CODE                                │
│ (TypeScript, Python, Go, etc.)                          │
└─────────────────────────────────────────────────────────┘
```

---

## New Schema Components

### 1. Web3Config Extension

```typescript
interface ProductCanonicalSchema {
  // ... existing fields ...
  
  // NEW: Web3-specific configuration
  web3?: Web3Config;
}

interface Web3Config {
  // Supported blockchains
  chains: Web3Chain[];
  
  // Confirmation requirements
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
  
  // Wallet integration
  walletIntegration: {
    injectedProviderName: string;
    supportedWallets: string[];
    autoConnect: boolean;
  };
  
  // Contract ABIs for code generation
  smartContracts?: SmartContractDefinition[];
  
  // Event subscription configuration
  events?: {
    subscriptionMethod: "websocket" | "polling" | "event_log";
    maxConcurrentSubscriptions: number;
  };
  
  // Multi-sig wallets
  multiSig?: {
    supported: boolean;
    requiredSignatures: number;
    maxSigners: number;
  };
}
```

### 2. Operation Types Extension

```typescript
interface CanonicalOperation {
  // ... existing fields ...
  
  // NEW Web3 fields:
  
  // For Web3: state-changing transaction
  isTransaction?: boolean;
  
  // For Web3: reads state from blockchain
  isRead?: boolean;
  
  // For Web3: required networks/chains
  supportedNetworks?: string[];
  
  // For Web3: gas estimation info
  gasEstimation?: GasEstimation;
}

interface GasEstimation {
  estimationAvailable: boolean;
  estimationMethod?: string;
  typicalGas?: string;
  gasIncludedInSign: boolean;
}
```

---

## Code Generation Types

### Web3SDKDesignPlan

```typescript
interface Web3SDKDesignPlan extends SDKDesignPlan {
  web3: {
    // Network configuration
    primaryChain: BlockchainNetwork;
    supportedChains: BlockchainNetwork[];
    
    // Wallet setup
    walletIntegration: {
      autoConnect: boolean;
      connectorOptions: WalletConnectorOption[];
    };
    
    // Confirmation strategy
    confirmationStrategy: ConfirmationStrategy;
    
    // Gas handling
    autoGasEstimation: boolean;
    userCustomizableGas: boolean;
    
    // Events
    eventSubscriptionMethod: "websocket" | "polling" | "graphql";
    
    // Smart contracts to generate bindings for
    contracts: ContractBindingConfig[];
    
    // Resilience
    resilience: {
      rpcFailoverEnabled: boolean;
      maxRpcRetries: number;
      blockReorgDetection: boolean;
    };
  };
}
```

---

## Generator Classes

### 1. Web3ClientBuilder

**Generates:** Main SDK client class

**Responsibilities:**
- Wallet connection management
- Read/write operation dispatch
- Gas estimation
- Transaction submission
- Event subscription management
- Chain switching

**Output:**
```typescript
class UniswapV4SDK {
  // Wallet management
  connectWallet(): Promise<WalletConnection>;
  getWalletState(): WalletConnection;
  disconnect(): Promise<void>;
  
  // Read operations
  balanceOf(): Promise<string>;
  allowance(): Promise<string>;
  
  // Write operations
  swap(): Promise<TransactionLifecycle>;
  approve(): Promise<TransactionLifecycle>;
  
  // Gas
  estimateGas(): Promise<GasEstimate>;
  
  // Confirmation
  waitForConfirmation(): Promise<TransactionLifecycle>;
  
  // Events
  onSwap(): Promise<string>;
  
  // Chain
  switchChain(): Promise<void>;
}
```

### 2. TransactionMonitorBuilder

**Generates:** Transaction lifecycle tracker

**Responsibilities:**
- Track transaction through all states
- Implement confirmation strategy
- Handle reorgs
- Track gas usage
- Generate lifecycle events

**States Tracked:**
```
PENDING_SUBMISSION
     ↓
SUBMITTED (in mempool)
     ↓
INCLUDED_IN_BLOCK
     ↓
FINALIZED
     
Plus: DROPPED, REVERTED, FAILED
```

### 3. WalletConnectionBuilder

**Generates:** Wallet connection manager

**Responsibilities:**
- Manage connection state machine
- Handle account changes
- Handle chain changes
- Generate connection events
- Validate chain compatibility

**States Tracked:**
```
DISCONNECTED
     ↓
CONNECTING
     ↓
CONNECTED
     
Plus: WRONG_CHAIN, CONNECTION_FAILED, etc.
```

### 4. EventSubscriptionBuilder

**Generates:** Event subscription manager

**Responsibilities:**
- Set up event filters
- Manage subscriptions
- Handle reorgs
- Generate subscription state events
- Batch event delivery if supported

**States Tracked:**
```
INACTIVE
     ↓
SUBSCRIBING
     ↓
ACTIVE
     
Plus: PAUSED, ENDED, RECONNECTING, FAILED
```

---

## Type System

### Transaction States

```typescript
enum TransactionState {
  PENDING_SUBMISSION,  // Prepared, not yet sent
  SUBMITTED,           // Sent to mempool
  INCLUDED_IN_BLOCK,   // In a block
  FINALIZED,           // Can't be reverted
  DROPPED,             // Removed from mempool
  REVERTED,            // Reverted during execution
  FAILED               // Other failure
}
```

### Wallet Connection States

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
```

### Subscription States

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
```

---

## SDK Components Generated

### 1. Main Client Class

```typescript
class UniswapV4SDK {
  // Properties for state management
  private walletConnection: WalletConnection;
  private transactionMonitor: TransactionMonitor;
  private eventSubscriptions: Map<string, SmartContractEventSubscription>;
  private provider: JsonRpcProvider;
  
  // Callbacks for state changes
  onChainChange: (chainId: string) => void;
  onWalletChange: (address: string | undefined) => void;
  
  // Methods for each operation
}
```

### 2. Configuration Object

```typescript
interface UniswapV4SDKConfig {
  chainId: string;
  rpcUrl: string;
  confirmationStrategy?: ConfirmationStrategy;
  autoGasEstimation?: boolean;
  userCustomizableGas?: boolean;
}
```

### 3. Type Definitions

- `WalletConnection` - Current wallet state
- `TransactionLifecycle` - Transaction through lifecycle
- `GasEstimate` - Gas cost with pricing options
- `BlockchainNetwork` - Chain configuration
- `SmartContractEventSubscription` - Event subscription state
- Web3-specific error types

### 4. Error Types

```typescript
enum Web3ErrorCode {
  // Wallet
  WALLET_NOT_CONNECTED,
  WALLET_CONNECTION_FAILED,
  
  // Chain
  WRONG_CHAIN,
  CHAIN_SWITCH_FAILED,
  
  // Signing
  SIGNING_REJECTED,
  SIGNING_FAILED,
  
  // Transactions
  INSUFFICIENT_FUNDS,
  INSUFFICIENT_GAS,
  TRANSACTION_REVERTED,
  TRANSACTION_DROPPED,
  
  // Gas
  GAS_ESTIMATION_FAILED,
  
  // Confirmation
  CONFIRMATION_TIMEOUT,
  BLOCK_REORG,
  
  // Events
  SUBSCRIPTION_FAILED,
  
  // Network
  NETWORK_ERROR,
}
```

---

## Design Decisions

### Decision 1: Explicit State Over Hidden States

**Why:** Blockchain transactions go through multiple states with different implications. Hiding these prevents developers from understanding what's happening.

**How:** Every important state is exposed as an enum value in a type that's part of the return value.

### Decision 2: Read vs Write Operations

**Why:** Read and write operations have fundamentally different semantics, costs, and guarantees.

**How:** Operations declare `operationType: "read" | "write"` and each has different generated code patterns.

### Decision 3: Separate Concerns

**Why:** Combining estimate, sign, and submit hides the ability to handle each failure independently.

**How:** Each step is a separate method that can fail and be retried independently.

### Decision 4: Wallet as First-Class

**Why:** Wallet management is central to Web3, not a detail.

**How:** Generated SDKs have explicit wallet connection management with clear state tracking.

### Decision 5: Chain-Aware

**Why:** Different chains have different characteristics (block time, finality, token).

**How:** Chain differences are explicit in operation parameters and confirmation strategies.

---

## Usage Flow Example

```typescript
// 1. Create SDK instance
const sdk = new UniswapV4SDK({
  chainId: 'ethereum-mainnet',
  rpcUrl: 'https://eth-mainnet.alchemyapi.io/v2/KEY'
});

// 2. Connect wallet (explicit)
const wallet = await sdk.connectWallet('metamask');
if (wallet.state !== WalletConnectionState.CONNECTED) {
  throw new Error('Failed to connect');
}

// 3. Estimate gas (get user approval)
const estimate = await sdk.estimateGas(tx);
console.log('Cost: $' + estimate.estimatedCostUsd);
if (!userApproves) return;

// 4. Execute (explicit)
const submitted = await sdk.submitTransaction(tx);
console.log('Hash:', submitted.hash);

// 5. Monitor (explicit states)
const included = await sdk.waitForConfirmation(submitted.hash, {
  strategy: 'block_confirmations',
  blockConfirmations: 1
});
console.log('In block:', included.blockNumber);

const finalized = await sdk.waitForConfirmation(submitted.hash, {
  strategy: 'block_confirmations',
  blockConfirmations: 12
});
console.log('Finalized, gas used:', finalized.gasUsed);

// 6. Subscribe to events
const subId = await sdk.onSwap((event) => {
  console.log('Swap event:', event);
});

// 7. Cleanup
sdk.unsubscribeFromEvents(subId);
await sdk.disconnect();
```

---

## Extension Points

### 1. Add New Chain Support

Add to `Web3Config.chains`:

```typescript
chains: [
  {
    id: 'ethereum-mainnet',
    name: 'Ethereum Mainnet',
    type: 'evm',
    blockTimeSeconds: 12,
    finalityBlocks: 64,
    // ...
  },
  {
    id: 'solana-mainnet',
    name: 'Solana Mainnet',
    type: 'solana',
    blockTimeSeconds: 0.4,
    finalityBlocks: 32,
    // ...
  }
]
```

### 2. Add New Operation Type

Extend `CanonicalOperation`:

```typescript
interface CanonicalOperation {
  // ...existing fields...
  
  // Add new field for new operation type
  isBridgeOperation?: boolean;
  bridgeTargetChain?: string;
}
```

Then create new generator if needed.

### 3. Add New Wallet Type

Extend `WalletIntegrationConfig`:

```typescript
connectorOptions: [
  { walletType: 'metamask', displayName: 'MetaMask' },
  { walletType: 'walletconnect', displayName: 'WalletConnect' },
  { walletType: 'coinbase_smart_wallet', displayName: 'Coinbase Smart Wallet' } // NEW
]
```

---

## Error Recovery Paths

Each error type has a recovery strategy:

| Error | Recovery |
|-------|----------|
| `WALLET_NOT_CONNECTED` | Call `connectWallet()` |
| `WRONG_CHAIN` | Call `switchChain()` |
| `INSUFFICIENT_FUNDS` | Bridge or deposit more funds |
| `GAS_PRICE_TOO_LOW` | Re-estimate with higher gas |
| `TRANSACTION_REVERTED` | Review parameters, retry |
| `CONFIRMATION_TIMEOUT` | Check explorer, retry with higher confirmations |
| `SUBSCRIPTION_FAILED` | Unsubscribe and try again |

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `WEB3_SCHEMA_EXTENSIONS.ts` | 880 | Extended canonical schema types |
| `src/code-generation/types.ts` | +250 | Web3 design plan types |
| `src/code-generation/web3-generators.ts` | 650 | Code generator classes |
| `WEB3_SDK_USAGE_PATTERNS.ts` | 580 | 8 usage patterns with examples |
| `EXAMPLE_UNISWAP_V4_SDK.ts` | 950 | Complete example SDK |
| `WEB3_SDK_GENERATION_GUIDE.md` | 650 | Comprehensive user guide |

**Total:** ~3,960 lines of code and documentation

---

## Key Principles Implemented

✅ **Respect blockchain async semantics** - States are explicit, not hidden

✅ **Avoid hiding important transaction states** - Every state is exposed and tracked

✅ **Provide clean mental model** - Developers understand complete flow

✅ **Separation of concerns** - Each step independent and reversible

✅ **Explicit wallet management** - Connection is first-class

✅ **Clear read vs write** - Different operations, different contracts

✅ **Chain-aware operations** - Blockchain differences explicit

✅ **Correct error recovery** - Each error suggests recovery path

✅ **Focus on correctness** - Better to be verbose than to hide critical information

---

## Next Steps

To use this system:

1. **Provide Web3Config** in product specification (chains, contracts, confirmation strategy)
2. **Run canonicalization** to create `ProductCanonicalSchema` with Web3Config
3. **Classify as Web3** in product classifier
4. **Run Web3 design plan** generator
5. **Generate code** using Web3 generators
6. **Output SDKs** in target language (TypeScript, Python, Go, etc.)

All while maintaining deterministic, reproducible, auditable code generation with LLM assistance only where it adds value (naming, documentation, examples).
