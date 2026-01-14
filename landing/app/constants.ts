/**
 * Constants and configuration for the landing site
 * Update these to customize text, links, and content
 */

export const SITE_CONFIG = {
  title: 'Fost',
  tagline: 'Generate Production-Ready SDKs Automatically',
  description: 'AI-powered SDK generation for Web2 and Web3 APIs. Create fully-typed, documented SDKs in minutes.',
  github: 'https://github.com/Emmyhack/fost',
  npm: 'https://www.npmjs.com/package/fost',
  docs: 'https://github.com/Emmyhack/fost#documentation',
  twitter: 'https://twitter.com/fostdev',
};

export const ACCENT_GREEN = '#10B981';

export const STEPS = [
  {
    number: 1,
    title: 'Install CLI',
    description:
      'Install Fost globally to get started. Works on macOS, Linux, and Windows.',
    code: 'npm install -g fost',
  },
  {
    number: 2,
    title: 'Provide Specification',
    description:
      'Point Fost to your API specification—OpenAPI, GraphQL schema, or smart contract ABI.',
    code: 'fost generate --input ./openapi.yaml --output ./sdk',
  },
  {
    number: 3,
    title: 'Generate & Validate',
    description:
      'AI processes your specification, structures the SDK architecture, generates code, and validates output.',
    code: `Analyzing specification...
Designing SDK architecture...
Generating TypeScript code...
Creating JSDoc documentation...
Validating types and exports...
✓ SDK generated successfully (1.2s)`,
    isTerminal: true,
  },
  {
    number: 4,
    title: 'Deploy & Use',
    description:
      'Use your generated SDK immediately. Fully typed, tree-shakeable, and production-ready with zero overhead.',
    code: `import { APIClient } from './sdk';

const client = new APIClient({ 
  baseUrl: 'https://api.example.com',
  apiKey: process.env.API_KEY 
});

const response = await client.resources.list();`,
  },
];

export const FEATURES = [
  {
    title: 'Full Stack Support',
    description:
      'Generate SDKs for REST APIs, GraphQL endpoints, and smart contract ABIs from a single tool.',
  },
  {
    title: 'AI-Optimized Architecture',
    description:
      'Intelligent method grouping, semantic naming, and DX improvements powered by large language models.',
  },
  {
    title: 'Deterministic Generation',
    description:
      'Consistent, reproducible output every time. Same input always produces identical SDKs for version control.',
  },
  {
    title: 'Complete Documentation',
    description:
      'Auto-generated JSDoc comments, README files, and usage examples included with every SDK.',
  },
  {
    title: 'Type-Safe by Default',
    description:
      'TypeScript-first with complete type definitions, generics, and discriminated unions for IDE support.',
  },
  {
    title: 'Self-Hosted or Cloud',
    description:
      'Run locally with full privacy or use cloud infrastructure. Generated SDKs are entirely yours to maintain.',
  },
];

export const WEB2_EXAMPLE = {
  title: 'REST API SDK Generation',
  description: 'Automatically generate a type-safe client from an OpenAPI specification',
  code: `import { PaymentClient } from './sdk';

const client = new PaymentClient({
  baseURL: 'https://api.payment.example.com',
  headers: { Authorization: \`Bearer \${apiKey}\` },
});

// Fully typed with autocomplete and compile-time safety
const response = await client.payments.create({
  amount: 9999,
  currency: 'USD',
  method: 'card',
});

console.log(\`Transaction \${response.id} completed\`);`,
};

export const WEB3_EXAMPLE = {
  title: 'Smart Contract SDK Generation',
  description: 'Generate a type-safe contract client from a smart contract ABI',
  code: `import { UniswapV4Router } from './sdk';

const router = new UniswapV4Router({
  rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/KEY',
  contractAddress: '0x68b3465833fb72B5A828cCCAC310fAe11f54A72e',
});

// Type-safe contract interactions with full TypeScript support
const quote = await router.quoteSwap({
  tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',  // USDC
  tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',  // WETH
  amountIn: '1000000000',
});

const receipt = await router.swap(quote);
console.log(\`Swap executed: \${receipt.transactionHash}\`);`,
};

export const FAQ_ITEMS = [
  {
    question: 'How does Fost compare to manual SDK development?',
    answer:
      'Manual SDK development is time-intensive and error-prone. Fost automates architecture decisions, naming consistency, documentation generation, and type safety. What takes days to develop manually is generated in seconds, with fewer bugs and better maintainability.',
  },
  {
    question: 'Are generated SDKs reproducible?',
    answer:
      'Yes. Fost produces deterministic output—the same specification always generates identical SDKs. This enables version control, predictable updates, and reproducible builds across teams.',
  },
  {
    question: 'Can I modify the generated code?',
    answer:
      'Absolutely. Generated SDKs are standard TypeScript/JavaScript that you own completely. Modify, extend, or maintain them as you would any codebase. There is no lock-in.',
  },
  {
    question: 'What input formats are supported?',
    answer:
      'Fost supports OpenAPI 3.x, GraphQL schemas, JSON Schema, and EVM smart contract ABIs. We continue expanding format support—custom parsers can be added for specialized use cases.',
  },
  {
    question: 'Does Fost have licensing costs?',
    answer:
      'The CLI is open-source and free to use. Cloud-hosted generation and premium features may be available, but local self-hosted generation has no cost.',
  },
];
