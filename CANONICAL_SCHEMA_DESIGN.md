# Canonical SDK Schema - Design & Examples

## Overview

The Canonical SDK Schema is the **single source of truth** for any SDK. It bridges Web2 APIs and Web3 protocols into a unified, language-agnostic representation that:

1. **Prevents hallucination** by making all SDK concepts explicit
2. **Enables deterministic code generation** – no interpretation needed
3. **Unifies Web2 and Web3** without forcing either into an inappropriate mold
4. **Drives documentation, tests, and examples** with data instead of prose

**Key principle:** If it affects the generated SDK's behavior, it's in this schema. Nothing is implicit.

---

## Schema Architecture Explained

### 1. **ProductMetadata** – Who and What

Identifies the product and establishes context for all downstream decisions.

```typescript
name: "stripe"           // SDK identifier
version: "1.0.0"         // SDK version
apiVersion: "2024-01"    // API version being wrapped
classification: {
  type: "web2",
  protocol: "rest",
  complexity: "moderate"
}
```

**Why it matters:** Code generators need to know what product they're generating for (affects naming, examples, documentation tone).

---

### 2. **Types** – The Data Model

All possible data structures that flow through the SDK. Language-agnostic, but precise enough for code generation.

**Key design decisions:**

- **Explicit categories** (`object | enum | union | primitive | array | map`) enable language-specific generators to make correct choices
- **Validation embedded** in types (`FieldValidation`) so generated SDKs validate input without LLM guessing
- **Examples at every level** enable generated docs and tests to be realistic
- **Deprecation tracking** for backward-compat code generation

```typescript
types: {
  "User": {
    name: "User",
    category: "object",
    fields: {
      "id": {
        type: "string",
        required: true,
        validation: { pattern: "^[0-9]+$" }
      }
    }
  }
}
```

---

### 3. **Operations** – The API Surface

Every operation (REST endpoint, GraphQL query, smart contract function, webhook) is modeled with:

- **Identity**: `id`, `name`, `description`
- **Input contract**: `parameters` with types, validation, location
- **Output contract**: `responseType`
- **Behavior**: `async`, `pagination`, `rateLimit`, `retry`
- **Error contract**: `errorCodes` that can be thrown
- **Auth contract**: What auth is needed
- **Web2 specifics**: `httpMethod`, `path`
- **Web3 specifics**: `isTransaction`, `gasEstimation`, `supportedNetworks`

**Why each field matters:**

| Field | Prevents Hallucination | Enables |
|-------|------------------------|---------|
| `parameters.location` | Guessing where param goes (URL, query, body) | Correct code generation |
| `responseType` | Uncertain return types | Type-safe clients |
| `errorCodes` | Inventing error scenarios | Complete error handling |
| `async.model` | Guessing async pattern | Correct Promise/callback usage |
| `pagination.strategy` | Wrong pagination pattern | Correct batch/cursor logic |
| `auth.type` | Wrong auth impl | Secure credential handling |

---

### 4. **Errors** – The Failure Contract

Not just HTTP codes. Each error is:

- Categorized (client_error, server_error, rate_limit, etc.)
- Retryable or not
- Has recovery suggestions
- Linked to operations that throw it

```typescript
errors: [{
  code: "INSUFFICIENT_FUNDS",
  httpStatus: 402,
  category: "business_logic",
  retryable: false,
  recoveryAction: "Add funds to your account before retrying",
  message: "Account has insufficient funds for this transaction"
}]
```

Generated SDKs will create error classes for each code, with proper retry logic built in.

---

### 5. **Auth** – The Security Contract

Explicit auth model prevents generated SDKs from guessing:

```typescript
auth: {
  type: "oauth2",
  required: true,
  oauth: {
    authorizeUrl: "https://...",
    tokenUrl: "https://...",
    scopes: { "user.read": "Read user data" }
  }
}
```

Each operation can also override with specific requirements:

```typescript
operation.auth: {
  required: false,
  type: "api_key",
  apiKeyName: "X-API-Key"
}
```

