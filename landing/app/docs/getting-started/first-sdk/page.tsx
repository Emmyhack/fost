'use client';

import Link from 'next/link';

export default function FirstSDKPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-sm font-mono text-gray-600 mb-4">
          <Link href="/docs" className="text-accent-green hover:underline">Docs</Link>
          {' / '}
          <Link href="/docs/getting-started/overview" className="text-accent-green hover:underline">Getting Started</Link>
          {' / First SDK'}
        </div>
        <h1 className="text-4xl font-bold font-mono mb-4">Generate Your First SDK</h1>
        <p className="text-lg text-gray-600">
          Complete this tutorial to generate a production-ready SDK in under 5 minutes
        </p>
      </div>

      <div className="prose prose-sm max-w-none font-mono space-y-8">
        {/* REST API Example */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Option 1: REST API SDK</h2>
          <p className="text-gray-700 mb-4">
            Generate a type-safe SDK from an OpenAPI specification.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Step 1: Prepare Your OpenAPI Spec</h3>
          <p className="text-gray-700 mb-3">
            Create a file named `openapi.json`:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs overflow-x-auto">{`{
  "openapi": "3.0.0",
  "info": {
    "title": "Pet Store API",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://petstore.example.com/v1"
    }
  ],
  "paths": {
    "/pets": {
      "get": {
        "summary": "List all pets",
        "operationId": "listPets",
        "parameters": [
          {
            "name": "limit",
            "in": "query",
            "description": "Max pets to return",
            "schema": {
              "type": "integer"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "List of pets"
          }
        }
      }
    }
  }
}`}</pre>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Step 2: Generate the SDK</h3>
          <p className="text-gray-700 mb-3">
            Using the CLI:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-3">
            <pre className="text-xs">fost generate --spec openapi.json --languages typescript python</pre>
          </div>
          <p className="text-gray-700 mb-3">
            Or use the web dashboard:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
            <li>Go to <Link href="/platform/dashboard" className="text-accent-green hover:underline">Dashboard</Link></li>
            <li>Click "Generate SDK"</li>
            <li>Select "REST API"</li>
            <li>Upload your OpenAPI spec</li>
            <li>Select languages (TypeScript, Python, etc.)</li>
            <li>Click "Generate"</li>
          </ol>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Step 3: Use the Generated SDK</h3>
          <p className="text-gray-700 mb-3">
            TypeScript example:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs">{`import { PetStoreAPI } from './petstore-sdk';

const client = new PetStoreAPI({
  serverURL: 'https://petstore.example.com/v1'
});

// Call API method
const pets = await client.listPets({
  limit: 10
});

console.log('Pets:', pets);`}</pre>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Step 4: Publish (Optional)</h3>
          <p className="text-gray-700 mb-3">
            Publish your SDK to npm:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs">{`cd generated-sdk
npm publish`}</pre>
          </div>
        </section>

        {/* Web3 Example */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Option 2: Smart Contract SDK</h2>
          <p className="text-gray-700 mb-4">
            Generate a Web3 SDK from a smart contract ABI.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Step 1: Get the Contract ABI</h3>
          <p className="text-gray-700 mb-3">
            Get your contract ABI from Etherscan. Example ERC-20 token ABI snippet:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs overflow-x-auto">{`[
  {
    "type": "function",
    "name": "transfer",
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
        "type": "bool"
      }
    ]
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      {
        "name": "account",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "type": "uint256"
      }
    ]
  }
]`}</pre>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Step 2: Generate the SDK</h3>
          <p className="text-gray-700 mb-3">
            Using the web dashboard:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
            <li>Go to <Link href="/platform/dashboard" className="text-accent-green hover:underline">Dashboard</Link></li>
            <li>Click "Generate SDK"</li>
            <li>Toggle "Web3 Smart Contract"</li>
            <li>Select Chain: "Ethereum"</li>
            <li>Enter contract address or paste ABI</li>
            <li>Select languages</li>
            <li>Click "Generate"</li>
          </ol>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Step 3: Use the Generated SDK</h3>
          <p className="text-gray-700 mb-3">
            TypeScript example with wallet integration:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs">{`import { ERC20SDK } from './erc20-sdk';
import { getProvider } from 'ethers';

// Initialize SDK with wallet
const provider = getProvider(); // MetaMask or RPC
const sdk = new ERC20SDK(provider);

// Configure contract
sdk.setContractAddress('0x...');

// Call contract method
const balance = await sdk.balanceOf('0xUserAddress');
console.log('Balance:', balance);

// Send transaction
const tx = await sdk.transfer({
  to: '0xRecipient',
  amount: '1000000000000000000' // 1 token (18 decimals)
});

console.log('Transaction:', tx.hash);`}</pre>
          </div>
        </section>

        {/* Common Tasks */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Tasks</h2>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Generate Multiple Languages</h3>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs">{`fost generate \\
  --spec openapi.json \\
  --languages typescript python go java csharp`}</pre>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Specify Output Directory</h3>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs">{`fost generate \\
  --spec openapi.json \\
  --output ./generated-sdks \\
  --languages typescript`}</pre>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Validate Before Generating</h3>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs">{`fost validate --spec openapi.json`}</pre>
          </div>
        </section>

        {/* Validation */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What You Get</h2>
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="font-bold text-gray-900 mb-2">✓ Type-Safe Methods</p>
              <p className="text-sm text-gray-600">Full TypeScript types for all API methods and contract functions</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="font-bold text-gray-900 mb-2">✓ Auto Documentation</p>
              <p className="text-sm text-gray-600">JSDoc comments and README for every method</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="font-bold text-gray-900 mb-2">✓ Error Handling</p>
              <p className="text-sm text-gray-600">Built-in error handling and validation</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="font-bold text-gray-900 mb-2">✓ Web3 Support (Smart Contracts)</p>
              <p className="text-sm text-gray-600">Gas estimation, wallet integration, event subscriptions</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="font-bold text-gray-900 mb-2">✓ Ready to Publish</p>
              <p className="text-sm text-gray-600">Package.json and all npm/pip/maven metadata included</p>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting</h2>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Invalid OpenAPI Spec</h3>
          <p className="text-gray-700 mb-3">
            Make sure your spec is valid:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-6">
            <pre className="text-xs">fost validate --spec openapi.json</pre>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3">MetaMask Not Connecting</h3>
          <p className="text-gray-700">
            See the <Link href="/docs/resources/troubleshooting" className="text-accent-green hover:underline">troubleshooting guide</Link> for Web3 issues.
          </p>
        </section>

        {/* Next */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/docs/rest-api/introduction"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">REST API Docs</h3>
              <p className="text-sm text-gray-600">Learn more about REST API SDK generation</p>
            </Link>

            <Link 
              href="/docs/web3/overview"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">Web3 Docs</h3>
              <p className="text-sm text-gray-600">Explore smart contract SDK features</p>
            </Link>

            <Link 
              href="/docs/languages/typescript"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">TypeScript Guide</h3>
              <p className="text-sm text-gray-600">TypeScript SDK specifics</p>
            </Link>

            <Link 
              href="/docs/guides/defi-sdk"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">DeFi Example</h3>
              <p className="text-sm text-gray-600">Build a DeFi protocol SDK</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
