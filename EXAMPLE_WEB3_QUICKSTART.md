#  Uniswap V4 SDK Quickstart

Get up and running with the Uniswap SDK in 5 minutes.

## Prerequisites

- Node.js 14+ (for JavaScript/TypeScript)
- MetaMask or WalletConnect installed (for wallet connection)
- Testnet ETH or actual ETH depending on your needs
- Your RPC endpoint URL (from Alchemy, Infura, or similar)

## Installation & Setup

### Step 1: Install the SDK

```bash
npm install @example/uniswap-v4-sdk
```

### Step 2: Get Your RPC URL

Create a free account at:
- [Alchemy](https://www.alchemy.com)
- [Infura](https://www.infura.io)
- [QuickNode](https://www.quicknode.com)

Then set the environment variable:

```bash
export RPC_URL="https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY"
```

### Step 3: Connect Your Wallet

The SDK will guide you through MetaMask or WalletConnect connection when you call `connectWallet()`.

## Your First Request

### Read Operation (No Wallet Needed)

```typescript
import { UniswapV4SDK } from '@example/uniswap-v4-sdk';
import { parseUnits, formatUnits } from 'ethers';

// Create SDK instance (read-only, no wallet needed)
const uniswap = new UniswapV4SDK({
  rpcUrl: process.env.RPC_URL,
  chainId: 1 // Ethereum mainnet
});

async function checkPrice() {
  const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

  // Get price without wallet connection
  const quote = await uniswap.quoteSwap({
    tokenIn: USDC,
    tokenOut: DAI,
    amountIn: parseUnits('1000', 6)
  });

  const price = formatUnits(quote.amountOut, 18);
  console.log(`1000 USDC = ${price} DAI`);
}

checkPrice();
```

 Success! You can query prices without a wallet.

### Write Operation (Wallet Required)

```typescript
import { UniswapV4SDK } from '@example/uniswap-v4-sdk';
import { parseUnits } from 'ethers';

// Create SDK instance
const uniswap = new UniswapV4SDK({
  rpcUrl: process.env.RPC_URL,
  chainId: 1
});

async function executeSwap() {
  // Step 1: Connect wallet
  console.log('Connecting wallet...');
  const connection = await uniswap.connectWallet();
  console.log(`✓ Connected: ${connection.address}`);

  // Step 2: Estimate gas
  const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  const DAI = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

  const gasEstimate = await uniswap.estimateGasForSwap({
    tokenIn: USDC,
    tokenOut: DAI,
    amountIn: parseUnits('100', 6)
  });

  console.log(`Gas cost: $${gasEstimate.usdCost}`);

  // Step 3: Execute swap
  console.log('Executing swap...');
  const tx = await uniswap.swap({
    tokenIn: USDC,
    tokenOut: DAI,
    amountIn: parseUnits('100', 6),
    minAmountOut: parseUnits('99', 18) // 1% slippage
  });

  console.log(`✓ Swap submitted: ${tx.hash}`);

  // Step 4: Wait for confirmation
  console.log('Waiting for confirmation...');
  const receipt = await uniswap.waitForConfirmation(tx.hash);
  console.log(`✓ Swap confirmed! Block: ${receipt.blockNumber}`);
}

executeSwap().catch(error => {
  console.error('Error:', error.message);
});
```

 Success! You executed your first swap.

## Common Tasks

### Example 1: Check Your Token Balance

```typescript
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

// Wallet must be connected first
await uniswap.connectWallet();

const balance = await uniswap.balanceOf(USDC);
console.log(`USDC Balance: ${formatUnits(balance, 6)}`);
```

### Example 2: Get Price Quote

```typescript
const quote = await uniswap.quoteSwap({
  tokenIn: USDC,
  tokenOut: DAI,
  amountIn: parseUnits('1000', 6)
});

console.log(`Amount out: ${formatUnits(quote.amountOut, 18)} DAI`);
console.log(`Price: ${quote.executionPrice} DAI per USDC`);
console.log(`Slippage: ${quote.priceImpact}%`);
```

### Example 3: Check Token Allowance

```typescript
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

const allowance = await uniswap.allowance(USDC);
console.log(`Current allowance: ${formatUnits(allowance, 6)} USDC`);

if (allowance < parseUnits('1000', 6)) {
  console.log('Need to approve for swapping');
}
```

### Example 4: Approve Token Spending

```typescript
// Approve spending of tokens
const approveTx = await uniswap.approve({
  token: USDC,
  amount: parseUnits('10000', 6)
});

console.log(`Approval submitted: ${approveTx.hash}`);

// Wait for confirmation
const receipt = await uniswap.waitForConfirmation(approveTx.hash);
console.log('✓ Approval confirmed');
```

### Example 5: Monitor Swap Events

```typescript
// Listen for swap events
const subscription = await uniswap.onSwap({
  tokenIn: USDC,
  tokenOut: DAI
});

subscription.on('swap', (event) => {
  console.log(`Swap: ${event.amountIn}  ${event.amountOut}`);
});

// Stop listening after 5 minutes
setTimeout(() => {
  subscription.unsubscribe();
}, 5 * 60 * 1000);
```

### Example 6: Handle Errors

```typescript
try {
  const tx = await uniswap.swap({...});
} catch (error) {
  if (error.code === 'WALLET_NOT_CONNECTED') {
    console.log('Please connect wallet first');
  } else if (error.code === 'WRONG_CHAIN') {
    console.log('Switch to Ethereum mainnet');
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    console.log('Not enough balance');
  } else if (error.code === 'SLIPPAGE_EXCEEDED') {
    console.log('Price moved too much, try again');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Understanding Transaction States

Every swap goes through these states:

1. **PENDING_SUBMISSION** - Being prepared for broadcast
2. **SUBMITTED** - Sent to network, waiting for inclusion
3. **INCLUDED_IN_BLOCK** - Included in a block but not finalized
4. **FINALIZED** - Confirmed by the network consensus
5. **CONFIRMED** - Received sufficient confirmations

```typescript
// The SDK handles this automatically
const receipt = await uniswap.waitForConfirmation(txHash);

console.log(`Status: ${receipt.status}`); // "confirmed"
console.log(`Block: ${receipt.blockNumber}`);
console.log(`Confirmations: ${receipt.confirmations}`);
```

## Multi-Chain Support

The SDK works on multiple chains. Just change the `chainId`:

```typescript
// Ethereum mainnet
const ethereum = new UniswapV4SDK({
  rpcUrl: process.env.ETH_RPC,
  chainId: 1
});

// Arbitrum
const arbitrum = new UniswapV4SDK({
  rpcUrl: process.env.ARB_RPC,
  chainId: 42161
});

// Optimism
const optimism = new UniswapV4SDK({
  rpcUrl: process.env.OPT_RPC,
  chainId: 10
});
```

## Gas Estimation

Always estimate before swapping:

```typescript
const gasEstimate = await uniswap.estimateGasForSwap({
  tokenIn: USDC,
  tokenOut: DAI,
  amountIn: parseUnits('1000', 6)
});

console.log(`Gas estimate: ${gasEstimate.gasEstimate}`);
console.log(`Gas price (wei): ${gasEstimate.gasPrice}`);
console.log(`Max cost: $${gasEstimate.usdCost}`);
console.log(`Speed: ${gasEstimate.speed}`); // "fast", "standard", "slow"
```

## Wallet Events

React to wallet changes:

```typescript
// Wallet connected
uniswap.on('connected', (connection) => {
  console.log('Connected:', connection.address);
});

// Wallet disconnected
uniswap.on('disconnected', () => {
  console.log('Disconnected');
});

// Account changed
uniswap.on('accountChanged', (newAddress) => {
  console.log('New account:', newAddress);
});

// Chain changed
uniswap.on('chainChanged', (newChainId) => {
  console.log('New chain:', newChainId);
});
```

## Next Steps

-  Read the [full documentation](./docs/)
-  Learn about [wallet setup](./docs/WALLET_SETUP.md)
-  Browse [more examples](./docs/EXAMPLES.md)
-  Understand [error handling](./docs/ERROR_HANDLING.md)
-  Check [troubleshooting](./docs/TROUBLESHOOTING.md)

## Key Differences from Traditional SDKs

**Explicit State Tracking**
- Every transaction state is visible
- You control how long to wait for confirmation
- No hidden async operations

**Wallet First**
- Wallet connection is explicit and required for writes
- Read operations don't need a wallet
- Clear separation of concerns

**Gas Estimation Separate**
- Gas cost estimated before execution
- User can review and approve
- No surprise costs

**Event Subscriptions**
- Monitor transactions with reorg detection
- No polling required
- Automatic reconnection on network changes

## Need Help?

- **GitHub Issues:** [Report bugs](https://github.com/example/uniswap-v4-sdk/issues)
- **Documentation:** [https://docs.example.com/uniswap-v4](https://docs.example.com/uniswap-v4)
- **Discord:** [Join our server](https://discord.gg/example)
- **Email:** support@example.com
