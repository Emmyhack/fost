'use client';

export default function WalletIntegrationPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Wallet Integration</h1>
      <p className="text-lg text-gray-600 mb-8">
        Connect MetaMask, WalletConnect, and other Web3 wallets to your SDK
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Supported Wallets</h2>
          <div className="space-y-3 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">MetaMask</p>
              <p className="text-sm text-gray-600">Most popular Ethereum wallet browser extension</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">WalletConnect</p>
              <p className="text-sm text-gray-600">Connect any mobile or desktop wallet</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Coinbase Wallet</p>
              <p className="text-sm text-gray-600">Coinbase's native wallet</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">MetaMask Integration</h2>
          <p className="text-gray-700 mb-4">Connect MetaMask in your generated SDK:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { MyContractSDK } from './sdk';
import { BrowserProvider } from 'ethers';

// Get MetaMask provider
const provider = new BrowserProvider(window.ethereum);

// Initialize SDK
const sdk = new MyContractSDK(provider);

// Connect wallet
const signer = await provider.getSigner();
const userAddress = await signer.getAddress();
console.log('Connected:', userAddress);

// Sign and send transaction
const tx = await sdk.transfer({
  to: '0xRecipient',
  amount: '1000000000000000000'
});

console.log('Transaction:', tx.hash);`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">WalletConnect Integration</h2>
          <p className="text-gray-700 mb-4">For mobile and other wallets:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { EthereumProvider } from '@walletconnect/ethereum-provider';

// Initialize WalletConnect
const provider = await EthereumProvider.init({
  projectId: 'YOUR_PROJECT_ID',
  chains: [1, 137, 42161],
  showQrModal: true
});

// Connect
await provider.connect();

// Use with SDK
const sdk = new MyContractSDK(provider);
const tx = await sdk.transfer({
  to: '0xRecipient',
  amount: '1000000000000000000'
});`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-2 text-gray-700 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>No auto-connect:</strong> Only connect when user clicks</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Handle errors:</strong> User may reject connection</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Check network:</strong> Verify user is on correct chain</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Show status:</strong> Display connected address and chain</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Example: React Component</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
            <pre className="text-xs">{`import { useState } from 'react';
import { BrowserProvider } from 'ethers';

export function WalletButton() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');

  const handleConnect = async () => {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    
    setAddress(userAddress);
    setConnected(true);
  };

  return (
    <button onClick={handleConnect}>
      {connected ? \`Connected: \${address.slice(0, 6)}...\` : 'Connect Wallet'}
    </button>
  );
}`}</pre>
          </div>
        </section>
      </div>
    </div>
  );
}
