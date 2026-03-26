'use client';

import { useAuth } from '../auth/auth-context';
import { DashboardHeader } from '../components/dashboard-header';
import { SDKGeneratorForm } from '../components/sdk-generator-form';
import PricingModal from '../components/pricing-modal';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface UserStats {
  sdksGenerated: number;
  specsProcessed: number;
  chainsSupported: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<UserStats>({ sdksGenerated: 0, specsProcessed: 0, chainsSupported: 5 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [userCredits, setUserCredits] = useState(0);

  // Redirect immediately if not authenticated (no loading state)
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push('/platform/auth/login?next=/platform/dashboard');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchUserStats();
    }
  }, [isAuthenticated, user?.id]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/user/stats?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          sdksGenerated: data.sdksGenerated || 0,
          specsProcessed: data.specsProcessed || 0,
          chainsSupported: 5,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Show skeleton loaders while authenticated but data is loading
  if (isAuthenticated && statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
        <DashboardHeader />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-12 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded"></div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-12">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded"></div>)}
          </div>
        </main>
      </div>
    );
  }

  // If not authenticated and not redirecting, show nothing
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <DashboardHeader />
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        currentCredits={userCredits}
      />
      
      <main className="min-h-screen bg-gradient-to-br from-white to-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold font-mono mb-2">
              Welcome, <span className="text-accent-green">{user?.name || 'User'}</span>
            </h1>
            <p className="text-gray-600 font-mono">
              Best-in-class Web3 SDK generation for smart contracts, APIs, and beyond.
            </p>
          </div>

          {/* Stats */}
          <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="text-sm font-mono text-gray-600">SDKs Generated</div>
              <div className="mt-2 text-3xl font-bold font-mono">{stats.sdksGenerated}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="text-sm font-mono text-gray-600">API Specs Processed</div>
              <div className="mt-2 text-3xl font-bold font-mono">{stats.specsProcessed}</div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="text-sm font-mono text-gray-600">Web3 Chains Supported</div>
              <div className="mt-2 text-3xl font-bold font-mono text-accent-green">{stats.chainsSupported}</div>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-6">
              <div className="text-sm font-mono text-gray-600">Available Credits</div>
              <div className="mt-2 text-3xl font-bold font-mono text-accent-green">{userCredits}</div>
              <button
                onClick={() => setIsPricingOpen(true)}
                className="mt-4 w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-lg font-semibold text-sm hover:from-green-700 hover:to-green-800 transition-all"
              >
                Get More Credits
              </button>
            </div>
          </div>

          {/* Main Generator */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <SDKGeneratorForm onSuccess={fetchUserStats} />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Features */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="mb-4 font-mono font-bold">Web3 Features</h3>
                <ul className="space-y-3 text-sm font-mono">
                  <li className="flex items-start gap-2">
                    <span className="text-accent-green">✓</span>
                    <span>Smart Contract ABIs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-green">✓</span>
                    <span>Multi-chain Support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-green">✓</span>
                    <span>Wallet Integration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-green">✓</span>
                    <span>Gas Estimation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent-green">✓</span>
                    <span>Event Subscriptions</span>
                  </li>
                </ul>
              </div>

              {/* Quick Start */}
              <div className="rounded-lg border border-accent-green bg-green-50 p-6">
                <h3 className="mb-4 font-mono font-bold text-accent-green">Quick Start</h3>
                <p className="mb-4 text-xs font-mono text-gray-700">
                  1. Upload your OpenAPI spec or smart contract ABI
                </p>
                <p className="mb-4 text-xs font-mono text-gray-700">
                  2. Select target languages
                </p>
                <p className="text-xs font-mono text-gray-700">
                  3. Generate and download your SDK
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
