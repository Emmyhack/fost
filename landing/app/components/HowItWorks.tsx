/**
 * HowItWorks Component
 * Step-by-step walkthrough with code snippets and terminal output
 * Edit STEPS array in constants.ts to update content
 */

import { STEPS } from '../constants';
import CodeBlock from './CodeBlock';

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From specification to production in four straightforward steps
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="animate-slide-up flex flex-col gap-6 bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Step card with number and description */}
              <div className="flex gap-6">
                <div className="flex-shrink-0 pt-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-accent-green to-accent-green-dark text-white font-bold text-lg shadow-md">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl sm:text-2xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Code block */}
              <CodeBlock
                code={step.code}
                isTerminal={step.isTerminal || false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
