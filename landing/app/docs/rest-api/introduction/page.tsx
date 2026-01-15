'use client';

export default function RESTIntroductionPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">REST API SDKs</h1>
      <p className="text-lg text-gray-600 mb-8">
        Generate type-safe SDKs from OpenAPI and Swagger specifications
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">What Are REST API SDKs?</h2>
          <p className="text-gray-700 mb-4">
            REST API SDKs are client libraries that handle all the complexity of calling your API. FOST generates them automatically from OpenAPI specifications.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Features</h2>
          <ul className="space-y-3 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Auto-generated methods</strong> for every API endpoint</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Full type safety</strong> with TypeScript support</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Error handling</strong> for failed requests</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Request validation</strong> before sending</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Response parsing</strong> with proper types</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Quick Example</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { PetStoreAPI } from '@petstore/sdk';

const client = new PetStoreAPI({
  serverURL: 'https://api.petstore.com/v1'
});

// Fully typed method
const pets = await client.listPets({ limit: 10 });
console.log(pets); // TypeScript knows the return type

// Type-safe error handling
try {
  await client.getPet({ petId: '123' });
} catch (error) {
  if (error.statusCode === 404) {
    console.log('Pet not found');
  }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Supported Formats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">OpenAPI 3.0</p>
              <p className="text-sm text-gray-600">Latest OpenAPI specification with full support</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Swagger 2.0</p>
              <p className="text-sm text-gray-600">Older Swagger format still widely used</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Languages Supported</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {['TypeScript', 'Python', 'Go', 'Java', 'C#', 'Rust', 'Ruby', 'PHP'].map(lang => (
              <div key={lang} className="rounded-lg border border-gray-200 p-3 text-center">
                <p className="font-mono text-sm">{lang}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
          <p className="text-gray-700 mb-4">
            Ready to generate your first REST API SDK?
          </p>
          <p className="text-gray-700">
            Start with <a href="/docs/getting-started/first-sdk" className="text-accent-green hover:underline">Generate Your First SDK</a> tutorial.
          </p>
        </section>
      </div>
    </div>
  );
}
