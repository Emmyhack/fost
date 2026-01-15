'use client';

export default function EthereumPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Ethereum Chain Guide</h1>
      <p className="text-lg text-gray-600 mb-8">
        Deploy and interact with smart contracts on Ethereum
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            Ethereum is the leading smart contract platform with the largest ecosystem. This guide covers everything you need to know about deploying SDKs on Ethereum.
          </p>
          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <div><strong>Network ID:</strong> 1</div>
            <div><strong>Symbol:</strong> ETH</div>
            <div><strong>Decimals:</strong> 18</div>
            <div><strong>Block Time:</strong> ~12 seconds</div>
            <div><strong>Avg Gas Price:</strong> 20-100 gwei</div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">RPC Endpoints</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`# Public endpoints (rate limited)
https://eth.llamarpc.com
https://rpc.ankr.com/eth
https://endpoints.omniatech.io/v1/eth/mainnet/public

# Archive nodes (full history, slower)
https://rpc.flashbots.net

# Recommended: Use Infura, Alchemy, or QuickNode for production
https://mainnet.infura.io/v3/YOUR_API_KEY
https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
https://mainnet.rpc.quicknode.pro/YOUR_API_KEY`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Testnet: Sepolia</h2>
          <p className="text-gray-700 mb-4">
            Use Sepolia testnet for development and testing before mainnet:
          </p>
          <div className="rounded-lg border border-gray-200 p-4 space-y-2 mb-4">
            <div><strong>Network ID:</strong> 11155111</div>
            <div><strong>Chain ID:</strong> 11155111</div>
            <div><strong>Faucets:</strong> <a href="https://faucet.sepolia.dev" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Sepolia Faucet</a>, Infura Faucet</div>
            <div><strong>Block Explorer:</strong> <a href="https://sepolia.etherscan.io" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Sepolia Etherscan</a></div>
          </div>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// In your SDK configuration
const NETWORKS = {
  ethereum: {
    mainnet: {
      chainId: 1,
      rpc: 'https://eth.llamarpc.com'
    },
    sepolia: {
      chainId: 11155111,
      rpc: 'https://sepolia.infura.io/v3/YOUR_API_KEY'
    }
  }
};

// Connect to Sepolia
const sdk = new MyContractSDK(NETWORKS.ethereum.sepolia.rpc);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Gas Costs</h2>
          <p className="text-gray-700 mb-4">
            Ethereum uses a dynamic fee market since EIP-1559:
          </p>
          <div className="space-y-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Simple Transfer (ETH to address)</p>
              <p className="text-sm text-gray-600">21,000 gas units</p>
              <p className="text-xs text-gray-500 font-mono">Cost: 21,000 × (base + priority) gwei</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Token Transfer (ERC-20)</p>
              <p className="text-sm text-gray-600">65,000 gas units</p>
              <p className="text-xs text-gray-500 font-mono">Cost: ~$5-20 depending on network congestion</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Smart Contract Interaction</p>
              <p className="text-sm text-gray-600">100,000 - 5,000,000+ gas units</p>
              <p className="text-xs text-gray-500 font-mono">Varies by function complexity</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Transaction Types</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { BrowserProvider, parseEther } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Type 2 Transaction (EIP-1559) - Recommended
const tx = await signer.sendTransaction({
  to: '0xRecipient',
  value: parseEther('1.0'),
  maxFeePerGas: ethers.parseUnits('20', 'gwei'),
  maxPriorityFeePerGas: ethers.parseUnits('2', 'gwei')
});

// Get current base fee
const block = await provider.getBlock('latest');
console.log('Base Fee:', block.baseFeePerGas);

// Estimate gas
const gasEstimate = await provider.estimateGas({
  from: await signer.getAddress(),
  to: '0xRecipient',
  value: parseEther('1.0')
});
console.log('Gas Estimate:', gasEstimate);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Popular Smart Contracts</h2>
          <div className="space-y-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">USDC (Circle)</p>
              <p className="text-xs font-mono text-gray-600">0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48</p>
              <p className="text-sm text-gray-600 mt-2">USD Coin - Stablecoin</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">USDT (Tether)</p>
              <p className="text-xs font-mono text-gray-600">0xdac17f958d2ee523a2206206994597c13d831ec7</p>
              <p className="text-sm text-gray-600 mt-2">Tether USD - Stablecoin</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Uniswap V3 Router</p>
              <p className="text-xs font-mono text-gray-600">0xE592427A0AEce92De3Edee1F18E0157C05861564</p>
              <p className="text-sm text-gray-600 mt-2">Decentralized Exchange</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">OpenSea Seaport</p>
              <p className="text-xs font-mono text-gray-600">0x00000000006c3852cbEf3e08E8dF289169EdE581</p>
              <p className="text-sm text-gray-600 mt-2">NFT Marketplace</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices for Ethereum</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Test on Sepolia first:</strong> Always deploy to testnet before mainnet</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use reliable RPC:</strong> Infura, Alchemy, or QuickNode for mainnet</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Monitor gas prices:</strong> Use tools like GasNow or MEV-Inspect</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Set max gas:</strong> Protect against extreme price spikes</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use Etherscan:</strong> Verify contracts and monitor transactions</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Resources</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Etherscan (Block Explorer)</a></li>
            <li><a href="https://ethereum.org/en/developers/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Ethereum Developer Docs</a></li>
            <li><a href="https://ethereum.org/en/developers/tutorials/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Ethereum Tutorials</a></li>
            <li><a href="/docs/web3/multi-chain" className="text-accent-green hover:underline">Multi-Chain Guide</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
