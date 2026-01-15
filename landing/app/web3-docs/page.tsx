'use client';

export default function Web3DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold font-mono mb-4">Web3 SDK Generation</h1>
          <p className="text-lg text-gray-600 font-mono">
            Best-in-class SDK generation for smart contracts across multiple chains.
          </p>
        </div>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold font-mono mb-6">Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="font-mono font-bold text-accent-green mb-2">Smart Contract ABIs</h3>
              <p className="text-sm font-mono text-gray-600">
                Upload your smart contract ABI and FOST generates type-safe SDKs in your preferred language.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="font-mono font-bold text-accent-green mb-2">Multi-Chain Support</h3>
              <p className="text-sm font-mono text-gray-600">
                Works with Ethereum, Polygon, Arbitrum, Optimism, Base, and more.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="font-mono font-bold text-accent-green mb-2">Wallet Integration</h3>
              <p className="text-sm font-mono text-gray-600">
                Built-in support for Ethers.js, Web3.js, and other wallet libraries.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="font-mono font-bold text-accent-green mb-2">Gas Estimation</h3>
              <p className="text-sm font-mono text-gray-600">
                Automatic gas estimation utilities for all contract interactions.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="font-mono font-bold text-accent-green mb-2">Event Subscriptions</h3>
              <p className="text-sm font-mono text-gray-600">
                Real-time event listening with automatic subscription management.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="font-mono font-bold text-accent-green mb-2">Type Safety</h3>
              <p className="text-sm font-mono text-gray-600">
                Full type definitions for all contract functions and events.
              </p>
            </div>
          </div>
        </section>

        {/* Supported Chains */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold font-mono mb-6">Supported Chains</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { name: 'Ethereum', id: 1, icon: 'Ξ' },
              { name: 'Polygon', id: 137, icon: '⬡' },
              { name: 'Arbitrum', id: 42161, icon: '»' },
              { name: 'Optimism', id: 10, icon: 'OP' },
              { name: 'Base', id: 8453, icon: 'Β' },
              { name: 'BSC', id: 56, icon: 'B' },
            ].map((chain) => (
              <div
                key={chain.id}
                className="rounded-lg border border-gray-200 bg-white p-4 text-center font-mono"
              >
                <div className="mb-2 text-2xl font-bold text-accent-green">{chain.icon}</div>
                <div className="font-semibold">{chain.name}</div>
                <div className="text-xs text-gray-500">ChainID: {chain.id}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Supported Languages */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold font-mono mb-6">Supported Languages</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {['TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C#', 'Swift', 'Kotlin'].map(
              (lang) => (
                <div
                  key={lang}
                  className="rounded-lg border border-accent-green bg-green-50 p-4 text-center font-mono font-semibold"
                >
                  {lang}
                </div>
              )
            )}
          </div>
        </section>

        {/* Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold font-mono mb-6">Quick Example</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 overflow-x-auto">
            <pre className="font-mono text-sm">
{`// Generated TypeScript SDK
import { UniswapV4Client } from '@generated/uniswap-v4';

const client = new UniswapV4Client({
  chainId: 1,
  rpcUrl: 'https://eth.public-rpc.com'
});

// Call contract functions with full type safety
const reserves = await client.getReserves('0x...');

// Listen to events
client.on('Swap', (event) => {
  console.log('Swap:', event);
});

// Estimate gas
const gasEstimate = await client.swap({
  token0: '0x...',
  token1: '0x...',
  amount: '1000000000000000000'
}, { estimate: true });`}
            </pre>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <a
            href="/platform/dashboard"
            className="inline-block rounded bg-accent-green px-8 py-4 font-mono font-bold text-white hover:bg-accent-green-dark"
          >
            Start Generating SDKs
          </a>
        </section>
      </div>
    </div>
  );
}
