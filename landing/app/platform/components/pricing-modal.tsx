'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits?: number;
}

interface Plan {
  name: string;
  price: number;
  credits: number;
  description: string;
  features: string[];
}

const plans: Plan[] = [
  {
    name: 'Pro',
    price: 29.99,
    credits: 1000,
    description: 'For active developers',
    features: [
      '1000 credits',
      'Multi-language SDKs',
      'Web3 integration',
      'Priority support',
      'Monthly renewal',
    ],
  },
  {
    name: 'Enterprise',
    price: 99.99,
    credits: 5000,
    description: 'For production use',
    features: [
      '5000 credits',
      'All Pro features',
      'Dedicated support',
      'Custom integrations',
      'Webhook access',
      'Monthly renewal',
    ],
  },
];

export default function PricingModal({
  isOpen,
  onClose,
  currentCredits = 0,
}: PricingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (planName: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planName.toLowerCase() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create payment session');
      }

      const { redirectUrl } = await response.json();

      // Redirect to Paycrest checkout
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-90vh overflow-y-auto"
      >
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Upgrade Plan</h2>
              <p className="text-gray-600 mt-1">
                Current credits: <span className="font-semibold text-green-600">{currentCredits}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Plans Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                whileHover={{ translateY: -4 }}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-green-500 transition-colors"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>

                {/* Credits */}
                <div className="bg-green-50 rounded-lg p-3 mb-6 text-center">
                  <p className="text-green-700 font-semibold">
                    {plan.credits.toLocaleString()} Credits
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-green-600 mt-1">✓</span>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-2 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Upgrade Now'}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="text-center text-gray-600 text-sm">
            <p>
              Credits are added to your account upon payment completion.
            </p>
            <p className="mt-2">
              Powered by <span className="font-semibold">Paycrest</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
