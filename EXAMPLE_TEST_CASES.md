# Example Test Cases for Generated SDKs

## Web2 REST API SDK Tests (GitHub API)

### Test Suite: User Management

#### Test 1: Successful User Fetch
```typescript
{
  name: "getUser - Successful Fetch",
  category: "integration",
  description: "Fetch user profile successfully",
  execute: async () => {
    const client = new GitHubSDK({ apiKey: "test_key" });
    const user = await client.getUser({ username: "octocat" });
    return user;
  },
  assertions: [
    {
      condition: user.id !== undefined,
      message: "User has ID",
      severity: "error",
    },
    {
      condition: user.login === "octocat",
      message: "User login matches request",
      severity: "error",
    },
    {
      condition: user.createdAt !== undefined,
      message: "User has creation timestamp",
      severity: "error",
    },
  ],
  expectedResult: {
    id: 1,
    login: "octocat",
    name: "The Octocat",
    company: "GitHub",
    blog: "https://github.blog",
    location: "San Francisco",
    email: null,
    createdAt: "2011-01-25T18:44:36Z",
    updatedAt: "2024-01-14T10:20:30Z",
  },
}
```

#### Test 2: User Not Found Error
```typescript
{
  name: "getUser - User Not Found",
  category: "integration",
  description: "Handle 404 error when user doesn't exist",
  execute: async () => {
    const client = new GitHubSDK({ apiKey: "test_key" });
    try {
      await client.getUser({ username: "nonexistent_user_xyz" });
      throw new Error("Should have thrown");
    } catch (error) {
      if (error.statusCode === 404) {
        return error;
      }
      throw error;
    }
  },
  assertions: [
    {
      condition: error.statusCode === 404,
      message: "Error status is 404",
      severity: "error",
    },
    {
      condition: error.code === "NOT_FOUND",
      message: "Error code is NOT_FOUND",
      severity: "error",
    },
    {
      condition: error.message.includes("Not Found"),
      message: "Error message is helpful",
      severity: "error",
    },
  ],
  shouldFail: false,
}
```

#### Test 3: Invalid Parameters
```typescript
{
  name: "getUser - Parameter Validation",
  category: "unit",
  description: "Validate parameters before API call",
  execute: async () => {
    const client = new GitHubSDK({ apiKey: "test_key" });
    
    // Test missing required parameter
    try {
      await client.getUser({} as any);
      throw new Error("Should have thrown");
    } catch (error) {
      if (error.code === "INVALID_PARAMETERS") {
        return error;
      }
      throw error;
    }
  },
  assertions: [
    {
      condition: error.code === "INVALID_PARAMETERS",
      message: "Validation error has correct code",
      severity: "error",
    },
    {
      condition: error.message.includes("username"),
      message: "Error identifies missing parameter",
      severity: "error",
    },
  ],
  shouldFail: false,
}
```

#### Test 4: Authentication Failure
```typescript
{
  name: "getUser - Authentication Failure",
  category: "behavior",
  description: "Handle invalid API key",
  execute: async () => {
    const client = new GitHubSDK({ apiKey: "invalid_key" });
    try {
      await client.getUser({ username: "octocat" });
      throw new Error("Should have thrown");
    } catch (error) {
      if (error.statusCode === 401) {
        return error;
      }
      throw error;
    }
  },
  assertions: [
    {
      condition: error.statusCode === 401,
      message: "Unauthorized error returned",
      severity: "error",
    },
    {
      condition: error.code === "UNAUTHORIZED",
      message: "Error code is UNAUTHORIZED",
      severity: "error",
    },
  ],
  shouldFail: false,
}
```

#### Test 5: Rate Limit Handling
```typescript
{
  name: "getUser - Rate Limit Handling",
  category: "behavior",
  description: "Handle rate limit error and retry",
  execute: async () => {
    const client = new GitHubSDK({ apiKey: "test_key" });
    let attempts = 0;
    
    const result = await client.getUser(
      { username: "octocat" },
      {
        maxRetries: 3,
        onRetry: (error, attempt) => {
          attempts = attempt;
        },
      }
    );
    
    return { result, retryAttempts: attempts };
  },
  assertions: [
    {
      condition: result !== null,
      message: "Request succeeded after retry",
      severity: "error",
    },
    {
      condition: retryAttempts > 0,
      message: "Retry logic was triggered",
      severity: "warning",
    },
  ],
}
```

### Test Suite: Repository Operations

