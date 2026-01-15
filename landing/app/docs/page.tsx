'use client';

import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto p-12">
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
  );
}
