'use client';

import Link from 'next/link';

export default function ContractABIsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-sm font-mono text-gray-600 mb-4">
          <Link href="/docs" className="text-accent-green hover:underline">Docs</Link>
          {' / '}
          <Link href="/docs/web3/overview" className="text-accent-green hover:underline">Web3 & Smart Contracts</Link>
          {' / Contract ABIs'}
        </div>
        <h1 className="text-4xl font-bold font-mono mb-4">Working with Contract ABIs</h1>
        <p className="text-lg text-gray-600">
          Learn how to get and use smart contract ABIs with FOST
        </p>
      </div>

      <div className="prose prose-sm max-w-none font-mono space-y-8">
        {/* What is an ABI */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Contract ABI?</h2>
          <p className="text-gray-700 mb-4">
            An ABI (Application Binary Interface) is a JSON description of a smart contract's functions, variables, and events. It tells you what methods are available and what parameters they need.
          </p>
          <p className="text-gray-700">
            FOST uses ABIs to automatically generate type-safe SDKs for interacting with contracts.
          </p>
        </section>

        {/* ABI Structure */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ABI Structure</h2>
          <p className="text-gray-700 mb-4">
            Here's an example ERC-20 token ABI:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs overflow-x-auto">{`[
  {
    "type": "function",
    "name": "transfer",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ]
  },
  {
    "type": "function",
    "name": "balanceOf",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "account",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ]
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true
      },
      {
        "name": "value",
        "type": "uint256"
      }
    ]
  }
]`}</pre>
          </div>

          <p className="text-gray-700 mb-4">
            Key ABI elements FOST uses:
          </p>
          <ul className="space-y-2 text-gray-700 mb-6">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>function</strong> - Callable smart contract methods</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>event</strong> - Emitted by contracts (for subscriptions)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>stateMutability</strong> - Whether method writes to blockchain</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>inputs/outputs</strong> - Parameter and return types</span>
            </li>
          </ul>
        </section>

        {/* How to Get ABIs */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Get Contract ABIs</h2>

          <h3 className="text-lg font-bold text-gray-900 mb-3">1. From Etherscan (Easiest)</h3>
          <p className="text-gray-700 mb-3">
            Most deployed contracts on Ethereum have verified source code on Etherscan:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
            <li>Go to <a href="https://etherscan.io" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">etherscan.io</a></li>
            <li>Search for the contract address</li>
            <li>Click "Contract" tab</li>
            <li>Scroll to "Contract ABI" section</li>
            <li>Click "Copy" to copy the JSON</li>
          </ol>

          <h3 className="text-lg font-bold text-gray-900 mb-3">2. From Your Solidity Source</h3>
          <p className="text-gray-700 mb-3">
            If you have the Solidity source code:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs">npx hardhat compile
# Generates ABI in artifacts/contracts/MyContract.sol/MyContract.json</pre>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3">3. From OpenZeppelin</h3>
          <p className="text-gray-700 mb-3">
            For standard contracts (ERC-20, ERC-721, etc):
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs">npm install @openzeppelin/contracts
# ABIs available in node_modules/@openzeppelin/contracts/build/contracts/</pre>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3">4. Online Registry</h3>
          <p className="text-gray-700 mb-3">
            Use ABI registries like ABIType or other sources:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mb-6">
            <li><a href="https://www.4byte.directory" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">4byte.directory</a> - Solidity function signatures</li>
            <li><a href="https://abitype.com" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">ABIType</a> - ABI type definitions</li>
            <li>Protocol GitHub repos (Uniswap, Aave, etc.)</li>
          </ul>
        </section>

        {/* Using ABIs with FOST */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Using ABIs with FOST</h2>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Option 1: Upload ABI JSON</h3>
          <p className="text-gray-700 mb-3">
            In the FOST dashboard:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
            <li>Go to Dashboard → Generate SDK</li>
            <li>Toggle "Web3 Smart Contract"</li>
            <li>Click "Upload ABI JSON"</li>
            <li>Select your ABI file</li>
            <li>Choose languages and generate</li>
          </ol>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Option 2: Paste ABI JSON</h3>
          <p className="text-gray-700 mb-3">
            Paste the ABI directly:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
            <li>Click "Paste ABI JSON" button</li>
            <li>Paste the JSON content</li>
            <li>Click "Validate"</li>
            <li>Configure and generate</li>
          </ol>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Option 3: Contract Address</h3>
          <p className="text-gray-700 mb-3">
            FOST can fetch ABIs automatically:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
            <li>Enter contract address (e.g., Uniswap V3 Router)</li>
            <li>Select chain (Ethereum, Polygon, etc.)</li>
            <li>FOST fetches ABI from Etherscan automatically</li>
            <li>Review and generate SDK</li>
          </ol>
        </section>

        {/* Generated SDK */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Generated SDK Usage</h2>
          <p className="text-gray-700 mb-4">
            After generating an SDK from an ABI, you get fully typed methods:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs">{`import { MyContractSDK } from './sdk';