---

### 6. **Networks** – Environments & Chains

Unifies Web2 environments with Web3 networks:

```typescript
networks: [
  {
    id: "mainnet",
    name: "Production",
    environment: "production",
    endpoint: "https://api.stripe.com"
  },
  {
    id: "ethereum-mainnet",
    name: "Ethereum Mainnet",
    environment: "production",
    chainId: "1",
    endpoint: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io"
  }
]
```

**Web2:** Endpoint is API base URL  
**Web3:** Endpoint is RPC URL, `chainId` identifies the network

---

### 7. **Web3Config** – Blockchain Specifics

When classification is "web3" or "hybrid", this section defines:

- **Supported chains** with RPC endpoints, block times, finality
- **Smart contracts** with ABIs and their exposed functions
- **Gas estimation** capabilities
- **Wallet integration** (injected provider, auto-connect)
- **Events** (smart contract events, subscriptions)
- **Multi-sig** support

```typescript
web3Config: {
  chains: [{
    id: "ethereum",
    type: "evm",
    nativeToken: "ETH",
    rpcEndpoints: ["https://..."],
    blockTimeSeconds: 12,
    finalityBlocks: 15
  }],
  smartContracts: [{
    name: "UniswapV3Router",
    addresses: { "1": "0x..." },
    abi: "{...}",
    functions: {
      "exactInputSingle": { /* CanonicalOperation */ }
    }
  }]
}
```

---

### 8. **Conventions** – SDK Behavior Defaults

Tells code generators how the SDK should *feel*:

```typescript
conventions: {
  methodNaming: "camelCase",
  errorNaming: "PascalCase",
  autoRetry: true,
  responseWrapper: {
    type: "envelope",
    dataField: "data",
    errorField: "error"
  },
  clientConstructor: "class"
}
```

**Why:** Generated SDKs should feel hand-crafted. These conventions make them idiomatic in their target language.

---

### 9. **DocumentationMetadata** – Generating Docs

Drives automatic generation of:

- README files
- Tutorial content
- Example code
- FAQ sections
- Glossary

```typescript
documentation: {
  docsBaseUrl: "https://docs.stripe.com",
  exampleLanguages: ["typescript", "python", "go"],
  tutorials: [
    "Getting started",
    "Authentication",
    "Handling errors",
    "Pagination"
  ]
}
```

---

## Example 1: Stripe REST API (Web2)

