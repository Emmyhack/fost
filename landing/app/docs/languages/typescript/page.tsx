'use client';

export default function TypeScriptPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">TypeScript SDK Guide</h1>
      <p className="text-lg text-gray-600 mb-8">
        Using generated SDKs with full TypeScript type safety
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Why TypeScript?</h2>
          <ul className="space-y-3 mb-4">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Type Safety:</strong> Catch errors at compile time</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>IDE Autocompletion:</strong> IntelliSense for all methods</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Documentation:</strong> Types serve as inline docs</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span className="text-gray-700"><strong>Refactoring:</strong> Safe code changes with full coverage</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`npm install @sdk-name/typescript
npm install --save-dev typescript`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`import { MyContractSDK } from '@mycontract/typescript';
import { BrowserProvider } from 'ethers';

const provider = new BrowserProvider(window.ethereum);
const sdk = new MyContractSDK(provider);

const balance: bigint = await sdk.balanceOf('0x...');
const tx = await sdk.transfer({
  to: '0xRecipient',
  amount: '1000000000000000000'
});`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Type Definitions</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`interface TransferParams {
  to: string;
  amount: string | bigint;
}

class MyWallet {
  async sendTokens(params: TransferParams): Promise<string> {
    const tx = await this.sdk.transfer(params);
    return tx.hash;
  }
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Enable strict mode:</strong> Add "strict": true in tsconfig.json</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Define interfaces:</strong> For better type safety</span>
            </li>
            <li className="flex gap-3">
              <span className="text-accent-green">✓</span>
              <span><strong>Write tests:</strong> Use vitest or jest</span>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Learn More</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="https://www.typescriptlang.org/docs/" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">TypeScript Documentation</a></li>
            <li><a href="/docs/getting-started/first-sdk" className="text-accent-green hover:underline">First SDK Guide</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
