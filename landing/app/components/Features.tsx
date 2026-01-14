/**
 * Features Component
 * Grid of feature cards highlighting key capabilities
 * Edit FEATURES array in constants.ts to update content
 */

import { FEATURES } from '../constants';

export default function Features() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Why Choose Fost
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built for teams that prioritize code quality, consistency, and developer productivity
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feature, index) => (
            <div
              key={index}
              className="animate-slide-up bg-white border border-gray-200 rounded-xl p-8 shadow-md hover:shadow-xl hover:border-accent-green hover:border-opacity-50 transition-all duration-300 cursor-default"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {/* Accent line */}
              <div className="mb-6 h-1 w-12 bg-gradient-to-r from-accent-green to-accent-green-dark rounded"></div>

              {/* Title */}
              <h3 className="mb-3 text-xl font-bold text-gray-900">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
