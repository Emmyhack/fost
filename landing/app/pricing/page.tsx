'use client';

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Get started with Web3 SDK generation',
      credits: 100,
      features: [
        'Multi-chain support',
        '5 SDKs/month',
        'Basic features',
        'Community support',
        'TypeScript only',
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$49',
      period: '/month',
      description: 'For serious Web3 developers',
      credits: 5000,
      features: [
        'Unlimited SDKs',
        'All 8 languages',
        'Gas estimation',
        'Event subscriptions',
        'Priority support',
        'API access',
        'Custom tooling',
      ],
      cta: 'Start Building',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For teams and organizations',
      credits: 'Unlimited',
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
        'On-premise option',
        'Advanced analytics',
        'Team management',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold font-mono">Simple, Transparent Pricing</h1>
          <p className="text-lg text-gray-600 font-mono">
            Choose the plan that fits your Web3 SDK needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-lg border-2 transition-transform hover:scale-105 ${
                plan.highlighted
                  ? 'border-accent-green bg-accent-green/5 ring-2 ring-accent-green md:scale-105'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {plan.highlighted && (
                <div className="bg-accent-green px-4 py-2 text-center font-mono text-xs font-bold text-white">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Plan Name */}
                <h2 className="mb-2 text-2xl font-bold font-mono">{plan.name}</h2>
                <p className="mb-6 text-sm text-gray-600 font-mono">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>
                  <div className="mt-2 text-sm text-gray-600 font-mono">
                    {plan.credits} credits/month
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full rounded py-3 font-mono font-bold transition mb-8 ${
                    plan.highlighted
                      ? 'bg-accent-green text-white hover:bg-accent-green-dark'
                      : 'border-2 border-gray-300 text-gray-700 hover:border-accent-green hover:text-accent-green'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, fidx) => (
                    <div key={fidx} className="flex items-start gap-3 text-sm font-mono">
                      <span className="text-accent-green">✓</span>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 space-y-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-mono text-center mb-12">FAQ</h2>

          {[
            {
              q: 'What are credits?',
              a: 'Credits are used for SDK generation. Each generation costs between 1-50 credits depending on complexity.',
            },
            {
              q: 'Can I upgrade/downgrade anytime?',
              a: 'Yes! You can change your plan at any time. Changes take effect immediately.',
            },
            {
              q: 'Is there a free trial?',
              a: 'Yes! The Free plan gives you 100 credits to get started.',
            },
            {
              q: 'Do you offer discounts?',
              a: 'Yes! Annual billing gets 20% off. Contact our sales team for volume discounts.',
            },
            {
              q: 'What about Web3 chains?',
              a: 'All plans support all 5+ chains. Web3 features are available from Pro and up.',
            },
          ].map((item, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 bg-white p-6 font-mono">
              <h3 className="mb-3 font-bold text-lg">{item.q}</h3>
              <p className="text-gray-700">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
