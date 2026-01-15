'use client';

import { useAuth } from '../auth/auth-context';
import { WalletConnect } from './wallet-connect';

export function DashboardHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-accent-green font-mono">FOST</div>
            <div className="text-sm text-gray-600 font-mono">
              {user?.organization || 'Personal'}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <WalletConnect />
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono">
                <span className="text-gray-600">Credits: </span>
                <span className="font-bold text-accent-green">{user?.credits}</span>
              </div>
              <div className="text-sm font-mono">
                <span className="text-gray-600">Plan: </span>
                <span className="capitalize font-bold">{user?.plan}</span>
              </div>
              <button
                onClick={logout}
                className="rounded bg-red-600 px-4 py-2 text-sm font-mono text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