import { getProvider } from 'ethers';

const provider = getProvider();
const sdk = new MyContractSDK(provider);

// Automatically typed based on ABI
const balance = await sdk.balanceOf('0x...');
// TypeScript knows the return type is uint256

const tx = await sdk.transfer({
  to: '0xRecipient',
  amount: '1000000000000000000'
});
// TypeScript validates parameters`}</pre>
          </div>
        </section>

        {/* ABI Validation */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">ABI Validation</h2>
          <p className="text-gray-700 mb-4">
            FOST validates ABIs to ensure they're well-formed. Common issues:
          </p>
          <div className="space-y-3">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="font-bold text-gray-900 mb-2">Invalid JSON</p>
              <p className="text-sm text-gray-600">Make sure the ABI is valid JSON (valid commas, quotes, etc.)</p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="font-bold text-gray-900 mb-2">Missing Type Fields</p>
              <p className="text-sm text-gray-600">Each function/event must have a "type" field (usually "function" or "event")</p>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="font-bold text-gray-900 mb-2">Invalid Type Names</p>
              <p className="text-sm text-gray-600">Type names must be Solidity types (address, uint256, bytes32, etc.)</p>
            </div>
          </div>
        </section>

        {/* Standard Contracts */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Standard Contract ABIs</h2>
          <p className="text-gray-700 mb-4">
            Common ABIs you can use immediately:
          </p>
          <div className="space-y-3">
            <Link 
              href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/ERC20.sol"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <p className="font-bold text-accent-green mb-1">ERC-20 Token</p>
              <p className="text-xs text-gray-600">Standard fungible token contract</p>
            </Link>

            <Link 
              href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <p className="font-bold text-accent-green mb-1">ERC-721 NFT</p>
              <p className="text-xs text-gray-600">Non-fungible token (NFT) contract</p>
            </Link>

            <Link 
              href="https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <p className="font-bold text-accent-green mb-1">ERC-1155 Token</p>
              <p className="text-xs text-gray-600">Multi-token standard contract</p>
            </Link>

            <Link 
              href="https://github.com/Uniswap/v3-core/blob/main/contracts/UniswapV3Pool.sol"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <p className="font-bold text-accent-green mb-1">Uniswap V3 Pool</p>
              <p className="text-xs text-gray-600">Decentralized exchange (DEX) contract</p>
            </Link>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/docs/web3/multi-chain"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">Multi-Chain Support</h3>
              <p className="text-sm text-gray-600">Deploy ABIs to different chains</p>
            </Link>

            <Link 
              href="/docs/web3/wallet-integration"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">Wallet Integration</h3>
              <p className="text-sm text-gray-600">Connect wallets to sign transactions</p>
            </Link>

            <Link 
              href="/docs/guides/defi-sdk"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">DeFi Example</h3>
              <p className="text-sm text-gray-600">Build a complete DeFi SDK</p>
            </Link>

            <Link 
              href="/docs/guides/nft-sdk"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">NFT SDK</h3>
              <p className="text-sm text-gray-600">Create an NFT marketplace SDK</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}