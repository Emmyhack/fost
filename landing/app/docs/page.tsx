'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DocsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');

  const docSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      items: [
        { title: 'Overview', href: '/docs/getting-started/overview' },
        { title: 'Installation', href: '/docs/getting-started/installation' },
        { title: 'First SDK', href: '/docs/getting-started/first-sdk' },
        { title: 'Authentication', href: '/docs/getting-started/authentication' },
      ],
    },
    {
      id: 'rest-api',
      title: 'REST API SDKs',
      items: [
        { title: 'Introduction', href: '/docs/rest-api/introduction' },
        { title: 'OpenAPI Specs', href: '/docs/rest-api/openapi-specs' },
        { title: 'API Configuration', href: '/docs/rest-api/api-configuration' },
        { title: 'Error Handling', href: '/docs/rest-api/error-handling' },
        { title: 'Rate Limiting', href: '/docs/rest-api/rate-limiting' },
      ],
    },
    {
      id: 'web3',
      title: 'Web3 & Smart Contracts',
      items: [
        { title: 'Overview', href: '/docs/web3/overview' },
        { title: 'Contract ABIs', href: '/docs/web3/contract-abis' },
        { title: 'Multi-Chain Support', href: '/docs/web3/multi-chain' },
        { title: 'Wallet Integration', href: '/docs/web3/wallet-integration' },
        { title: 'Gas Estimation', href: '/docs/web3/gas-estimation' },
        { title: 'Event Subscriptions', href: '/docs/web3/event-subscriptions' },
      ],
    },
    {
      id: 'languages',
      title: 'Languages',
      items: [
        { title: 'TypeScript', href: '/docs/languages/typescript' },
        { title: 'Python', href: '/docs/languages/python' },
        { title: 'Go', href: '/docs/languages/go' },
        { title: 'Java', href: '/docs/languages/java' },
        { title: 'C#', href: '/docs/languages/csharp' },
        { title: 'Rust', href: '/docs/languages/rust' },
        { title: 'Ruby', href: '/docs/languages/ruby' },
        { title: 'PHP', href: '/docs/languages/php' },
      ],
    },
    {
      id: 'chains',
      title: 'Blockchain Networks',
      items: [
        { title: 'Ethereum', href: '/docs/chains/ethereum' },
        { title: 'Polygon', href: '/docs/chains/polygon' },
        { title: 'Arbitrum', href: '/docs/chains/arbitrum' },
        { title: 'Optimism', href: '/docs/chains/optimism' },
        { title: 'Base', href: '/docs/chains/base' },
        { title: 'BSC', href: '/docs/chains/bsc' },
      ],
    },
    {
      id: 'guides',
      title: 'Guides & Tutorials',
      items: [
        { title: 'Build a DeFi SDK', href: '/docs/guides/defi-sdk' },
        { title: 'NFT Contract SDK', href: '/docs/guides/nft-sdk' },
        { title: 'Token Swap SDK', href: '/docs/guides/swap-sdk' },
        { title: 'Governance DAO SDK', href: '/docs/guides/dao-sdk' },
        { title: 'Custom Chain SDK', href: '/docs/guides/custom-chain' },
      ],
    },
    {
      id: 'reference',
      title: 'API Reference',
      items: [
        { title: 'CLI Commands', href: '/docs/reference/cli' },
        { title: 'SDK Generator API', href: '/docs/reference/generator-api' },
        { title: 'Configuration Schema', href: '/docs/reference/config-schema' },
        { title: 'TypeScript Types', href: '/docs/reference/typescript-types' },
      ],
    },
    {
      id: 'resources',
      title: 'Resources',
      items: [
        { title: 'Code Examples', href: '/docs/resources/examples' },
        { title: 'Best Practices', href: '/docs/resources/best-practices' },
        { title: 'Troubleshooting', href: '/docs/resources/troubleshooting' },
        { title: 'FAQ', href: '/docs/resources/faq' },
        { title: 'GitHub', href: 'https://github.com/emmyhack/fost' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 text-sm font-mono">
            <Link href="/" className="text-accent-green hover:underline">
              FOST
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">Documentation</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 min-h-screen">
          <div className="sticky top-0 p-6 space-y-6 max-h-screen overflow-y-auto">
            {docSections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === section.id ? null : section.id
                    )
                  }
                  className="w-full text-left font-mono font-semibold text-sm text-gray-900 hover:text-accent-green mb-3"
                >
                  {section.title}
                </button>

                {expandedSection === section.id && (
                  <nav className="space-y-2 ml-2">
                    {section.items.map((item) => (
                      <div key={item.title}>
                        {item.href.startsWith('http') ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block font-mono text-xs text-gray-600 hover:text-accent-green py-1 px-2 rounded hover:bg-white transition"
                          >
                            {item.title} ↗
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            className="block font-mono text-xs text-gray-600 hover:text-accent-green py-1 px-2 rounded hover:bg-white transition"
                          >
                            {item.title}
                          </Link>
                        )}
                      </div>
                    ))}
                  </nav>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 max-w-4xl mx-auto p-12">
          <div className="prose prose-sm max-w-none font-mono">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              FOST Documentation
            </h1>

            <p className="text-lg text-gray-600 mb-12">
              Learn how to use FOST to generate high-quality SDKs for REST APIs
              and Web3 smart contracts across multiple chains.
            </p>

            {/* Quick Start */}
            <section className="mb-16 rounded-lg bg-gradient-to-br from-green-50 to-blue-50 p-8 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🚀 Quick Start
              </h2>

              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    1. Create an Account
                  </h3>
                  <p className="text-gray-700">
                    Sign up on FOST to get 100 free credits and start generating SDKs
                    immediately.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    2. Upload Your Spec
                  </h3>
                  <p className="text-gray-700">
                    Upload an OpenAPI spec for REST APIs or a contract ABI for Web3
                    smart contracts.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    3. Select Languages
                  </h3>
                  <p className="text-gray-700">
                    Choose from 8 supported languages: TypeScript, Python, Go, Java,
                    C#, Rust, Ruby, PHP.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    4. Generate & Download
                  </h3>
                  <p className="text-gray-700">
                    Get a production-ready SDK with full type safety and
                    comprehensive documentation.
                  </p>
                </div>
              </div>

              <Link
                href="/platform/auth/signup"
                className="inline-block mt-6 rounded bg-accent-green px-6 py-2 font-mono font-bold text-white hover:bg-accent-green-dark"
              >
                Get Started Free
              </Link>
            </section>

            {/* Features */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Features</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    REST API SDKs
                  </h3>
                  <p className="text-sm text-gray-600">
                    Generate type-safe SDKs from OpenAPI 3.0 and Swagger 2.0
                    specifications.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Smart Contract SDKs
                  </h3>
                  <p className="text-sm text-gray-600">
                    Generate SDKs from Solidity contract ABIs with full Web3
                    support.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Multi-Chain Support
                  </h3>
                  <p className="text-sm text-gray-600">
                    Deploy to Ethereum, Polygon, Arbitrum, Optimism, Base, and
                    BSC.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Wallet Integration
                  </h3>
                  <p className="text-sm text-gray-600">
                    Built-in MetaMask and WalletConnect support for Web3 SDKs.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Gas Estimation
                  </h3>
                  <p className="text-sm text-gray-600">
                    Automatic gas estimation and optimization for all transactions.
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Event Subscriptions
                  </h3>
                  <p className="text-sm text-gray-600">
                    Listen to blockchain events with real-time subscriptions.
                  </p>
                </div>
              </div>
            </section>

            {/* Supported Languages */}
            <section className="mb-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🧑‍💻 Supported Languages
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  'TypeScript',
                  'Python',
                  'Go',
                  'Java',
                  'C#',
                  'Rust',
                  'Ruby',
                  'PHP',
                ].map((lang) => (
                  <div
                    key={lang}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center hover:bg-white hover:border-accent-green transition"
                  >
                    <p className="font-mono font-semibold text-sm text-gray-900">
                      {lang}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Help Section */}
            <section className="rounded-lg bg-gray-100 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
              <ul className="space-y-3 text-sm font-mono">
                <li>
                  <Link
                    href="/docs/resources/faq"
                    className="text-accent-green hover:underline"
                  >
                    → Check FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs/resources/troubleshooting"
                    className="text-accent-green hover:underline"
                  >
                    → Troubleshooting Guide
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/emmyhack/fost"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-green hover:underline"
                  >
                    → GitHub Issues
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