```typescript
const stripeSchema: ProductCanonicalSchema = {
  product: {
    name: "stripe",
    version: "1.0.0",
    apiVersion: "2024-01-01",
    description: "Payment processing platform",
    tags: ["payments", "web2", "rest"],
    license: "MIT"
  },

  classification: {
    type: "web2",
    protocol: "rest",
    complexity: "complex",
    domain: "payments",
    multiNetwork: false
  },

  types: {
    "Charge": {
      name: "Charge",
      category: "object",
      description: "A charge represents a successful transaction",
      fields: {
        "id": {
          name: "id",
          type: "string",
          description: "Unique charge identifier",
          required: true,
          nullable: false,
          example: "ch_1234567890"
        },
        "amount": {
          name: "amount",
          type: "number",
          description: "Amount in cents",
          required: true,
          nullable: false,
          validation: { minValue: 1, maxValue: 99999999 },
          example: 5000
        },
        "currency": {
          name: "currency",
          type: "string",
          description: "ISO 4217 currency code",
          required: true,
          nullable: false,
          validation: { pattern: "^[a-z]{3}$" },
          example: "usd"
        },
        "status": {
          name: "status",
          type: "ChargeStatus",
          description: "Current charge status",
          required: true,
          nullable: false
        },
        "customer": {
          name: "customer",
          type: "string",
          description: "Associated customer ID",
          required: false,
          nullable: true,
          example: "cus_9s6XWviEHE2Zqq"
        },
        "metadata": {
          name: "metadata",
          type: "Metadata",
          description: "Custom key-value data",
          required: false,
          nullable: true
        }
      }
    },

    "ChargeStatus": {
      name: "ChargeStatus",
      category: "enum",
      description: "Charge status enumeration",
      enumValues: ["succeeded", "failed", "pending"],
      nullable: false
    },

    "Metadata": {
      name: "Metadata",
      category: "map",
      description: "Custom metadata object",
      valueType: "string",
      nullable: false
    },

    "CreateChargeRequest": {
      name: "CreateChargeRequest",
      category: "object",
      description: "Request to create a charge",
      fields: {
        "amount": {
          name: "amount",
          type: "number",
          description: "Amount in cents",
          required: true,
          nullable: false,
          validation: { minValue: 1 }
        },
        "currency": {
          name: "currency",
          type: "string",
          description: "ISO 4217 currency code",
          required: true,
          nullable: false,
          validation: { pattern: "^[a-z]{3}$" }
        },
        "source": {
          name: "source",
          type: "string",
          description: "Token or card ID",
          required: true,
          nullable: false
        },
        "description": {
          name: "description",
          type: "string",
          description: "Optional charge description",
          required: false,
          nullable: true,
          validation: { maxLength: 1000 }
        }
      }
    },

    "ChargeList": {
      name: "ChargeList",
      category: "object",
      description: "Paginated list of charges",
      fields: {
        "data": {
          name: "data",
          type: "Charge",
          description: "List of charges",
          required: true,
          nullable: false
        },
        "hasMore": {
          name: "hasMore",
          type: "boolean",
          description: "Whether more results exist",
          required: true,
          nullable: false
        }
      }
    }
  },

  operations: [
    {
      id: "createCharge",
      name: "Create a charge",
      description: "Create a new payment charge",
      longDescription: "Create a charge to process a payment. The charge will be processed immediately. Returns the created charge object.",
      category: "write",
      httpMethod: "POST",
      path: "/v1/charges",
      parameters: [
        {
          name: "amount",
          description: "Amount to charge in cents",
          type: "number",
          required: true,
          location: "body",
          validation: { minValue: 1 }
        },
        {
          name: "currency",
          description: "3-letter ISO currency code",
          type: "string",
          required: true,
          location: "body",
          validation: { pattern: "^[a-z]{3}$" }
        },
        {
          name: "source",
          description: "Payment token or card ID",
          type: "string",
          required: true,
          location: "body"
        },
        {
          name: "description",
          description: "Optional description",
          type: "string",
          required: false,
          location: "body"
        }
      ],
      responseType: "Charge",
      errorCodes: ["INVALID_REQUEST", "CARD_DECLINED", "RATE_LIMITED"],
      auth: {
        required: true,
        type: "api_key",
        apiKeyLocation: "header",
        apiKeyName: "Authorization"
      },
      async: {
        model: "synchronous",
        returnsPromise: true
      },
      rateLimit: {
        requestsPerPeriod: 100,
        periodSeconds: 1,
        scope: "per_api_key"
      },
      retry: {
        enabled: true,
        maxAttempts: 3,
        backoffMs: 100,
        backoffMultiplier: 2,
        retryableErrorCodes: ["RATE_LIMITED", "TIMEOUT"]
      },
      timeoutMs: 10000,
      examples: [
        {
          title: "Create a $50 charge",
          input: {
            amount: 5000,
            currency: "usd",
            source: "tok_visa"
          },
          output: {
            id: "ch_1234567890",
            amount: 5000,
            currency: "usd",
            status: "succeeded"
          }
        }
      ],
      specUrl: "https://stripe.com/docs/api/charges/create"
    },

    {
      id: "listCharges",
      name: "List charges",
      description: "List all charges for your account",
      category: "read",
      httpMethod: "GET",
      path: "/v1/charges",
      parameters: [
        {
          name: "limit",
          description: "Number of results to return",
          type: "number",
          required: false,
          location: "query",
          defaultValue: 10,
          validation: { minValue: 1, maxValue: 100 }
        },
        {
          name: "startingAfter",
          description: "Cursor for pagination",
          type: "string",
          required: false,
          location: "query"
        }
      ],
      responseType: "ChargeList",
      errorCodes: ["INVALID_REQUEST", "RATE_LIMITED"],
      auth: {
        required: true,
        type: "api_key",
        apiKeyLocation: "header",
        apiKeyName: "Authorization"
      },
      async: {
        model: "synchronous",
        returnsPromise: true
      },
      pagination: {
        strategy: "cursor",
        limitParam: "limit",
        defaultPageSize: 10,
        maxPageSize: 100,
        offsetParam: "startingAfter",
        cursorField: "id",
        itemsField: "data"
      },
      specUrl: "https://stripe.com/docs/api/charges/list"
    }
  ],

  errors: [
    {
      code: "INVALID_REQUEST",
      httpStatus: 400,
      message: "Invalid request parameters",
      description: "The request parameters are invalid or missing required fields",
      category: "client_error",
      retryable: false,
      recoveryAction: "Check the error details and fix the request parameters"
    },
    {
      code: "CARD_DECLINED",
      httpStatus: 402,
      message: "Card was declined",
      description: "The payment card was declined by the issuer",
      category: "business_logic",
      retryable: false,
      recoveryAction: "Try a different card or contact the card issuer"
    },
    {
      code: "RATE_LIMITED",
      httpStatus: 429,
      message: "Rate limit exceeded",
      description: "Too many requests in a short time period",
      category: "rate_limit",
      retryable: true,
      recoveryAction: "Wait a moment and retry the request"
    }
  ],

  auth: {
    type: "api_key",
    required: true,
    description: "Stripe API requires an API key for authentication",
    apiKeyLocation: "Bearer token in Authorization header"
  },

  networks: [
    {
      id: "production",
      name: "Stripe Production",
      description: "Live transaction processing",
      environment: "production",
      endpoint: "https://api.stripe.com",
      active: true,
      statusUrl: "https://status.stripe.com"
    },
    {
      id: "test",
      name: "Stripe Test",
      description: "Sandbox for testing",
      environment: "test",
      endpoint: "https://api.stripe.com/test",
      active: true,
      faucetUrl: "https://stripe.com/docs/testing"
    }
  ],

  constraints: {
    globalRateLimit: {
      requestsPerSecond: 100,
      burstAllowed: 200
    },
    requestTimeoutMs: 30000,
    maxRequestBodyBytes: 1048576
  },

  conventions: {
    methodNaming: "camelCase",
    errorNaming: "PascalCase",
    autoRetry: true,
    enableLogging: true,
    batchBehavior: "sequential",
    responseWrapper: {
      type: "none"
    },
    versioningStrategy: "header",
    typeNaming: "PascalCase",
    exposeLowLevel: true,
    clientConstructor: "class"
  },

  documentation: {
    docsBaseUrl: "https://stripe.com/docs/api",
    includeExamples: true,
    exampleLanguages: ["typescript", "python", "go", "java"],
    tutorials: [
      "Getting started",
      "Authentication with API keys",
      "Processing payments",
      "Handling webhooks",
      "Error handling"
    ],
    changelog: {
      url: "https://stripe.com/docs/upgrades",
      generateFromSpec: true
    }
  }
};
```

