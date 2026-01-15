'use client';

export default function PolygonPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Polygon Chain Guide</h1>
      <p className="text-lg text-gray-600 mb-8">
        Deploy SDKs on Polygon for low-cost, fast transactions
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            Polygon is a Layer 2 scaling solution for Ethereum with significantly lower fees and faster confirmation times. Perfect for high-frequency applications and user-friendly dApps.
          </p>
          <div className="rounded-lg border border-gray-200 p-4 space-y-2">
            <div><strong>Network ID:</strong> 137</div>
            <div><strong>Chain ID:</strong> 137</div>
            <div><strong>Symbol:</strong> MATIC</div>
            <div><strong>Decimals:</strong> 18</div>
            <div><strong>Avg Block Time:</strong> 2 seconds</div>
            <div><strong>Avg Gas Price:</strong> 1-5 gwei (100x cheaper than Ethereum)</div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">RPC Endpoints</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`# Official Polygon RPC
https://polygon-rpc.com

# Alchemy
https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# QuickNode
https://mainnet.rpc.quicknode.pro/YOUR_API_KEY

# 1RPC
https://1rpc.io/matic

# Recommended for production:
# Use Alchemy or QuickNode for reliability`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Testnet: Mumbai</h2>
          <p className="text-gray-700 mb-4">
            Test your SDK on Mumbai before deploying to mainnet:
          </p>
          <div className="rounded-lg border border-gray-200 p-4 space-y-2 mb-4">
            <div><strong>Network ID:</strong> 80001</div>
            <div><strong>Chain ID:</strong> 80001</div>
            <div><strong>Faucet:</strong> <a href="https://faucet.polygon.technology" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Polygon Faucet</a></div>
            <div><strong>Block Explorer:</strong> <a href="https://mumbai.polygonscan.com" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Mumbai PolygonScan</a></div>
          </div>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// Configure for Mumbai testnet
const NETWORKS = {
  polygon: {
    mainnet: {
      chainId: 137,
      rpc: 'https://polygon-rpc.com'
    },
    mumbai: {
      chainId: 80001,
      rpc: 'https://rpc-mumbai.maticvigil.com'
    }
  }
};

// Get Mumbai faucet tokens at:
// https://faucet.polygon.technology/`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Why Choose Polygon?</h2>
          <div className="space-y-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">🚀 10,000x Cheaper Gas</p>
              <p className="text-sm text-gray-600">Transfer costs: $0.001 vs $5+ on Ethereum</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">⚡ 2-Second Blocks</p>
              <p className="text-sm text-gray-600">Fast confirmation vs 12 seconds on Ethereum</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">🌉 Ethereum Compatible</p>
              <p className="text-sm text-gray-600">Same RPC, same contracts, just change network</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">🔐 Validator Network</p>
              <p className="text-sm text-gray-600">Secured by Ethereum validators and Polygon's own set</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Gas Costs Comparison</h2>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Transaction</th>
                  <th className="p-2 text-right">Polygon (gwei)</th>
                  <th className="p-2 text-right">Polygon ($)</th>
                  <th className="p-2 text-right">Ethereum ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-2">Simple Transfer</td>
                  <td className="p-2 text-right">2 gwei</td>
                  <td className="p-2 text-right">$0.0004</td>
                  <td className="p-2 text-right">$5-20</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">Token Transfer</td>
                  <td className="p-2 text-right">5 gwei</td>
                  <td className="p-2 text-right">$0.001</td>
                  <td className="p-2 text-right">$5-30</td>
                </tr>
                <tr className="border-t">
                  <td className="p-2">DEX Swap</td>
                  <td className="p-2 text-right">20 gwei</td>
                  <td className="p-2 text-right">$0.01</td>
                  <td className="p-2 text-right">$50-500</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500">*Prices vary with market conditions and gas prices</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Bridge Tokens from Ethereum</h2>
          <p className="text-gray-700 mb-4">
            Use the Polygon Bridge to move assets between Ethereum and Polygon:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`// Using the Polygon Bridge Portal
// https://wallet.polygon.technology/bridge

// Process:
1. Connect to Ethereum network in MetaMask
2. Select token to bridge (USDC, ETH, DAI, etc.)
3. Enter amount
4. Confirm transaction on Ethereum (costs ~$10-50)
5. Wait for checkpoint (5-7 minutes)
6. Switch to Polygon in MetaMask
7. Claim tokens on Polygon (costs ~$0.01)

// Programmatic bridge with ethers.js
const posClient = new POSClient();
await posClient.init({
  log: true,
  network: 'mainnet',
  version: 'v1',
  parent: {
    provider: ethersProvider,
    defaultConfig: {
      from: userAddress,
    }
  },
  child: {
    provider: maticProvider,
    defaultConfig: {
      from: userAddress,
    }
  }
});

// Deposit USDC to Polygon
const erc20Token = posClient.erc20(usdcTokenAddress);
const depositTx = await erc20Token.deposit(
  amountInWei,
  userAddress
);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Popular Polygon DApps</h2>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-600">
              <strong>DEXs:</strong> QuickSwap, SushiSwap, Balancer
            </p>
            <p className="text-sm text-gray-600">
              <strong>Lending:</strong> Aave, Compound
            </p>
            <p className="text-sm text-gray-600">
              <strong>NFTs:</strong> OpenSea, Rarible, SuperRare
            </p>
            <p className="text-sm text-gray-600">
              <strong>Gaming:</strong> Decentraland, Polymarket, Uniswap
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Generate Polygon SDK</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Go to <a href="/platform/dashboard" className="text-accent-green hover:underline">FOST Dashboard</a></li>
            <li>Click "Generate SDK"</li>
            <li>Toggle "Web3 Smart Contract"</li>
            <li>Select Chain: "Polygon"</li>
            <li>Paste contract ABI</li>
            <li>Select Language (TypeScript, Python, etc.)</li>
            <li>Click "Generate"</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices for Polygon</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Test on Mumbai first:</strong> Free testnet tokens available</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Bridge strategically:</strong> Bridge only what you need</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Use reliable RPC:</strong> Alchemy or QuickNode recommended</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Monitor mainnet:</strong> Keep eye on Ethereum for security updates</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Enable checkpoints:</strong> Wait for checkpoint before withdrawing</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Resources</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="https://polygon.technology/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Polygon Official</a></li>
            <li><a href="https://docs.polygon.technology/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Polygon Docs</a></li>
            <li><a href="https://polygonscan.com" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">PolygonScan (Block Explorer)</a></li>
            <li><a href="https://wallet.polygon.technology/bridge" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">Polygon Bridge</a></li>
            <li><a href="/docs/web3/multi-chain" className="text-accent-green hover:underline">Multi-Chain Guide</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
