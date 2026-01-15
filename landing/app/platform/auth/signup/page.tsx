'use client';

import { useState } from 'react';
import { useAuth } from '../../auth/auth-context';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signup(email, password, name);
      router.push('/platform/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="text-4xl font-bold text-accent-green font-mono">FOST</div>
          <div className="mt-2 text-sm text-gray-600 font-mono">Web3 SDK Generation</div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-lg border border-gray-200 bg-white p-8"
        >
          <h2 className="mb-6 text-xl font-bold font-mono">Create Account</h2>

          {error && (
            <div className="mb-4 rounded bg-red-50 p-3 text-sm font-mono text-red-700">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-mono font-semibold text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Developer"
              className="mt-2 w-full rounded border border-gray-300 px-4 py-2 font-mono text-sm focus:border-accent-green focus:outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-mono font-semibold text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded border border-gray-300 px-4 py-2 font-mono text-sm focus:border-accent-green focus:outline-none"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-mono font-semibold text-gray-700">
              Password (min 8 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded border border-gray-300 px-4 py-2 font-mono text-sm focus:border-accent-green focus:outline-none"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-accent-green px-6 py-3 font-mono font-bold text-white hover:bg-accent-green-dark disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="mt-4 text-center text-sm font-mono">
            <span className="text-gray-600">Already have an account? </span>
            <a href="/platform/auth/login" className="text-accent-green hover:underline">
              Sign in
            </a>
          </div>
        </form>

        {/* Features */}
        <div className="mt-6 space-y-2 rounded bg-green-50 p-4 text-xs font-mono text-gray-700">
          <p className="font-semibold text-accent-green mb-2">What you get:</p>
          <p>✓ 100 free credits</p>
          <p>✓ Multi-language SDK generation</p>
          <p>✓ Web3 smart contract support</p>
          <p>✓ Full API documentation</p>
        </div>
      </div>
    </div>
  );
}