#### Test 6: List Repositories
```typescript
{
  name: "listRepositories - Successful List",
  category: "integration",
  description: "Fetch list of user repositories",
  execute: async () => {
    const client = new GitHubSDK({ apiKey: "test_key" });
    const repos = await client.listRepositories({ username: "octocat" });
    return repos;
  },
  assertions: [
    {
      condition: Array.isArray(repos),
      message: "Result is array",
      severity: "error",
    },
    {
      condition: repos.length > 0,
      message: "List is not empty",
      severity: "error",
    },
    {
      condition: repos[0].name !== undefined,
      message: "Each repo has name",
      severity: "error",
    },
    {
      condition: repos[0].url !== undefined,
      message: "Each repo has URL",
      severity: "error",
    },
  ],
  expectedResult: {
    count: 8,
    items: [
      {
        id: 1296269,
        name: "Hello-World",
        url: "https://github.com/octocat/Hello-World",
        private: false,
        created: "2011-01-26T19:01:12Z",
      },
    ],
  },
}
```

#### Test 7: Create Repository
```typescript
{
  name: "createRepository - Successful Creation",
  category: "integration",
  description: "Create new repository",
  execute: async () => {
    const client = new GitHubSDK({ apiKey: "test_key" });
    const repo = await client.createRepository({
      name: "new-repo",
      description: "Test repository",
      private: false,
    });
    return repo;
  },
  assertions: [
    {
      condition: repo.id !== undefined,
      message: "Created repo has ID",
      severity: "error",
    },
    {
      condition: repo.name === "new-repo",
      message: "Repo name matches",
      severity: "error",
    },
    {
      condition: repo.private === false,
      message: "Visibility is correct",
      severity: "error",
    },
  ],
}
```

## Web3 Blockchain SDK Tests (Uniswap V4)

### Test Suite: Token Operations

#### Test 8: Get Token Balance
```typescript
{
  name: "getTokenBalance - Read Operation",
  category: "behavior",
  description: "Query token balance without state change",
  execute: async () => {
    const wallet = new UniswapV4SDK({
      chainId: 1,
      rpcUrl: "http://localhost:8545",
    });

    const balance = await wallet.getTokenBalance({
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      walletAddress: "0x1234567890123456789012345678901234567890",
    });

    return balance;
  },
  assertions: [
    {
      condition: balance !== undefined,
      message: "Balance is returned",
      severity: "error",
    },
    {
      condition: /^\d+$/.test(balance),
      message: "Balance is numeric string",
      severity: "error",
    },
    {
      condition: BigInt(balance) >= 0n,
      message: "Balance is non-negative",
      severity: "error",
    },
  ],
  expectedResult: "1000000000000", // 1M USDC in base units
}
```

#### Test 9: Approve Token for Spending
```typescript
{
  name: "approveToken - Write Operation",
  category: "behavior",
  description: "Approve token for spending",
  execute: async () => {
    const wallet = new UniswapV4SDK({
      chainId: 1,
      rpcUrl: "http://localhost:8545",
    });

    const tx = await wallet.approveToken({
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      spenderAddress: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
      amount: "1000000000000",
    });

    return tx;
  },
  assertions: [
    {
      condition: tx.hash !== undefined,
      message: "Transaction hash is returned",
      severity: "error",
    },
    {
      condition: tx.hash.startsWith("0x"),
      message: "Hash is valid hex",
      severity: "error",
    },
    {
      condition: tx.status === "confirmed" || tx.status === "pending",
      message: "Transaction has valid status",
      severity: "error",
    },
  ],
}
```

#### Test 10: Insufficient Allowance Error
```typescript
{
  name: "swap - Insufficient Allowance",
  category: "behavior",
  description: "Handle swap with insufficient token allowance",
  execute: async () => {
    const wallet = new UniswapV4SDK({
      chainId: 1,
      rpcUrl: "http://localhost:8545",
    });

    try {
      await wallet.swap({
        tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        tokenOut: "0xC02aaA39b223FE8D0A0e8e4F27AeD26D3497c6dB",
        amountIn: "1000000000000",
      });
      throw new Error("Should have thrown");
    } catch (error) {
      if (error.code === "INSUFFICIENT_ALLOWANCE") {
        return error;
      }
      throw error;
    }
  },
  assertions: [
    {
      condition: error.code === "INSUFFICIENT_ALLOWANCE",
      message: "Correct error code",
      severity: "error",
    },
    {
      condition: error.details?.required !== undefined,
      message: "Error includes required allowance",
      severity: "error",
    },
  ],
  shouldFail: false,
}
```

#### Test 11: Swap Execution
```typescript
{
  name: "swap - Successful Swap",
  category: "behavior",
  description: "Execute token swap successfully",
  execute: async () => {
    const wallet = new UniswapV4SDK({
      chainId: 1,
      rpcUrl: "http://localhost:8545",
    });

    const tx = await wallet.swap({
      tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      tokenOut: "0xC02aaA39b223FE8D0A0e8e4F27AeD26D3497c6dB", // WETH
      amountIn: "1000000000000",
      slippageTolerance: 0.5,
    });

    return tx;
  },
  assertions: [
    {
      condition: tx.hash !== undefined,
      message: "Swap transaction hash",
      severity: "error",
    },
    {
      condition: tx.status === "confirmed",
      message: "Transaction confirmed",
      severity: "error",
    },
    {
      condition: tx.amountOut !== undefined,
      message: "Output amount calculated",
      severity: "error",
    },
    {
      condition: BigInt(tx.gasUsed) > 0n,
      message: "Gas was used",
      severity: "error",
    },
  ],
}
```

