/**
 * Hero Component
 * Main landing section with headline, description, and CTA buttons
 * Customize SITE_CONFIG in constants.ts to update text
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
        {/* Status badge */}
        <div className="mb-8 inline-block px-4 py-2 bg-accent-green-light border border-accent-green border-opacity-50 rounded-full text-sm font-semibold text-accent-green shadow-sm">
          Automate SDK development with AI
        </div>

        {/* Main heading */}
        <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
          Generate Production-Ready
          <br />
          <span className="bg-gradient-to-r from-accent-green via-accent-green to-accent-green-dark bg-clip-text text-transparent">
            SDKs Automatically
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
          Type-safe, fully-documented SDKs for REST APIs, GraphQL endpoints, and smart contracts. 
          From specification to deployment in minutes.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href={SITE_CONFIG.npm}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 bg-accent-green text-white font-semibold rounded-lg hover:bg-accent-green-dark transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Download CLI
          </a>
          <a
            href={SITE_CONFIG.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-accent-green text-accent-green font-semibold rounded-lg hover:bg-accent-green-light transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Read Docs
          </a>
        </div>

        {/* Value proposition flow */}
        <div className="bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-xl p-8 max-w-2xl mx-auto shadow-lg">
          <div className="space-y-4 text-sm text-gray-700 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">API Specification</span>
              <span className="text-accent-green">→</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">AI Architecture Design</span>
              <span className="text-accent-green">→</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Type-Safe Implementation</span>
              <span className="text-accent-green">→</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Production-Ready SDK</span>
              <span className="text-accent-green font-bold">✓</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
