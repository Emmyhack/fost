/**
 * AIExplainer Component
 * Explains AI design system, local vs cloud, and safety/trust
 * Update content directly in this component as needed
 */

'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'What makes Fost different from manual SDK development?',
    answer:
      'Manual SDK development is time-consuming and error-prone. Fost uses AI to intelligently structure SDKs, auto-generate documentation, and ensure consistency across Web2 and Web3. You get production-ready code in minutes instead of weeks.',
  },
  {
    question: 'Are generated SDKs deterministic?',
    answer:
      'Yes. All generation decisions are reproducible. The same input always produces the same SDK structure, allowing you to version control and predict changes.',
  },
  {
    question: 'Can I customize the generated SDK?',
    answer:
      'Absolutely. Generated SDKs are plain TypeScript/JavaScript. You can modify, extend, and maintain them like any codebase. They\'re yours to own.',
  },
  {
    question: 'Does Fost support both REST and GraphQL APIs?',
    answer:
      'Yes. Fost supports OpenAPI/Swagger, GraphQL schemas, and blockchain contract ABIs. We\'re expanding support for more input formats continuously.',
  },
  {
    question: 'Is there a cost to use Fost?',
    answer:
      'Fost CLI is open-source and free to use locally. Cloud options may be available in the future, but local generation has no cost.',
  },
];

export default function AIExplainer() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* AI Workflow section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold">
              AI-Powered Architecture Design
            </h2>
            <p className="text-lg text-gray-600">
              Intelligent SDK structure that follows industry best practices
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Intelligent Design */}
            <div className="border border-gray-200 rounded-xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="mb-4 h-1 w-12 bg-gradient-to-r from-accent-green to-accent-green-dark rounded"></div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                Intelligent Design
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                Our AI understands your API semantics and generates SDKs with:
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-accent-green font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Logical method grouping and resource organization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Semantic naming conventions matching domain terminology</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Robust error handling and retry logic</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Developer experience optimizations and patterns</span>
                </li>
              </ul>
            </div>

            {/* Local & Control */}
            <div className="border border-gray-200 rounded-xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="mb-4 h-1 w-12 bg-gradient-to-r from-accent-green to-accent-green-dark rounded"></div>
              <h3 className="mb-3 text-2xl font-bold text-gray-900">
                Complete Ownership
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                You maintain full control over your generated SDKs:
              </p>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-accent-green font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Run locally with no external dependencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Generated code is standard TypeScript you can modify</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>No vendor lock-in or proprietary APIs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-green font-bold mt-0.5 flex-shrink-0">✓</span>
                  <span>Version control your SDKs with complete transparency</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Determinism & Safety */}
        <div className="mb-20 bg-gradient-to-r from-accent-green-light to-white border border-accent-green border-opacity-30 rounded-xl p-8 shadow-md">
          <div className="flex gap-4 items-start">
            <div className="text-accent-green font-bold text-xl flex-shrink-0 pt-1">→</div>
            <div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                Deterministic & Reproducible
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                Fost produces identical output from the same input every time. This means you can confidently track changes, maintain version control, and replicate builds across environments. All processing happens locally by default—your specifications never leave your infrastructure unless explicitly configured otherwise.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="mb-8 text-3xl sm:text-4xl font-bold text-center">
            Common Questions
          </h2>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <button className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-200">
                  <h4 className="font-semibold text-gray-900 text-left text-sm">
                    {item.question}
                  </h4>
                  <span
                    className={`ml-4 text-accent-green text-xl flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-gray-700 leading-relaxed text-sm animate-slide-up">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