---

## Example 2: Uniswap V3 Smart Contract (Web3)

```typescript
const uniswapV3Schema: ProductCanonicalSchema = {
  product: {
    name: "uniswap-v3",
    version: "1.0.0",
    apiVersion: "3.0",
    description: "Automated market maker for token swaps and liquidity provision",
    tags: ["defi", "amm", "web3", "ethereum"],
    license: "GPL-2.0"
  },

  classification: {
    type: "web3",
    primaryChain: "ethereum",
    complexity: "complex",
    domain: "defi",
    multiNetwork: true
  },

  types: {
    "Address": {
      name: "Address",
      category: "primitive",
      primitiveType: "string",
      description: "Ethereum address",
      nullable: false,
      validation: { pattern: "^0x[0-9a-fA-F]{40}$" },
      examples: ["0x1111111254fb6c44bac0bed2854e76f90643097d"]
    },

    "BigInt": {
      name: "BigInt",
      category: "primitive",
      primitiveType: "bigint",
      description: "Large integer for token amounts and prices",
      nullable: false,
      examples: ["1000000000000000000"]
    },

    "SwapExactInputSingleParams": {
      name: "SwapExactInputSingleParams",
      category: "object",
      description: "Parameters for swapping exact amount of input token",
      fields: {
        "tokenIn": {
          name: "tokenIn",
          type: "Address",
          description: "Input token address",
          required: true,
          nullable: false,
          example: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" // WETH
        },
        "tokenOut": {
          name: "tokenOut",
          type: "Address",
          description: "Output token address",
          required: true,
          nullable: false,
          example: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" // USDC
        },
        "fee": {
          name: "fee",
          type: "number",
          description: "Pool fee tier in basis points",
          required: true,
          nullable: false,
          validation: { allowedValues: [100, 500, 3000, 10000] },
          example: 3000
        },
        "recipient": {
          name: "recipient",
          type: "Address",
          description: "Address to receive output tokens",
          required: true,
          nullable: false
        },
        "amountIn": {
          name: "amountIn",
          type: "BigInt",
          description: "Amount of input tokens to swap",
          required: true,
          nullable: false,
          validation: { minValue: "1" },
          example: "1000000000000000000"
        },
        "amountOutMinimum": {
          name: "amountOutMinimum",
          type: "BigInt",
          description: "Minimum acceptable output token amount (slippage protection)",
          required: true,
          nullable: false,
          example: "950000000000000000"
        },
        "sqrtPriceLimitX96": {
          name: "sqrtPriceLimitX96",
          type: "BigInt",
          description: "Price limit for execution",
          required: true,
          nullable: false,
          example: "0"
        }
      }
    },

    "SwapExactInputSingleResult": {
      name: "SwapExactInputSingleResult",
      category: "object",
      description: "Result of a swap operation",
      fields: {
        "amountOut": {
          name: "amountOut",
          type: "BigInt",
          description: "Amount of output tokens received",
          required: true,
          nullable: false
        },
        "transactionHash": {
          name: "transactionHash",
          type: "string",
          description: "Transaction hash",
          required: true,
          nullable: false,
          validation: { pattern: "^0x[0-9a-fA-F]{64}$" }
        },
        "blockNumber": {
          name: "blockNumber",
          type: "number",
          description: "Block number when transaction was confirmed",
          required: true,
          nullable: false
        }
      }
    },

    "SwapEvent": {
      name: "SwapEvent",
      category: "object",
      description: "Smart contract swap event",
      fields: {
        "sender": {
          name: "sender",
          type: "Address",
          description: "Address that initiated the swap",
          required: true,
          nullable: false
        },
        "amount0": {
          name: "amount0",
          type: "BigInt",
          description: "Change in token0 balance",
          required: true,
          nullable: false
        },
        "amount1": {
          name: "amount1",
          type: "BigInt",
          description: "Change in token1 balance",
          required: true,
          nullable: false
        },
        "sqrtPriceX96": {
          name: "sqrtPriceX96",
          type: "BigInt",
          description: "Price after swap",
          required: true,
          nullable: false
        },
        "tick": {
          name: "tick",
          type: "number",
          description: "Current tick",
          required: true,
          nullable: false
        }
      }
    },

    "GasEstimate": {
      name: "GasEstimate",
      category: "object",
      description: "Estimated gas for a transaction",
      fields: {
        "gasUnits": {
          name: "gasUnits",
          type: "BigInt",
          description: "Estimated gas units needed",
          required: true,
          nullable: false
        },
        "gasPriceGwei": {
          name: "gasPriceGwei",
          type: "BigInt",
          description: "Current gas price in Gwei",
          required: true,
          nullable: false
        },
        "totalCostEth": {
          name: "totalCostEth",
          type: "string",
          description: "Total cost in ETH",
          required: true,
          nullable: false
        }
      }
    }
  },

  operations: [
    {
      id: "exactInputSingle",
      name: "Swap exact input single",
      description: "Execute a swap with exact input amount",
      longDescription:
        "Swaps exact amount of input tokens for maximum possible output tokens. " +
        "Protects against slippage with amountOutMinimum parameter.",
      category: "write",
      parameters: [
        {
          name: "params",
          description: "Swap parameters",
          type: "SwapExactInputSingleParams",
          required: true,
          location: "input"
        }
      ],
      responseType: "SwapExactInputSingleResult",
      errorCodes: ["INSUFFICIENT_INPUT_AMOUNT", "TOO_LITTLE_RECEIVED", "PRICE_LIMIT_EXCEEDED"],
      auth: {
        required: true,
        type: "wallet",
        signerType: "eoa"
      },
      async: {
        model: "asynchronous",
        completionModel: "polling",
        pollingIntervalMs: 2000,
        pollingTimeoutMs: 300000,
        returnsPromise: true,
        statusType: "TransactionReceipt"
      },
      isTransaction: true,
      isRead: false,
      supportedNetworks: ["ethereum", "polygon", "arbitrum", "optimism"],
      gasEstimation: {
        estimationAvailable: true,
        estimationMethod: "estimateGas",
        typicalGas: "200000",
        gasIncludedInSign: false
      },
      retry: {
        enabled: true,
        maxAttempts: 2,
        backoffMs: 5000,
        backoffMultiplier: 1.5,
        retryableErrorCodes: ["NONCE_TOO_LOW", "REPLACEMENT_UNDERPRICED"]
      },
      examples: [
        {
          title: "Swap 1 WETH for USDC with 5% slippage",
          input: {
            tokenIn: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
            tokenOut: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
            fee: 3000,
            recipient: "0x1111111254fb6c44bac0bed2854e76f90643097d",
            amountIn: "1000000000000000000",
            amountOutMinimum: "1900000000", // USDC has 6 decimals
            sqrtPriceLimitX96: "0"
          },
          output: {
            amountOut: "2000000000",
            transactionHash: "0xabcd...",
            blockNumber: 18000000
          }
        }
      ],
      specUrl: "https://docs.uniswap.org/contracts/v3/reference/periphery/routers/SwapRouter"
    },

    {
      id: "estimateGasSwap",
      name: "Estimate gas for swap",
      description: "Estimate gas cost for a swap without executing",
      category: "read",
      parameters: [
        {
          name: "params",
          description: "Swap parameters",
          type: "SwapExactInputSingleParams",
          required: true,
          location: "input"
        }
      ],
      responseType: "GasEstimate",
      errorCodes: ["INVALID_PARAMS"],
      auth: {
        required: false,
        type: "none"
      },
      async: {
        model: "synchronous",
        returnsPromise: true
      },
      isRead: true,
      isTransaction: false,
      supportedNetworks: ["ethereum", "polygon", "arbitrum", "optimism"]
    }
  ],

  errors: [
    {
      code: "INSUFFICIENT_INPUT_AMOUNT",
      httpStatus: 400,
      message: "Insufficient input token amount",
      description: "The input amount is too small for the swap",
      category: "business_logic",
      retryable: false,
      recoveryAction: "Increase the input amount"
    },
    {
      code: "TOO_LITTLE_RECEIVED",
      httpStatus: 400,
      message: "Output amount is below minimum",
      description: "Price moved too much; received less than amountOutMinimum",
      category: "business_logic",
      retryable: true,
      recoveryAction: "Increase slippage tolerance or try again at a different price"
    },
    {
      code: "PRICE_LIMIT_EXCEEDED",
      httpStatus: 400,
      message: "Price limit exceeded",
      description: "Current price is beyond the sqrtPriceLimit",
      category: "business_logic",
      retryable: true,
      recoveryAction: "Adjust price limit or wait for price movement"
    },
    {
      code: "NONCE_TOO_LOW",
      httpStatus: 500,
      message: "Transaction nonce is too low",
      description: "The wallet's transaction nonce is outdated",
      category: "network",
      retryable: true,
      recoveryAction: "Retry; SDK will refresh nonce automatically"
    }
  ],

  auth: {
    type: "wallet",
    required: true,
    description: "Web3 operations require a connected wallet for signing",
    wallet: {
      supportedWallets: ["MetaMask", "Ledger", "WalletConnect", "Coinbase Wallet"],
      chainRequired: true,
      multipleSigners: false
    }
  },

  networks: [
    {
      id: "ethereum",
      name: "Ethereum Mainnet",
      environment: "production",
      endpoint: "https://eth.llamarpc.com",
      chainId: "1",
      networkType: "evm",
      active: true,
      supportedOperations: ["exactInputSingle", "estimateGasSwap"],
      explorerUrl: "https://etherscan.io",
      statusUrl: "https://ethstatus.net"
    },
    {
      id: "polygon",
      name: "Polygon Mainnet",
      environment: "production",
      endpoint: "https://polygon.llamarpc.com",
      chainId: "137",
      networkType: "evm",
      active: true,
      supportedOperations: ["exactInputSingle", "estimateGasSwap"],
      explorerUrl: "https://polygonscan.com"
    },
    {
      id: "ethereum-sepolia",
      name: "Ethereum Sepolia Testnet",
      environment: "test",
      endpoint: "https://sepolia.infura.io/v3/{PROJECT_ID}",
      chainId: "11155111",
      networkType: "evm",
      active: true,
      faucetUrl: "https://sepoliafaucet.com",
      explorerUrl: "https://sepolia.etherscan.io"
    }
  ],

  constraints: {
    requestTimeoutMs: 60000,
    batchLimits: {
      maxBatchSize: 10,
      maxConcurrentBatches: 5
    }
  },

  web3: {
    chains: [
      {
        id: "ethereum",
        name: "Ethereum",
        type: "evm",
        nativeToken: "ETH",
        decimals: 18,
        rpcEndpoints: ["https://eth.llamarpc.com", "https://eth-mainnet.alchemyapi.io/v2/{API_KEY}"],
        blockTimeSeconds: 12,
        finalityBlocks: 15
      },
      {
        id: "polygon",
        name: "Polygon",
        type: "evm",
        nativeToken: "MATIC",
        decimals: 18,
        rpcEndpoints: ["https://polygon.llamarpc.com"],
        blockTimeSeconds: 2,
        finalityBlocks: 256
      }
    ],

    transactionConfirmation: {
      blockConfirmations: 3,
      timeoutMs: 300000
    },

    gas: {
      estimationAvailable: true,
      presetGasPrices: {
        slow: "10",
        standard: "15",
        fast: "20"
      },
      customGasPrice: true
    },

    walletIntegration: {
      injectedProviderName: "ethereum",
      supportedWallets: ["MetaMask", "WalletConnect", "Ledger", "Coinbase"],
      autoConnect: true
    },

    tokenStandards: ["ERC20", "ERC721", "ERC1155"],

    smartContracts: [
      {
        name: "UniswapV3Router",
        addresses: {
          "1": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
          "137": "0x68b3465833fb72B5A828cCd3c5e3FA280A0bA2d2"
        },
        abi: `[
          {
            "name": "exactInputSingle",
            "type": "function",
            "inputs": [...],
            "outputs": [{"type": "uint256"}]
          }
        ]`,
        functions: {
          "exactInputSingle": {
            id: "exactInputSingle",
            name: "exactInputSingle",
            description: "Execute swap with exact input",
            category: "write",
            parameters: [
              {
                name: "params",
                type: "SwapExactInputSingleParams",
                required: true,
                location: "input"
              }
            ],
            responseType: "BigInt",
            errorCodes: ["TOO_LITTLE_RECEIVED"],
            auth: {
              required: true,
              type: "wallet"
            },
            async: {
              model: "asynchronous",
              completionModel: "polling",
              returnsPromise: true
            },
            isTransaction: true,
            supportedNetworks: ["ethereum", "polygon"]
          }
        },
        events: {
          "Swap": {
            name: "Swap",
            description: "Emitted when a swap occurs",
            parameters: [
              {
                name: "sender",
                type: "Address",
                required: true,
                location: "input"
              },
              {
                name: "amount0",
                type: "BigInt",
                required: true,
                location: "input"
              }
            ],
            indexedParameters: ["sender"]
          }
        }
      }
    ],

    events: {
      subscriptionMethod: "websocket",
      maxConcurrentSubscriptions: 10
    }
  },

  events: [
    {
      id: "onSwap",
      name: "Swap event",
      description: "Listen for swap events on the contract",
      type: "smart_contract",
      payloadType: "SwapEvent",
      triggerCondition: "When exactInputSingle is called",
      supportedNetworks: ["ethereum", "polygon"],
      example: {
        sender: "0x1111111254fb6c44bac0bed2854e76f90643097d",
        amount0: "1000000000000000000",
        amount1: "2000000000",
        sqrtPriceX96: "123456789",
        tick: 200000
      }
    }
  ],

  conventions: {
    methodNaming: "camelCase",
    errorNaming: "PascalCase",
    autoRetry: true,
    enableLogging: true,
    timeoutBehavior: "throw",
    batchBehavior: "parallel",
    versioningStrategy: "none",
    typeNaming: "PascalCase",
    exposeLowLevel: false,
    clientConstructor: "class"
  },

  documentation: {
    docsBaseUrl: "https://docs.uniswap.org",
    includeExamples: true,
    exampleLanguages: ["typescript", "python"],
    tutorials: [
      "Getting started with Web3",
      "Connecting your wallet",
      "Executing your first swap",
      "Gas estimation and management",
      "Handling transaction failures",
      "Listening to events"
    ],
    faqs: [
      {
        question: "What is slippage?",
        answer: "Slippage is the difference between the expected and actual output price. Set amountOutMinimum to protect against excessive slippage.",
        relatedOperations: ["exactInputSingle"]
      }
    ],
    glossary: {
      slippage: "Price impact caused by trading volume affecting the pool price",
      "gas units": "Measure of computational work for a transaction",
      AMM: "Automated Market Maker - algorithmic trading mechanism"
    }
  }
};
```

