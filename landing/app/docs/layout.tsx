'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['getting-started', 'web3'])
  );

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
      ],
    },
    {
      id: 'chains',
      title: 'Blockchain Networks',
      items: [
        { title: 'Ethereum', href: '/docs/chains/ethereum' },
        { title: 'Polygon', href: '/docs/chains/polygon' },
      ],
    },
    {
      id: 'guides',
      title: 'Guides & Tutorials',
      items: [
        { title: 'Build a DeFi SDK', href: '/docs/guides/defi-sdk' },
        { title: 'NFT Contract SDK', href: '/docs/guides/nft-sdk' },
        { title: 'Governance DAO SDK', href: '/docs/guides/dao-sdk' },
      ],
    },
    {
      id: 'reference',
      title: 'API Reference',
      items: [
        { title: 'CLI Commands', href: '/docs/reference/cli' },
      ],
    },
    {
      id: 'resources',
      title: 'Resources',
      items: [
        { title: 'GitHub', href: 'https://github.com/emmyhack/fost' },
      ],
    },
  ];

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 text-sm font-mono">
            <Link href="/" className="text-accent-green hover:underline font-bold">
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
          <div className="sticky top-20 p-6 space-y-6 max-h-[calc(100vh-80px)] overflow-y-auto">
            {docSections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full text-left font-mono font-semibold text-sm text-gray-900 hover:text-accent-green mb-3 flex items-center justify-between"
                >
                  <span>{section.title}</span>
                  <span className="text-xs text-gray-400">
                    {expandedSections.has(section.id) ? '▼' : '▶'}
                  </span>
                </button>

                {expandedSections.has(section.id) && (
                  <nav className="space-y-1 ml-2">
                    {section.items.map((item) => {
                      const isLink = item.href.startsWith('http');
                      const active = isActive(item.href);

                      return (
                        <div key={item.title}>
                          {isLink ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block font-mono text-xs text-gray-600 hover:text-accent-green py-2 px-3 rounded hover:bg-white transition"
                            >
                              {item.title} ↗
                            </a>
                          ) : (
                            <Link
                              href={item.href}
                              className={`block font-mono text-xs py-2 px-3 rounded transition ${
                                active
                                  ? 'bg-accent-green text-white font-bold'
                                  : 'text-gray-600 hover:text-accent-green hover:bg-white'
                              }`}
                            >
                              {item.title}
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </nav>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