#### Test 12: Slippage Check
```typescript
{
  name: "swap - Slippage Exceeded",
  category: "behavior",
  description: "Handle excessive price slippage",
  execute: async () => {
    const wallet = new UniswapV4SDK({
      chainId: 1,
      rpcUrl: "http://localhost:8545",
    });

    try {
      await wallet.swap({
        tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        tokenOut: "0xC02aaA39b223FE8D0A0e8e4F27AeD26D3497c6dB",
        amountIn: "1000000000000",
        slippageTolerance: 0.01, // 1% - will exceed due to price movement
      });
      throw new Error("Should have thrown");
    } catch (error) {
      if (error.code === "SLIPPAGE_EXCEEDED") {
        return error;
      }
      throw error;
    }
  },
  assertions: [
    {
      condition: error.code === "SLIPPAGE_EXCEEDED",
      message: "Slippage error detected",
      severity: "error",
    },
    {
      condition: error.actual !== undefined && error.maximum !== undefined,
      message: "Error includes slippage comparison",
      severity: "error",
    },
  ],
  shouldFail: false,
}
```

### Test Suite: Gas Estimation

#### Test 13: Accurate Gas Estimation
```typescript
{
  name: "estimateGas - Swap Operation",
  category: "unit",
  description: "Estimate gas for swap operation",
  execute: async () => {
    const wallet = new UniswapV4SDK({
      chainId: 1,
      rpcUrl: "http://localhost:8545",
    });

    const estimate = await wallet.estimateGas("swap", {
      tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      tokenOut: "0xC02aaA39b223FE8D0A0e8e4F27AeD26D3497c6dB",
      amountIn: "1000000000000",
    });

    return estimate;
  },
  assertions: [
    {
      condition: BigInt(estimate) > 0n,
      message: "Gas estimate is positive",
      severity: "error",
    },
    {
      condition: BigInt(estimate) < BigInt(10000000),
      message: "Gas estimate is reasonable",
      severity: "error",
    },
  ],
}
```

### Test Suite: Regression

#### Test 14: Method Signature Compatibility
```typescript
{
  name: "Regression - getTokenBalance Signature",
  category: "regression",
  description: "Verify backward compatibility",
  execute: async () => {
    const wallet = new UniswapV4SDK({
      chainId: 1,
      rpcUrl: "http://localhost:8545",
    });

    // Old code should still work
    const balance1 = await wallet.getTokenBalance({
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      walletAddress: "0x1234567890123456789012345678901234567890",
    });

    // New optional parameter should be accepted
    const balance2 = await wallet.getTokenBalance({
      tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      walletAddress: "0x1234567890123456789012345678901234567890",
      blockNumber: "latest",
    });

    return { balance1, balance2 };
  },
  assertions: [
    {
      condition: balance1 === balance2,
      message: "New parameter doesn't affect existing calls",
      severity: "error",
    },
  ],
}
```

#### Test 15: Error Message Consistency
```typescript
{
  name: "Regression - Error Handling",
  category: "regression",
  description: "Verify error message consistency",
  execute: async () => {
    const wallet = new UniswapV4SDK({
      chainId: 1,
      rpcUrl: "http://localhost:8545",
    });

    try {
      await wallet.swap({
        tokenIn: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        tokenOut: "0xC02aaA39b223FE8D0A0e8e4F27AeD26D3497c6dB",
        amountIn: "0", // Invalid amount
      });
    } catch (error) {
      return error;
    }
  },
  assertions: [
    {
      condition: error.code !== undefined,
      message: "Error has code",
      severity: "error",
    },
    {
      condition: error.message !== undefined,
      message: "Error has message",
      severity: "error",
    },
    {
      condition: error.message.length > 10,
      message: "Error message is helpful",
      severity: "warning",
    },
  ],
}
```

## Validation Test Results

### Expected Output

```json
{
  "testSuite": "Web2 SDK Mock API Tests",
  "totalTests": 15,
  "passed": 14,
  "failed": 1,
  "skipped": 0,
  "duration": "2.45s",
  "coverage": {
    "methods": 95,
    "parameters": 88,
    "errorCases": 92
  },
  "results": [
    {
      "name": "getUser - Successful Fetch",
      "passed": true,
      "duration": "145ms"
    },
    {
      "name": "getUser - User Not Found",
      "passed": true,
      "duration": "98ms"
    },
    {
      "name": "swap - Slippage Exceeded",
      "passed": false,
      "duration": "234ms",
      "error": "Expected error code SLIPPAGE_EXCEEDED but got PRICE_IMPACT_TOO_HIGH"
    }
  ]
}
```
