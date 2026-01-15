'use client';

export default function GasEstimationPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Gas Estimation</h1>
      <p className="text-lg text-gray-600 mb-8">
        Automatically estimate transaction costs before sending
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">What is Gas?</h2>
          <p className="text-gray-700 mb-4">
            Gas is the cost of executing transactions on the blockchain. It varies based on network congestion and transaction complexity.
          </p>
          <p className="text-gray-700">
            FOST automatically estimates gas for all transactions in your generated SDK.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Estimating Gas Costs</h2>
          <p className="text-gray-700 mb-4">All generated SDK methods include gas estimation:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { MyContractSDK } from './sdk';
import { BrowserProvider, parseEther } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const sdk = new MyContractSDK(provider);

// Estimate gas for a transaction
const gasEstimate = await sdk.estimateGas.transfer({
  to: '0xRecipient',
  amount: parseEther('1.0')
});

console.log('Gas estimate:', gasEstimate.toString());
// Output: "21000"

// Get current gas price
const feeData = await provider.getFeeData();
console.log('Gas price:', feeData.gasPrice);

// Calculate total cost
const estimatedCost = gasEstimate * feeData.gasPrice;
console.log('Estimated cost:', estimatedCost.toString());`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Before Sending Transactions</h2>
          <p className="text-gray-700 mb-4">Always estimate before sending:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`const gasEstimate = await sdk.estimateGas.transfer({
  to: '0xRecipient',
  amount: parseEther('1.0')
});

// Check if user has enough gas
const balance = await provider.getBalance(userAddress);
const estimatedCost = gasEstimate * (await provider.getFeeData()).gasPrice;

if (balance < estimatedCost) {
  console.error('Insufficient balance for gas');
  return;
}

// Safe to send transaction
const tx = await sdk.transfer({
  to: '0xRecipient',
  amount: parseEther('1.0')
});

console.log('Transaction sent:', tx.hash);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Gas Price Strategies</h2>
          <div className="space-y-3 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Safe/Standard</p>
              <p className="text-sm text-gray-600">Normal gas price, takes ~5 minutes</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Fast</p>
              <p className="text-sm text-gray-600">Higher gas price, takes ~2 minutes</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Instant</p>
              <p className="text-sm text-gray-600">Highest gas price, takes ~30 seconds</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Display Cost to User</h2>
          <p className="text-gray-700 mb-4">Best practice: Show estimated cost before confirming:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { formatEther } from 'ethers';

const gasEstimate = await sdk.estimateGas.transfer({
  to: '0xRecipient',
  amount: parseEther('1.0')
});

const feeData = await provider.getFeeData();
const estimatedCostWei = gasEstimate * feeData.gasPrice;
const estimatedCostEth = formatEther(estimatedCostWei);

// Show to user
alert(\`Transaction will cost approximately \${estimatedCostEth} ETH\`);

// User confirms...
const tx = await sdk.transfer({
  to: '0xRecipient',
  amount: parseEther('1.0')
});`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Optimize Gas Usage</h2>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Batch operations:</strong> Combine multiple operations</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Off-peak timing:</strong> Send during low congestion</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Layer 2s:</strong> Use Polygon/Arbitrum for cheaper gas</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Read-only calls:</strong> View methods use no gas</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Gas Price Resources</h2>
          <ul className="space-y-2 text-gray-700">
            <li>
              <a href="https://www.gasnow.org" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">
                GasNow.org
              </a>
              <p className="text-sm text-gray-600">Real-time gas price tracker</p>
            </li>
            <li>
              <a href="https://etherscan.io/gastracker" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">
                Etherscan Gas Tracker
              </a>
              <p className="text-sm text-gray-600">Official Ethereum gas tracker</p>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
