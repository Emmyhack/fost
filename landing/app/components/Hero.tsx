/**
 * Hero Component
 * Main landing section with Web3-focused messaging
 */

import Link from 'next/link';
import { SITE_CONFIG } from '../constants';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
      {/* Accent background elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-accent-green-light rounded-full filter blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent-green-light rounded-full filter blur-3xl opacity-15 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto text-center animate-fade-in relative z-10">
        {/* Main heading */}
        <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight font-mono">
          Best-in-Class
          <br />
          <span className="bg-gradient-to-r from-accent-green via-accent-green to-accent-green-dark bg-clip-text text-transparent">
            Web3 SDK Generation
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-mono">
          Smart contract ABIs → Type-safe SDKs. Multi-chain support, wallet integration, gas estimation, and event subscriptions. 
          From ABI to production in minutes.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="/platform/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 bg-accent-green text-white font-semibold rounded-lg hover:bg-accent-green-dark transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-mono"
          >
            Launch Dashboard
          </a>
          <a
            href="/web3-docs"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-accent-green text-accent-green font-semibold rounded-lg hover:bg-accent-green-light transition-all duration-200 shadow-md hover:shadow-lg font-mono"
          >
            Web3 Features
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
          <div className="bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="text-2xl font-bold text-accent-green mb-2 font-mono">✓</div>
            <h3 className="font-mono font-bold text-sm mb-2">Multi-Chain</h3>
            <p className="text-xs text-gray-600 font-mono">Ethereum, Polygon, Arbitrum, Optimism, Base</p>
          </div>

          <div className="bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="text-2xl font-bold text-accent-green mb-2 font-mono">✓</div>
            <h3 className="font-mono font-bold text-sm mb-2">Type-Safe</h3>
            <p className="text-xs text-gray-600 font-mono">TypeScript, Python, Go, Rust & more</p>
          </div>

          <div className="bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="text-2xl font-bold text-accent-green mb-2 font-mono">✓</div>
            <h3 className="font-mono font-bold text-sm mb-2">Production-Ready</h3>
            <p className="text-xs text-gray-600 font-mono">Gas estimation, wallets, events</p>
          </div>
        </div>

        {/* Flow */}
        <div className="mt-12 bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-xl p-8 max-w-2xl mx-auto shadow-lg">
          <div className="space-y-3 text-sm text-gray-700 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">1. Contract ABI</span>
              <span className="text-accent-green">→</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">2. Select Chain & Language</span>
              <span className="text-accent-green">→</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">3. Integrated Features</span>
              <span className="text-accent-green">→</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">4. Download SDK</span>
              <span className="text-accent-green font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
