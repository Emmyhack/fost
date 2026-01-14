/**
 * CodeExamples Component
 * Showcases Web2 and Web3 SDK usage examples with side-by-side comparison
 * Edit WEB2_EXAMPLE and WEB3_EXAMPLE in constants.ts to update content
 */

import { WEB2_EXAMPLE, WEB3_EXAMPLE } from '../constants';
import CodeBlock from './CodeBlock';

export default function CodeExamples() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold">
            Generated SDK Examples
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Type-safe client code generated directly from your specification
          </p>
        </div>

        {/* Examples grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Web2 Example */}
          <div className="animate-slide-up bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-8 shadow-md">
            <div className="mb-6">
              <div className="mb-2 h-1 w-12 bg-gradient-to-r from-accent-green to-accent-green-dark rounded"></div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                {WEB2_EXAMPLE.title}
              </h3>
              <p className="text-gray-600 text-sm">{WEB2_EXAMPLE.description}</p>
            </div>
            <CodeBlock code={WEB2_EXAMPLE.code} language="typescript" />
          </div>

          {/* Web3 Example */}
          <div className="animate-slide-up bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-8 shadow-md" style={{ animationDelay: '100ms' }}>
            <div className="mb-6">
              <div className="mb-2 h-1 w-12 bg-gradient-to-r from-accent-green to-accent-green-dark rounded"></div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">
                {WEB3_EXAMPLE.title}
              </h3>
              <p className="text-gray-600 text-sm">{WEB3_EXAMPLE.description}</p>
            </div>
            <CodeBlock code={WEB3_EXAMPLE.code} language="typescript" />
          </div>
        </div>

        {/* SDK Benefits summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="mb-2 font-bold text-gray-900">Documentation</h4>
            <p className="text-sm text-gray-600">
              Comprehensive JSDoc comments and README files auto-generated
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="mb-2 font-bold text-gray-900">Type Safety</h4>
            <p className="text-sm text-gray-600">
              Full TypeScript support with IDE autocomplete and compile-time checking
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-8 bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
            <h4 className="mb-2 font-bold text-gray-900">Examples</h4>
            <p className="text-sm text-gray-600">
              Ready-to-use code snippets and integration patterns included
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
