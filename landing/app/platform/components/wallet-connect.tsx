'use client';

import { useWeb3 } from '../auth/web3-context';
import { useEffect, useState } from 'react';

export function WalletConnect() {
  const { address, chainId, isConnecting, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const [hasMetaMask, setHasMetaMask] = useState(true);

  useEffect(() => {
    // Check if MetaMask is actually installed
    setHasMetaMask(typeof window !== 'undefined' && !!(window as any).ethereum);
  }, []);

  const getChainName = (id: number | null) => {
    const chains: Record<number, string> = {
      1: 'Ethereum',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      8453: 'Base',
      56: 'BSC',
    };
    return chains[id || 0] || `Chain ${id}`;
  };

  if (!hasMetaMask) {
    return (
      <div className="rounded bg-yellow-50 px-4 py-2 text-xs font-mono border border-yellow-200">
        <div className="text-yellow-700">MetaMask not installed</div>
        <a
          href="https://metamask.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-600 hover:underline text-xs"
        >
          Install MetaMask →
        </a>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <div className="rounded bg-green-50 px-3 py-2 text-xs font-mono border border-accent-green">
          <div className="text-accent-green font-bold">{getChainName(chainId)}</div>
          <div className="text-gray-600">{address.slice(0, 6)}...{address.slice(-4)}</div>
        </div>
        <button
          onClick={disconnectWallet}
          className="rounded bg-red-50 px-3 py-2 text-xs font-mono border border-red-200 text-red-600 hover:bg-red-100"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="rounded bg-accent-green px-4 py-2 font-mono text-sm font-bold text-white hover:bg-accent-green-dark disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
