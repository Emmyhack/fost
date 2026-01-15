'use client';

export default function MultiChainPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Multi-Chain Support</h1>
      <p className="text-lg text-gray-600 mb-8">
        Deploy your SDK to multiple blockchain networks with one click
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Supported Chains</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-lg mb-2">Ethereum</p>
              <p className="text-sm text-gray-600 mb-2">Chain ID: 1</p>
              <p className="text-xs text-gray-500">The original blockchain, most liquidity</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-lg mb-2">Polygon</p>
              <p className="text-sm text-gray-600 mb-2">Chain ID: 137</p>
              <p className="text-xs text-gray-500">Fast, low-cost Layer 2 network</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-lg mb-2">Arbitrum</p>
              <p className="text-sm text-gray-600 mb-2">Chain ID: 42161</p>
              <p className="text-xs text-gray-500">Optimistic rollup with high throughput</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-lg mb-2">Optimism</p>
              <p className="text-sm text-gray-600 mb-2">Chain ID: 10</p>
              <p className="text-xs text-gray-500">OP Stack Layer 2 solution</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-lg mb-2">Base</p>
              <p className="text-sm text-gray-600 mb-2">Chain ID: 8453</p>
              <p className="text-xs text-gray-500">Coinbase's Layer 2 network</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-lg mb-2">BSC</p>
              <p className="text-sm text-gray-600 mb-2">Chain ID: 56</p>
              <p className="text-xs text-gray-500">Binance Smart Chain</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Multi-Chain Usage</h2>
          <p className="text-gray-700 mb-4">Switch chains dynamically in your code:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { MyContractSDK } from './sdk';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const sdk = new MyContractSDK(provider);

// Get current chain
const chainId = await provider.getNetwork();
console.log('Current chain:', chainId.chainId);

// Switch to Polygon
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x89' }] // Polygon
});

// SDK now works on Polygon
const tx = await sdk.transfer({
  to: '0xRecipient',
  amount: '1000000000000000000'
});`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Generate for Multiple Chains</h2>
          <p className="text-gray-700 mb-4">When generating an SDK, select all chains you need:</p>
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-4">
            <p className="text-sm text-gray-700">
              In the FOST Dashboard, when generating a Web3 SDK:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mt-3">
              <li>Upload contract ABI</li>
              <li>Check all chains you want to support</li>
              <li>SDK will handle all chain configurations automatically</li>
            </ol>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Chain-Specific RPC Endpoints</h2>
          <p className="text-gray-700 mb-4">Generated SDKs include optimized RPC endpoints for each chain:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// Automatically handles RPC endpoints
const sdk = new MyContractSDK(provider);

// Switch chains and RPC automatically updates
await window.ethereum.request({
  method: 'wallet_switchEthereumChain',
  params: [{ chainId: '0x137' }] // Polygon
});

// SDK uses Polygon's RPC endpoint automatically
const balance = await sdk.balanceOf('0x...');`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Common Chain IDs</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 font-mono text-sm">
            <p className="mb-2"><span className="text-accent-green">1</span> - Ethereum Mainnet</p>
            <p className="mb-2"><span className="text-accent-green">137</span> - Polygon</p>
            <p className="mb-2"><span className="text-accent-green">42161</span> - Arbitrum</p>
            <p className="mb-2"><span className="text-accent-green">10</span> - Optimism</p>
            <p className="mb-2"><span className="text-accent-green">8453</span> - Base</p>
            <p><span className="text-accent-green">56</span> - BSC</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Verify chain:</strong> Always check current chain before transactions</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Test all chains:</strong> Contract behavior may differ per chain</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Gas optimization:</strong> Different chains have different gas costs</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Network switching:</strong> Handle user switching chains</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
