'use client';

import Link from 'next/link';

export default function OverviewPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-sm font-mono text-gray-600 mb-4">
          <Link href="/docs" className="text-accent-green hover:underline">Docs</Link>
          {' / '}
          <Link href="/docs/getting-started/overview" className="text-accent-green hover:underline">Getting Started</Link>
          {' / Overview'}
        </div>
        <h1 className="text-4xl font-bold font-mono mb-4">Getting Started</h1>
        <p className="text-lg text-gray-600">
          Learn how to generate your first SDK in minutes
        </p>
      </div>

      <div className="prose prose-sm max-w-none font-mono space-y-8">
        {/* What is FOST */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is FOST?</h2>
          <p className="text-gray-700">
            FOST is a Web3-first SDK generation platform that turns API specifications and smart contract ABIs into production-ready SDKs. Generate type-safe SDKs for REST APIs and blockchain smart contracts in seconds.
          </p>
        </section>

        {/* Key Features */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>REST API SDKs:</strong> Generate from OpenAPI 3.0 and Swagger 2.0 specs</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Smart Contract SDKs:</strong> Generate from Solidity contract ABIs</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Multi-Chain:</strong> Deploy to 6+ blockchain networks</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>8 Languages:</strong> TypeScript, Python, Go, Java, C#, Rust, Ruby, PHP</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Type Safe:</strong> Full type safety with TypeScript support</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Auto Docs:</strong> Comprehensive documentation generation</span>
            </li>
          </ul>
        </section>

        {/* Use Cases */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Use Cases</h2>

          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">Build DeFi Applications</h3>
              <p className="text-sm text-gray-600">
                Generate SDKs from Uniswap, Aave, or other DeFi protocol ABIs to interact with smart contracts programmatically.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">NFT Marketplaces</h3>
              <p className="text-sm text-gray-600">
                Create NFT trading SDKs from ERC-721/1155 contract ABIs with gas estimation and wallet integration.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">API Client Libraries</h3>
              <p className="text-sm text-gray-600">
                Convert REST API specs into type-safe client libraries across multiple languages automatically.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <h3 className="font-bold text-gray-900 mb-2">Protocol Integration</h3>
              <p className="text-sm text-gray-600">
                Quickly integrate blockchain protocols without manually writing wrapper code.
              </p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-green text-white flex items-center justify-center font-bold">1</div>
              <div>
                <h3 className="font-bold text-gray-900">Upload Specification</h3>
                <p className="text-sm text-gray-600">Provide OpenAPI spec (REST) or contract ABI (Web3)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-green text-white flex items-center justify-center font-bold">2</div>
              <div>
                <h3 className="font-bold text-gray-900">Configure Options</h3>
                <p className="text-sm text-gray-600">Select languages, chains, and features you need</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-green text-white flex items-center justify-center font-bold">3</div>
              <div>
                <h3 className="font-bold text-gray-900">Generate SDK</h3>
                <p className="text-sm text-gray-600">FOST generates type-safe, production-ready code</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-green text-white flex items-center justify-center font-bold">4</div>
              <div>
                <h3 className="font-bold text-gray-900">Download & Deploy</h3>
                <p className="text-sm text-gray-600">Get npm/pip/maven packages ready to use immediately</p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Start */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm font-mono text-gray-400">$ npm install @fost/sdk</p>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <pre className="text-xs whitespace-pre-wrap">
{`import { FOSTClient } from '@fost/sdk';

// Create SDK instance
const client = new FOSTClient();

// Generate REST API SDK
const sdkConfig = {
  specFile: 'openapi.json',
  languages: ['typescript', 'python'],
  outputPath: './sdks'
};

await client.generate(sdkConfig);`}
              </pre>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/docs/getting-started/installation"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">Installation Guide</h3>
              <p className="text-sm text-gray-600">Set up FOST on your system</p>
            </Link>

            <Link 
              href="/docs/getting-started/first-sdk"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">Generate First SDK</h3>
              <p className="text-sm text-gray-600">Create your first SDK in 5 minutes</p>
            </Link>

            <Link 
              href="/docs/rest-api/introduction"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">REST API SDKs</h3>
              <p className="text-sm text-gray-600">Learn REST API SDK generation</p>
            </Link>

            <Link 
              href="/docs/web3/overview"
              className="block p-4 rounded-lg border border-gray-200 hover:border-accent-green hover:bg-green-50 transition"
            >
              <h3 className="font-bold text-accent-green mb-2">Web3 Smart Contracts</h3>
              <p className="text-sm text-gray-600">Generate blockchain SDKs</p>
            </Link>
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pricing</h2>
          <p className="text-gray-700 mb-4">
            Get started for free with 100 credits. Each SDK generation costs credits based on complexity.
          </p>
          <Link 
            href="/pricing"
            className="inline-block rounded bg-accent-green px-6 py-2 font-bold text-white hover:bg-accent-green-dark"
          >
            View Plans
          </Link>
        </section>
      </div>
    </div>
  );
}
