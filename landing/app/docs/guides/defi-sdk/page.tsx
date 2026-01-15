'use client';

export default function DeFiSDKPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Build a DeFi SDK</h1>
      <p className="text-lg text-gray-600 mb-8">
        Complete guide to building a Uniswap-style token swap SDK
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            In this guide, we'll build an SDK for a decentralized exchange (DEX) that lets users swap tokens, get price quotes, and manage liquidity.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 1: Get the Contract ABI</h2>
          <p className="text-gray-700 mb-4">
            For this example, we'll use Uniswap V3 Router ABI from Etherscan:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Go to <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Etherscan.io</a></li>
            <li>Search for Uniswap V3 Router: <code className="bg-gray-100 px-2 py-1 rounded">0xE592427A0AEce92De3Edee1F18E0157C05861564</code></li>
            <li>Click "Contract" tab</li>
            <li>Copy the ABI JSON</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 2: Generate the SDK</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Go to <a href="/platform/dashboard" className="text-accent-green hover:underline">FOST Dashboard</a></li>
            <li>Click "Generate SDK"</li>
            <li>Toggle "Web3 Smart Contract"</li>
            <li>Select Chain: "Ethereum"</li>
            <li>Paste the Uniswap ABI</li>
            <li>Select Language: "TypeScript"</li>
            <li>Click "Generate"</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 3: Use the Generated SDK</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { UniswapV3RouterSDK } from './sdk';
import { BrowserProvider, parseEther } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const uniswap = new UniswapV3RouterSDK(signer);

// Swap USDC for ETH
const tx = await uniswap.exactInputSingle({
  tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  fee: 3000, // 0.3%
  recipient: await signer.getAddress(),
  deadline: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
  amountIn: parseEther('1000'), // 1000 USDC
  amountOutMinimum: 0 // Accept any amount (not recommended!)
});

console.log('Swap executed:', tx.hash);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 4: Add Price Quotes</h2>
          <p className="text-gray-700 mb-4">
            Create a helper function to get quotes before swapping:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { ethers } from 'ethers';

async function getPriceQuote(
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint
): Promise<bigint> {
  // Call the quoter contract
  // (in real implementation, would use Uniswap Quoter)
  
  // For now, just return estimated amount
  return amountIn * 1n; // 1:1 for example
}

// Use it before swapping
const quote = await getPriceQuote(
  usdcAddress,
  wethAddress,
  parseEther('1000')
);

const slippage = 0.5; // 0.5% slippage
const minAmount = quote * BigInt(100 - slippage) / 100n;

const tx = await uniswap.exactInputSingle({
  tokenIn: usdcAddress,
  tokenOut: wethAddress,
  fee: 3000,
  recipient: userAddress,
  deadline: deadline,
  amountIn: parseEther('1000'),
  amountOutMinimum: minAmount // Protect against slippage
});`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Step 5: Advanced Features</h2>
          <div className="space-y-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Listen for Swap Events</p>
              <p className="text-sm text-gray-600">Monitor all swaps on the router</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Gas Estimation</p>
              <p className="text-sm text-gray-600">Estimate gas costs before submitting</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Multi-hop Routes</p>
              <p className="text-sm text-gray-600">Find best price across multiple paths</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Liquidity Provider Integration</p>
              <p className="text-sm text-gray-600">Add/remove liquidity to pools</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Complete Example: React Component</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { useState } from 'react';
import { UniswapV3RouterSDK } from './sdk';
import { parseEther, formatEther } from 'ethers';

export function SwapForm({ provider }) {
  const [amountIn, setAmountIn] = useState('1');
  const [amountOut, setAmountOut] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSwap = async () => {
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const uniswap = new UniswapV3RouterSDK(signer);
      
      const tx = await uniswap.exactInputSingle({
        tokenIn: usdcAddress,
        tokenOut: wethAddress,
        fee: 3000,
        recipient: await signer.getAddress(),
        deadline: Math.floor(Date.now() / 1000) + 60 * 20,
        amountIn: parseEther(amountIn),
        amountOutMinimum: 0
      });
      
      alert(\`Swap initiated: \${tx.hash}\`);
    } catch (error) {
      alert(\`Swap failed: \${error.message}\`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSwap(); }}>
      <input
        type="number"
        value={amountIn}
        onChange={(e) => setAmountIn(e.target.value)}
        placeholder="Amount to swap"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Swapping...' : 'Swap'}
      </button>
    </form>
  );
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Always set slippage:</strong> Protect users from price changes</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use deadlines:</strong> Prevent transactions from getting stuck</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Get quotes first:</strong> Never send transactions blind</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Check allowances:</strong> User must approve token spending</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Handle errors:</strong> Users may reject or transactions may fail</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <p className="text-gray-700">
            Explore other guides:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mt-4">
            <li><a href="/docs/guides/nft-sdk" className="text-accent-green hover:underline">Build an NFT SDK</a></li>
            <li><a href="/docs/web3/gas-estimation" className="text-accent-green hover:underline">Gas Estimation Guide</a></li>
            <li><a href="/docs/web3/wallet-integration" className="text-accent-green hover:underline">Wallet Integration</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
