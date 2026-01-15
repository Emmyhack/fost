'use client';

import Link from 'next/link';

export default function Web3OverviewPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-sm font-mono text-gray-600 mb-4">
          <Link href="/docs" className="text-accent-green hover:underline">Docs</Link>
          {' / '}
          <Link href="/docs/web3/overview" className="text-accent-green hover:underline">Web3 & Smart Contracts</Link>
          {' / Overview'}
        </div>
        <h1 className="text-4xl font-bold font-mono mb-4">Web3 Smart Contract SDKs</h1>
        <p className="text-lg text-gray-600">
          Generate production-ready SDKs from Solidity smart contract ABIs
        </p>
      </div>

      <div className="prose prose-sm max-w-none font-mono space-y-8">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Smart Contract SDKs?</h2>
          <p className="text-gray-700 mb-4">
            Smart Contract SDKs are type-safe JavaScript/TypeScript libraries that let you interact with blockchain smart contracts without writing low-level Web3 code. FOST generates SDKs from contract ABIs with:
          </p>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span>Fully typed contract methods</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span>Automatic gas estimation</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span>Built-in error handling</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span>Wallet integration (MetaMask, WalletConnect)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span>Multi-chain support</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span>Event subscriptions</span>
            </li>
          </ul>
        </section>

        {/* Key Features */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-2">Type Safety</h3>
              <p className="text-sm text-gray-600">
                Every contract method, parameter, and return value is fully typed. Catch errors at development time, not runtime.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-2">Gas Estimation</h3>
              <p className="text-sm text-gray-600">
                Automatically estimate transaction gas costs before sending. Know exactly how much you'll spend.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-2">Wallet Integration</h3>
              <p className="text-sm text-gray-600">
                Connect MetaMask, WalletConnect, or any Web3 wallet. Sign transactions with one line of code.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-2">Multi-Chain Support</h3>
              <p className="text-sm text-gray-600">
                Deploy to Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, and more with zero code changes.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-2">Event Subscriptions</h3>
              <p className="text-sm text-gray-600">
                Subscribe to contract events with real-time updates. Listen for transfers, approvals, swaps, etc.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-2">Error Handling</h3>
              <p className="text-sm text-gray-600">
                Built-in error handling for reverts, gas estimation failures, and network issues.
              </p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Use Cases</h2>

          <div className="space-y-4">
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 p-4">
              <h3 className="font-bold text-gray-900 mb-2">DeFi Applications</h3>
              <p className="text-sm text-gray-700 mb-3">
                Build trading bots, yield farming dashboards, and liquidity pool managers.
              </p>
              <p className="text-xs text-gray-600">
                Example: Uniswap SDK for token swaps, price quotes, and position management
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4">
              <h3 className="font-bold text-gray-900 mb-2">NFT Platforms</h3>
              <p className="text-sm text-gray-700 mb-3">
                Create marketplaces, minting interfaces, and collection managers.
              </p>
              <p className="text-xs text-gray-600">
                Example: ERC-721/1155 SDK for minting, trading, and managing collections
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-4">
              <h3 className="font-bold text-gray-900 mb-2">DAO Governance</h3>
              <p className="text-sm text-gray-700 mb-3">
                Build voting interfaces and treasury management tools.
              </p>
              <p className="text-xs text-gray-600">
                Example: Governor SDK for proposal creation, voting, and execution
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
              <h3 className="font-bold text-gray-900 mb-2">Wallet Applications</h3>
              <p className="text-sm text-gray-700 mb-3">
                Develop portfolio trackers and transaction builders.
              </p>
              <p className="text-xs text-gray-600">
                Example: Portfolio dashboard reading multiple token balances and prices
              </p>
            </div>
          </div>
        </section>

        {/* Supported Chains */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Supported Blockchain Networks</h2>
          <p className="text-gray-700 mb-4">
            FOST supports generating SDKs for multiple EVM-compatible chains:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'Ethereum', chainId: '1', rpc: 'eth' },
              { name: 'Polygon', chainId: '137', rpc: 'matic' },
              { name: 'Arbitrum', chainId: '42161', rpc: 'arb' },
              { name: 'Optimism', chainId: '10', rpc: 'opt' },
              { name: 'Base', chainId: '8453', rpc: 'base' },
              { name: 'BSC', chainId: '56', rpc: 'bsc' },
            ].map((chain) => (
              <div key={chain.chainId} className="rounded-lg border border-gray-200 p-3 hover:border-accent-green transition">
                <p className="font-bold text-gray-900">{chain.name}</p>
                <p className="text-xs text-gray-600">Chain ID: {chain.chainId}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Example */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Example</h2>
          <p className="text-gray-700 mb-3">
            Here's how simple it is to interact with a contract using a generated SDK:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { UniswapSDK } from '@uniswap-sdk';
import { getEthereumProvider } from './provider';

// Initialize SDK
const provider = getEthereumProvider(); // MetaMask
const uniswap = new UniswapSDK(provider, {
  chainId: 1, // Ethereum
  routerAddress: '0x...'
});

// Get price quote
const quote = await uniswap.getQuote({
  tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  amountIn: '1000000000' // 1000 USDC
});

console.log('Quote:', quote);
// { amountOut: '0.5', priceImpact: 0.2 }

// Execute swap
const tx = await uniswap.swap({
  tokenIn: '0xA0b...',
  tokenOut: '0xC02...',
  amountIn: '1000000000',
  minAmountOut: quote.amountOut,
  recipient: '0xUser...'
});

console.log('Swap executed:', tx.hash);`}</pre>
          </div>
        </section>

        {/* Getting Started */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
          <ol className="space-y-3 list-decimal list-inside text-gray-700">
            <li>
              <span className="font-bold">Get Contract ABI</span>
              <p className="text-sm text-gray-600 ml-6 mt-1">
                Find on Etherscan, OpenZeppelin, or from your contract source
              </p>
            </li>
            <li>
              <span className="font-bold">Generate SDK</span>
              <p className="text-sm text-gray-600 ml-6 mt-1">
                Upload ABI to FOST, select chain and language
              </p>
            </li>
            <li>
              <span className="font-bold">Install & Use</span>
              <p className="text-sm text-gray-600 ml-6 mt-1">
                Import into your app and start calling contract methods
              </p>
            </li>
          </ol>
        </section>

        {/* Learn More */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Learn More</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/docs/web3/contract-abis"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">Contract ABIs</h3>
              <p className="text-sm text-gray-600">Working with contract ABIs</p>
            </Link>

            <Link 
              href="/docs/web3/wallet-integration"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">Wallet Integration</h3>
              <p className="text-sm text-gray-600">Connect MetaMask and other wallets</p>
            </Link>

            <Link 
              href="/docs/web3/gas-estimation"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">Gas Estimation</h3>
              <p className="text-sm text-gray-600">Estimate transaction costs</p>
            </Link>

            <Link 
              href="/docs/guides/defi-sdk"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">DeFi Example</h3>
              <p className="text-sm text-gray-600">Build a complete DeFi SDK</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
