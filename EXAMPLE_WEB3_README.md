# Uniswap V4 SDK

A type-safe TypeScript SDK for Uniswap V4 smart contracts with explicit transaction lifecycle management, wallet integration, and complete DEX operation coverage.

**Version:** 1.0.0

##  Quick Links

- [ Quickstart Guide](#quickstart)
- [ Wallet Setup Guide](#wallet-setup)
- [ Examples](#examples)
- [ Error Handling](#error-handling)
- [ Troubleshooting](#troubleshooting)
- [ GitHub](https://github.com/example/uniswap-v4-sdk)
- [ Full Documentation](https://docs.example.com/uniswap-v4)

##  Features

- **Complete Uniswap V4 coverage** - All pool operations, swaps, liquidity management
- **Explicit transaction states** - Track every step: pending, included, finalized, confirmed
- **Multi-chain support** - Ethereum, Arbitrum, Optimism, and more
- **Wallet connection** - MetaMask, WalletConnect, Coinbase Wallet, Phantom
- **Read vs write separation** - Clear distinction between queries and state-changing operations
- **Gas estimation** - Separate gas estimation with pricing options (slow/standard/fast)
- **Event subscriptions** - Monitor swap events with reorg detection
- **Enterprise-ready** - Comprehensive error handling, recovery strategies, and testing utilities
- **Beginner-friendly** - Clear patterns and helpful error messages

##  Installation

### Using npm

```bash
npm install @example/uniswap-v4-sdk
```

### From Source

```bash
git clone https://github.com/example/uniswap-v4-sdk.git
cd uniswap-v4-sdk
npm install
npm run build
```

##  Quick Start

### 1. Import the SDK

```typescript
import { UniswapV4SDK } from '@example/uniswap-v4-sdk';
```

### 2. Create a Client

```typescript
const uniswap = new UniswapV4SDK({
  // Wallet connection is required
  rpcUrl: process.env.RPC_URL,
  chainId: 1 // Ethereum mainnet
});
```

### 3. Connect Your Wallet

```typescript
// Connect to MetaMask or WalletConnect
await uniswap.connectWallet();

// Now you can make calls
const balance = await uniswap.balanceOf(tokenAddress);
console.log(`Your balance: ${balance}`);
```

### 4. Execute a Swap

```typescript
// Estimate gas
const gasEstimate = await uniswap.estimateGasForSwap({
  tokenIn: USDC,
  tokenOut: DAI,
  amountIn: parseUnits('1000', 6)
});

console.log(`Gas cost: ${gasEstimate.gasEstimate}`);
console.log(`USD cost: $${gasEstimate.usdCost}`);

// User approves the cost

// Execute swap
const tx = await uniswap.swap({
  tokenIn: USDC,
  tokenOut: DAI,
  amountIn: parseUnits('1000', 6),
  minAmountOut: parseUnits('990', 18)
});

// Wait for confirmation
const receipt = await uniswap.waitForConfirmation(tx.hash);
console.log(`Swap confirmed! ${receipt.confirmations} confirmations`);
```

 **[Read the full quickstart guide ](#quickstart)**

##  Documentation

- **[Quickstart Guide](./docs/QUICKSTART.md)** - Get up and running in 5 minutes
- **[Wallet Setup Guide](./docs/WALLET_SETUP.md)** - Connect your wallet
- **[Usage Examples](./docs/EXAMPLES.md)** - Common use cases with code
- **[API Reference](./docs/API_REFERENCE.md)** - Complete method reference
- **[Error Handling](./docs/ERROR_HANDLING.md)** - Understanding error codes and recovery
- **[Troubleshooting](./docs/TROUBLESHOOTING.md)** - Common issues and solutions

##  Support

**GitHub Issues:** [Report bugs](https://github.com/example/uniswap-v4-sdk/issues)

**Documentation:** [https://docs.example.com/uniswap-v4](https://docs.example.com/uniswap-v4)

**Discord:** [Join our server](https://discord.gg/example)

**Email:** support@example.com

---

#  Wallet Setup

The SDK requires a wallet connection for state-changing operations (swaps, liquidity management). Read operations don't need a wallet.

## Supported Wallets

- **MetaMask** - Most popular browser wallet
- **WalletConnect** - Mobile wallets and Web3 apps
- **Coinbase Wallet** - Coinbase's native wallet
- **Phantom** - Solana wallet (for Solana-compatible chains)
- **Custom Provider** - Any EIP-1193 compatible wallet

## Connect MetaMask

The easiest way to get started:

```typescript
import { UniswapV4SDK } from '@example/uniswap-v4-sdk';

const uniswap = new UniswapV4SDK({
  rpcUrl: process.env.RPC_URL,
  chainId: 1
});

// Connect MetaMask
const connection = await uniswap.connectWallet();

console.log('Connected:', connection.address);
console.log('Chain:', connection.chainId);
```

## Connect WalletConnect

For mobile and Web3 apps:

```typescript
const uniswap = new UniswapV4SDK({
  rpcUrl: process.env.RPC_URL,
  chainId: 1,
  walletConnect: {
    projectId: process.env.WALLETCONNECT_PROJECT_ID
  }
});

// Show QR code and wait for connection
const connection = await uniswap.connectWallet();
console.log('Connected:', connection.address);
```

## Handle Wallet Events

Respond to wallet changes:

```typescript
// Wallet connection state changes
uniswap.on('connected', (connection) => {
  console.log('Wallet connected:', connection.address);
});

uniswap.on('disconnected', () => {
  console.log('Wallet disconnected');
});

// Account changes
uniswap.on('accountChanged', (newAddress) => {
  console.log('Account changed:', newAddress);
  // Refresh UI with new account
});

// Chain changes
uniswap.on('chainChanged', (newChainId) => {
  console.log('Chain changed:', newChainId);
  // Update for new chain
});
```

## Wallet State Tracking

Always check wallet state before operations:

```typescript
const state = await uniswap.getWalletState();

switch (state) {
  case 'disconnected':
    console.log('Please connect wallet');
    break;
  case 'connected':
    // Ready for operations
    break;
  case 'wrong_chain':
    console.log('Please switch to Ethereum mainnet');
    break;
  case 'connection_failed':
    console.log('Connection failed, try again');
    break;
}
```

## Security Best Practices

- Never share your private keys
- Only connect wallets you trust
- Verify contract addresses before signing
- Check transaction details before confirming
- Use hardware wallets for large amounts
- Enable transaction signing verification in MetaMask

---

#  Usage Examples

Complete code examples for common tasks.

## Beginner Examples

Great for learning the basics.

### Check Your Token Balance

Query your token holdings without sending transactions:

```typescript
import { UniswapV4SDK } from '@example/uniswap-v4-sdk';
import { parseUnits } from 'ethers';

const uniswap = new UniswapV4SDK({
  rpcUrl: process.env.RPC_URL,
  chainId: 1
});

async function checkBalance() {
  // No wallet needed for read operations
  const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  
  const balance = await uniswap.balanceOf(USDC);
  console.log(`USDC Balance: ${balance}`);
}

checkBalance();
```

**Output:**

```
USDC Balance: 1500.50
```

**Explanation:**

This is a read operation - no wallet connection needed. The balance is queried directly from the blockchain.

### Get Token Price via Uniswap

Query the current price of one token in terms of another:

```typescript
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

const quote = await uniswap.quoteSwap({
  tokenIn: USDC,
  tokenOut: DAI,
  amountIn: parseUnits('1000', 6) // 1000 USDC
});

console.log(`1000 USDC = ${quote.amountOut} DAI`);
console.log(`Price: ${quote.executionPrice} DAI per USDC`);
```

**Explanation:**

Read operation to get price information. Useful for price checking, alerts, or calculations without committing to a transaction.

### Connect to Wallet

Establish wallet connection:

```typescript
// Connect wallet (user will approve in MetaMask)
const connection = await uniswap.connectWallet();

console.log('Connected address:', connection.address);
console.log('Connected to chain:', connection.chainId);
console.log('Network:', connection.network);
```

**Explanation:**

Wallet connection is required for state-changing operations. This establishes the connection and gets the user's address.

## Intermediate Examples

Build on the basics with more complex scenarios.

### Execute a Simple Swap

Swap tokens with proper error handling:

```typescript
import { UniswapV4SDK } from '@example/uniswap-v4-sdk';
import { parseUnits, formatUnits } from 'ethers';

const uniswap = new UniswapV4SDK({
  rpcUrl: process.env.RPC_URL,
  chainId: 1
});

async function executeSwap() {
  // Step 1: Connect wallet
  const connection = await uniswap.connectWallet();
  console.log('Connected:', connection.address);

  const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  const amountIn = parseUnits('1000', 6); // 1000 USDC

  // Step 2: Check balance
  const balance = await uniswap.balanceOf(USDC);
  if (balance < amountIn) {
    console.error('Insufficient balance');
    return;
  }

  // Step 3: Get gas estimate
  const gasEstimate = await uniswap.estimateGasForSwap({
    tokenIn: USDC,
    tokenOut: DAI,
    amountIn
  });

  console.log(`Estimated gas: ${gasEstimate.gasEstimate}`);
  console.log(`Gas cost: $${gasEstimate.usdCost}`);

  // Step 4: Execute swap
  const tx = await uniswap.swap({
    tokenIn: USDC,
    tokenOut: DAI,
    amountIn,
    minAmountOut: parseUnits('990', 18) // Slippage tolerance
  });

  console.log(`Transaction submitted: ${tx.hash}`);

  // Step 5: Wait for confirmation
  const receipt = await uniswap.waitForConfirmation(tx.hash);
  console.log(`✓ Swap confirmed!`);
  console.log(`Block: ${receipt.blockNumber}`);
  console.log(`Gas used: ${receipt.gasUsed}`);
}

executeSwap().catch(error => {
  console.error('Swap failed:', error.message);
});
```

**Explanation:**

Full swap flow: connect wallet  check balance  estimate gas  execute  confirm. Each step has explicit error checking.

### Monitor Swap Events

Subscribe to swap events and react:

```typescript
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

// Subscribe to swaps
const subscription = await uniswap.onSwap({
  tokenIn: USDC,
  tokenOut: DAI
});

subscription.on('swap', (event) => {
  console.log(`Swap detected!`);
  console.log(`Amount in: ${event.amountIn}`);
  console.log(`Amount out: ${event.amountOut}`);
  console.log(`Sender: ${event.sender}`);
});

// Stop listening
setTimeout(() => {
  subscription.unsubscribe();
  console.log('Stopped listening');
}, 60000);
```

**Explanation:**

Event subscriptions with automatic reorg detection. Helpful for tracking transactions, creating alerts, or building dashboards.

## Advanced Examples

Powerful patterns for complex use cases.

### Manage Token Approval

Handle token approval for DEX trading:

```typescript
async function manageApproval(tokenAddress: string, spenderAddress: string, amount: string) {
  // Check current allowance
  let allowance = await uniswap.allowance(tokenAddress);
  
  if (allowance < parseUnits(amount, 18)) {
    console.log('Need to approve token spending');

    // Get gas estimate for approval
    const gasEstimate = await uniswap.estimateGasForApprove({
      token: tokenAddress,
      amount: parseUnits(amount, 18)
    });

    console.log(`Approval gas cost: $${gasEstimate.usdCost}`);

    // Execute approval
    const approveTx = await uniswap.approve({
      token: tokenAddress,
      amount: parseUnits(amount, 18)
    });

    console.log(`Approval tx: ${approveTx.hash}`);

    // Wait for approval confirmation
    const receipt = await uniswap.waitForConfirmation(approveTx.hash);
    console.log('✓ Approval confirmed');

    // Verify allowance
    allowance = await uniswap.allowance(tokenAddress);
    console.log(`New allowance: ${allowance}`);
  } else {
    console.log('Already approved');
  }
}
```

**Explanation:**

Approval flow: check current allowance  estimate gas  approve  wait for confirmation  verify. Handles both case where approval is needed and where it's already sufficient.

### Dollar Cost Averaging (DCA) Bot

Execute periodic swaps at regular intervals:

```typescript
import { CronJob } from 'cron';

class DCABot {
  constructor(private uniswap: UniswapV4SDK) {}

  async start(
    tokenIn: string,
    tokenOut: string,
    amountPerSwap: string,
    intervalMinutes: number
  ) {
    // Run every X minutes
    const job = new CronJob(`*/${intervalMinutes} * * * *`, async () => {
      try {
        // Execute swap
        const tx = await this.executeSwap(tokenIn, tokenOut, amountPerSwap);

        console.log(`DCA swap executed: ${tx.hash}`);

        // Wait for confirmation
        const receipt = await this.uniswap.waitForConfirmation(tx.hash);
        console.log(`✓ DCA swap confirmed in block ${receipt.blockNumber}`);

        // Log metrics
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log(`Gas used: ${receipt.gasUsed}`);
      } catch (error) {
        if (error.code === 'INSUFFICIENT_FUNDS') {
          console.warn('Insufficient balance for DCA swap');
        } else {
          console.error('DCA swap failed:', error.message);
        }
      }
    });

    job.start();
    console.log(`DCA bot started - swap every ${intervalMinutes} minutes`);
  }

  private async executeSwap(
    tokenIn: string,
    tokenOut: string,
    amountStr: string
  ) {
    const amount = parseUnits(amountStr, 18);

    return await this.uniswap.swap({
      tokenIn,
      tokenOut,
      amountIn: amount,
      minAmountOut: '0' // Accept any price (risky - don't use in production)
    });
  }
}

// Usage
const bot = new DCABot(uniswap);
await bot.start(
  USDC,
  DAI,
  '100', // 100 USDC per swap
  60     // Every 60 minutes
);
```

**Explanation:**

Advanced pattern for autonomous trading. Shows how to schedule operations, handle errors gracefully, and log metrics.

### Multi-Hop Swap Route

Execute complex swaps through multiple pools:

```typescript
async function multiHopSwap(
  tokenIn: string,
  tokenOut: string,
  amountIn: string,
  route: string[] // Intermediate tokens
) {
  const amount = parseUnits(amountIn, 18);

  // Build swap route
  const path = [tokenIn, ...route, tokenOut];
  console.log(`Swap route: ${path.map(t => t.slice(0, 6)).join('  ')}`);

  // Estimate through entire route
  let currentAmount = amount;
  for (let i = 0; i < path.length - 1; i++) {
    const quote = await uniswap.quoteSwap({
      tokenIn: path[i],
      tokenOut: path[i + 1],
      amountIn: currentAmount
    });

    console.log(`Hop ${i + 1}: ${formatUnits(currentAmount, 18)}  ${formatUnits(quote.amountOut, 18)}`);
    currentAmount = quote.amountOut;
  }

  // Execute multi-hop swap
  const tx = await uniswap.multiHopSwap({
    path,
    amountIn: amount,
    minAmountOut: currentAmount * 0.99n // 1% slippage
  });

  console.log(`Multi-hop swap submitted: ${tx.hash}`);

  // Monitor through completion
  const receipt = await uniswap.waitForConfirmation(tx.hash);
  console.log(`✓ Multi-hop swap completed`);

  return receipt;
}
```

**Explanation:**

Complex swaps through multiple pools. Shows how to build routes, estimate through each hop, and execute complex operations.

---

#  Error Handling

Understanding and handling errors from the SDK.

## Error Types

### Wallet Errors

#### WALLET_NOT_CONNECTED

**Description:** Wallet is not connected

**Cause:** Trying to execute write operation without wallet connection

**Solution:** Call `connectWallet()` before making transactions

**Example:**

```typescript
try {
  const tx = await uniswap.swap({...});
} catch (error) {
  if (error.code === 'WALLET_NOT_CONNECTED') {
    const connection = await uniswap.connectWallet();
    console.log('Wallet connected:', connection.address);
  }
}
```

#### WRONG_CHAIN

**Description:** Wallet is connected to wrong blockchain

**Cause:** Wallet is on different chain than SDK expects

**Solution:** Switch wallet to correct chain

**Example:**

```typescript
try {
  const tx = await uniswap.swap({...});
} catch (error) {
  if (error.code === 'WRONG_CHAIN') {
    console.log(`Switch wallet to chain ${error.expectedChainId}`);
    const result = await uniswap.switchChain(error.expectedChainId);
    console.log('Chain switched');
  }
}
```

### Transaction Errors

#### INSUFFICIENT_FUNDS

**Description:** Wallet doesn't have enough funds for transaction

**Cause:** Insufficient gas or insufficient input tokens

**Solution:** Check balance and add funds if needed

**Example:**

```typescript
try {
  const tx = await uniswap.swap({...});
} catch (error) {
  if (error.code === 'INSUFFICIENT_FUNDS') {
    const balance = await uniswap.balanceOf(tokenAddress);
    console.log(`Current balance: ${balance}`);
    console.log(`Please add more funds`);
  }
}
```

#### SLIPPAGE_EXCEEDED

**Description:** Price moved too much, swap would fail

**Cause:** Market moved significantly since quote

**Solution:** Get fresh quote and increase slippage tolerance slightly

**Example:**

```typescript
const quote = await uniswap.quoteSwap({
  tokenIn: USDC,
  tokenOut: DAI,
  amountIn: parseUnits('1000', 6)
});

try {
  const tx = await uniswap.swap({
    tokenIn: USDC,
    tokenOut: DAI,
    amountIn: parseUnits('1000', 6),
    minAmountOut: quote.amountOut * 0.99n // Allow 1% slippage
  });
} catch (error) {
  if (error.code === 'SLIPPAGE_EXCEEDED') {
    // Retry with fresh quote
    const newQuote = await uniswap.quoteSwap({...});
    // Try again
  }
}
```

### Network Errors

#### TRANSACTION_REVERTED

**Description:** Transaction was reverted by the blockchain

**Cause:** Contract execution failed (math error, insufficient liquidity, etc.)

**Solution:** Check error reason and adjust parameters

**Example:**

```typescript
try {
  const tx = await uniswap.swap({...});
} catch (error) {
  if (error.code === 'TRANSACTION_REVERTED') {
    console.log(`Revert reason: ${error.reason}`);
    if (error.reason.includes('InsufficientLiquidity')) {
      console.log('Not enough liquidity for this swap');
    }
  }
}
```

#### BLOCK_CONFIRMATION_TIMEOUT

**Description:** Transaction took too long to confirm

**Cause:** Network congestion or low gas price

**Solution:** Check transaction status and potentially resubmit

**Example:**

```typescript
try {
  const receipt = await uniswap.waitForConfirmation(txHash, {
    timeout: 5 * 60 * 1000, // 5 minutes
    requiredConfirmations: 12
  });
} catch (error) {
  if (error.code === 'BLOCK_CONFIRMATION_TIMEOUT') {
    const status = await uniswap.getTransactionStatus(txHash);
    console.log('Status:', status);
    if (status === 'pending') {
      console.log('Still pending, can wait longer');
    }
  }
}
```

## Recovery Strategies

### Retry Failed Swaps

```typescript
async function swapWithRetry(params: SwapParams, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await uniswap.swap(params);
    } catch (error) {
      if (attempt === maxRetries) throw error;

      if (error.recoverable) {
        // Wait before retry
        const backoff = Math.pow(2, attempt) * 1000;
        console.log(`Retry ${attempt}/${maxRetries} after ${backoff}ms`);
        await sleep(backoff);
      } else {
        throw error; // Non-recoverable error
      }
    }
  }
}
```

## Best Practices

- Always wrap swap calls in try-catch
- Check error codes to determine recovery strategy
- Validate gas estimates before execution
- Monitor transaction status explicitly
- Use appropriate slippage tolerance
- Log all errors with full context
- Implement exponential backoff for retries

---

#  Troubleshooting

## Common Issues

### "Wallet Not Connected" Error

**Problem:** Getting `WALLET_NOT_CONNECTED` error

**Solutions:**
1. Call `connectWallet()` before swap
2. Check MetaMask is installed and accessible
3. Try disconnecting and reconnecting
4. Check browser permissions for site

### "Wrong Chain" Error

**Problem:** Getting `WRONG_CHAIN` error

**Solutions:**
1. Switch MetaMask to Ethereum mainnet
2. Or, call `switchChain()` to switch programmatically
3. Check you're using correct `chainId` in SDK config
4. Verify MetaMask supports the chain

### "Slippage Exceeded" Error

**Problem:** Swap fails with slippage exceeded

**Solutions:**
1. Get a fresh price quote (prices change)
2. Increase slippage tolerance (1-3% typical)
3. Try swapping smaller amounts
4. Check liquidity for this pair
5. Wait for less congested times

### "Insufficient Funds" Error

**Problem:** Transaction fails due to insufficient funds

**Solutions:**
1. Check ETH balance for gas fees
2. Check token balance for swap input
3. Add funds to wallet
4. Reduce swap amount
5. Try lower gas price

### "Transaction Reverted" Error

**Problem:** Transaction fails with revert

**Solutions:**
1. Check error reason in details
2. Verify liquidity exists for swap
3. Ensure token approvals are sufficient
4. Check contract isn't paused
5. Try with different slippage tolerance

### MetaMask Not Responding

**Problem:** MetaMask hangs or doesn't respond

**Solutions:**
1. Restart MetaMask extension
2. Restart browser
3. Check for browser updates
4. Try different browser
5. Check network connectivity

---

##  License

This SDK is licensed under the MIT License - see LICENSE file for details.