---

## Key Differences: Web2 vs Web3 in the Schema

| Aspect | Web2 (Stripe) | Web3 (Uniswap) |
|--------|--------------|----------------|
| **Auth** | API key in header | Wallet + signer |
| **Async** | Synchronous by default | Asynchronous (polling for tx confirmation) |
| **Networks** | API endpoints (staging, production) | Blockchain networks (mainnet, testnet) |
| **Transactions** | HTTP requests | Signed on-chain transactions |
| **Gas** | No gas concept | Requires gas estimation |
| **Events** | Webhooks | Smart contract events |
| **Errors** | HTTP status codes | Custom error codes + revert reasons |
| **Retry** | Rate limit respecting | Nonce handling + confirmation waiting |

---

## Validation Function

The schema includes `validateSchemaReferences()` that runs during ingestion to catch:

- Missing type definitions
- Invalid type references in operations
- Undefined error codes
- Broken pagination configurations

This prevents downstream code generation from hallucinating fixes.

---

## How This Drives Everything

1. **Code generation:** Reads types → generates TypeScript interfaces; reads operations → generates client methods
2. **Documentation:** Reads examples + descriptions → generates tutorials and API reference
3. **Testing:** Reads error codes → generates error handling tests; reads operations → generates test cases
4. **Validation:** Uses constraints + validation rules → generates input validators

**No guessing. No hallucination. Deterministic all the way.**

