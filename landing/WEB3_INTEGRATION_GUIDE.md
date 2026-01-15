# FOST Web3 Integration Guide

## Overview

FOST now includes complete Web3 integration with MetaMask wallet support for the SaaS platform. This allows users to:

1. Connect their Ethereum wallet
2. Select the chain they want to generate SDKs for
3. Pull contract ABIs directly from on-chain contracts
4. Generate multi-chain Web3 SDKs

## Architecture

### Context Providers

**Web3Context** (`app/platform/auth/web3-context.tsx`)
- Manages wallet connection state
- Handles chain switching
- Detects MetaMask availability
- Safe initialization (no errors if MetaMask not installed)

**AuthContext** (`app/platform/auth/auth-context.tsx`)
- Manages user authentication
- Independent from Web3Context (Auth pages don't need wallet)

### Components

**WalletConnect** (`app/platform/components/wallet-connect.tsx`)
- Button to connect/disconnect wallet
- Shows connected address and chain
- Only rendered on dashboard (not auth pages)

**DashboardHeader** (`app/platform/components/dashboard-header.tsx`)
- Includes WalletConnect component
- Shows user credits, plan, and wallet status

**SDKGeneratorForm** (`app/platform/components/sdk-generator-form.tsx`)
- Web3 toggle to enable smart contract mode
- Chain selection with MetaMask warnings
- Contract address input
- Shows connected wallet info

### Layouts

**Platform Layout** (`app/platform/layout.tsx`)
- Wraps all platform pages with AuthProvider
- Does NOT include Web3Provider (prevents MetaMask calls on auth pages)

**Dashboard Layout** (`app/platform/dashboard/layout.tsx`)
- Wraps dashboard with Web3Provider
- Enables wallet connection only on dashboard

**Auth Layouts** (login, signup)
- No Web3Provider
- Clean auth experience without wallet prompts

## Error Handling

The MetaMask integration includes safe error handling:

```
✓ MetaMask not installed → Shows friendly message
✓ User rejects connection → Silently ignored
✓ Invalid requests → Debug logging only
✓ Chain switching failures → Logged, user continues
✓ Network errors → Graceful degradation
```

## Usage Examples

### For Users

**Connecting Wallet (from Dashboard)**
```
1. Click "Connect Wallet" in top right
2. MetaMask popup appears
3. Select account and approve
4. Wallet shows connected
5. Select chain and enter contract address
6. Generate SDK
```

**Switching Chains**
If wallet is on wrong chain:
```
1. Warning appears: "Wallet connected to Ethereum, switch to generate"
2. User clicks chain selector in MetaMask
3. Warning disappears
4. User can now generate for that chain
```

### For Developers

**Using the Web3Context**
```typescript
import { useWeb3 } from '../auth/web3-context';

export function MyComponent() {
  const { 
    address,           // User's wallet address
    chainId,           // Current chain ID
    isConnected,       // Boolean
    isConnecting,      // During connection
    connectWallet,     // Function to connect
    disconnectWallet,  // Function to disconnect
    switchChain        // Function to switch chain
  } = useWeb3();

  // Only works inside Web3Provider!
  // Use only in dashboard, not in auth pages
}
```

**Creating a Web3 Component**
```typescript
'use client';

import { useWeb3 } from '@/platform/auth/web3-context';

export function MyWeb3Component() {
  const { address, chainId, connectWallet } = useWeb3();

  if (!address) {
    return <button onClick={connectWallet}>Connect</button>;
  }

  return <div>{address} on chain {chainId}</div>;
}
```

## Security Notes

1. **No auto-connection:** App doesn't connect to MetaMask on load
2. **Isolated contexts:** Auth and Web3 are separate
3. **Safe initialization:** Checks for MetaMask availability first
4. **User control:** Only connects when user explicitly clicks button
5. **No sensitive data:** Wallet only used for display and chain info

## Supported Chains

```
- Ethereum (1)
- Polygon (137)
- Arbitrum (42161)
- Optimism (10)
- Base (8453)
- BSC (56)
```

Add more chains in `sdk-generator-form.tsx`:
```typescript
const chains = [
  { id: '1', name: 'Ethereum', symbol: 'ETH' },
  // Add more here
];
```

## Testing

### Test without MetaMask
1. Use incognito window (no extensions)
2. Should see "Install MetaMask" message
3. Dashboard still works

### Test with MetaMask
1. Connect wallet
2. See address and chain displayed
3. Try different chains
4. Generate SDK for Web3 contract

### Test Auth Flow
1. Signup page should NOT ask for wallet
2. Login page should NOT ask for wallet
3. Only dashboard shows wallet connect button

## Troubleshooting

### Error: "Failed to connect to MetaMask"
**Cause:** MetaMask extension not properly initialized
**Solution:** 
- Refresh page
- Restart MetaMask
- Disable/re-enable extension

### Error: "Cannot read property 'ethereum' of undefined"
**Cause:** Accessing MetaMask before it's loaded
**Solution:** Already handled - this should not appear

### Wallet connects but shows wrong address
**Cause:** Multiple accounts in MetaMask
**Solution:** Select correct account in MetaMask popup

### Chain selector shows wrong chain
**Cause:** Browser cached old chain info
**Solution:** 
- Switch chain in MetaMask
- Refresh page
- Disconnect and reconnect

## Future Enhancements

1. **Multi-wallet support**
   - WalletConnect (WC v2)
   - Coinbase Wallet
   - Ledger
   - Trezor

2. **Advanced features**
   - Read contract state
   - Simulate transactions
   - Gas optimization
   - Multi-sig support

3. **Integrations**
   - Etherscan for ABI fetching
   - ENS name support
   - Mainnet/testnet switching
   - Custom RPC endpoints

4. **Analytics**
   - Track wallet connects
   - Popular chains/contracts
   - SDK generation patterns

## API Reference

### Web3Context Methods

```typescript
connectWallet(): Promise<void>
- Requests user to connect wallet
- Sets address and chainId
- Throws on user rejection

disconnectWallet(): void
- Clears address and chainId
- Local state only (wallet still connected)

switchChain(chainId: number): Promise<void>
- Requests chain switch in MetaMask
- Updates chainId state
- Fails silently if chain not available
```

### Web3Context State

```typescript
address: string | null
- User's connected wallet address
- Format: 0x... (40 hex chars)
- null if not connected

chainId: number | null  
- Current chain ID
- Examples: 1 (ETH), 137 (Polygon)
- null if not connected

isConnected: boolean
- True if address is not null
- Used for conditional rendering

isConnecting: boolean
- True during connection attempt
- Use to disable buttons during connection
```

## Files Modified/Created

```
landing/
├── tailwind.config.ts (monospace fonts)
├── app/
│   ├── platform/
│   │   ├── layout.tsx (AuthProvider)
│   │   ├── auth/
│   │   │   ├── auth-context.tsx (updated)
│   │   │   ├── web3-context.tsx (NEW)
│   │   │   ├── login/page.tsx (fixed)
│   │   │   └── signup/page.tsx (fixed)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx (Web3Provider)
│   │   │   └── page.tsx (updated)
│   │   ├── api/
│   │   │   ├── auth-handlers.ts (updated)
│   │   │   └── sdk-service.ts (updated)
│   │   └── components/
│   │       ├── dashboard-header.tsx (+ WalletConnect)
│   │       ├── sdk-generator-form.tsx (+ Web3 form)
│   │       └── wallet-connect.tsx (NEW)
│   ├── components/
│   │   ├── Hero.tsx (Web3 messaging)
│   │   └── navbar.tsx (NEW)
│   ├── web3-docs/
│   │   └── page.tsx (NEW)
│   ├── pricing/
│   │   └── page.tsx (NEW)
│   └── page.tsx (+ navbar)
```

## Next Steps

1. **Backend Integration**
   - Connect to real authentication
   - Store wallet addresses
   - Fetch ABIs from Etherscan

2. **SDK Generation**
   - Call FOST backend for real generation
   - Return generated files
   - Track usage/credits

3. **Payments**
   - Integrate Stripe
   - Credit system
   - Usage tracking

4. **Analytics**
   - Track user behavior
   - Monitor SDK generation
   - Chain/language preferences
