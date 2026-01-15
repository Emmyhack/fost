'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-accent-green font-mono">FOST</div>
            <span className="text-xs font-mono text-gray-600">Web3 SDK Generation</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/docs" className="font-mono text-sm hover:text-accent-green">
              Docs
            </Link>
            <Link href="/docs/web3/overview" className="font-mono text-sm hover:text-accent-green">
              Web3 Docs
            </Link>
            <Link href="/pricing" className="font-mono text-sm hover:text-accent-green">
              Pricing
            </Link>
            <a
              href="https://github.com/emmyhack/fost"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-sm hover:text-accent-green"
            >
              GitHub
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/platform/auth/login"
              className="font-mono text-sm hover:text-accent-green"
            >
              Sign In
            </Link>
            <Link
              href="/platform/dashboard"
              className="rounded bg-accent-green px-4 py-2 font-mono text-sm font-bold text-white hover:bg-accent-green-dark"
            >
              Launch App
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1 cursor-pointer">
              <div className="w-full h-0.5 bg-gray-900"></div>
              <div className="w-full h-0.5 bg-gray-900"></div>
              <div className="w-full h-0.5 bg-gray-900"></div>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 space-y-4">
            <Link href="/docs" className="block font-mono text-sm hover:text-accent-green">
              Docs
            </Link>
            <Link href="/docs/web3/overview" className="block font-mono text-sm hover:text-accent-green">
              Web3 Docs
            </Link>
            <Link href="/pricing" className="block font-mono text-sm hover:text-accent-green">
              Pricing
            </Link>
            <a
              href="https://github.com/emmyhack/fost"
              target="_blank"
              rel="noopener noreferrer"
              className="block font-mono text-sm hover:text-accent-green"
            >
              GitHub
            </a>
            <Link
              href="/platform/auth/login"
              className="block font-mono text-sm hover:text-accent-green"
            >
              Sign In
            </Link>
            <Link
              href="/platform/dashboard"
              className="block rounded bg-accent-green px-4 py-2 font-mono text-sm font-bold text-white hover:bg-accent-green-dark text-center"
            >
              Launch App
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
