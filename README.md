# Fost - AI-Powered SDK Generator

Generate fully-typed, production-ready **TypeScript** SDKs in minutes from OpenAPI specs or smart contract ABIs.

## What is Fost?

Fost is a powerful CLI tool that transforms API specifications into complete, type-safe TypeScript SDKs with zero configuration. Supports both Web2 (REST APIs) and Web3 (smart contracts) specifications.

**Repository**: [github.com/geekstrancend/fost](https://github.com/geekstrancend/fost)

**Why Fost?**

- ⚡ **Fast**: Generate SDKs in minutes, not days
- 📦 **Complete**: Includes types, docs, tests, and examples
- 🔒 **Type-Safe**: Full TypeScript support with strict typing
- 🧠 **AI-Powered**: LLM-enhanced code generation for quality
- 🌐 **Multi-Platform**: Web2 + Web3 support
- 🛠️ **Developer-First**: Clean CLI, sensible defaults, zero dependencies

## Quick Start

### Installation

```bash
npm install -g fost
```

### Generate Your First SDK

```bash
# From OpenAPI spec
fost generate api.openapi.yaml --lang typescript --output ./sdk

# From smart contract ABI
fost generate contract.abi.json --lang typescript --type web3 --output ./sdk

# Validate before generating
fost validate api.openapi.yaml
```

## Features

### Supported Input Formats ✅

- **REST APIs**: OpenAPI 3.0+, Swagger 2.0
- **Smart Contracts**: EVM ABI (Ethereum, Polygon, Arbitrum, etc.)
- **Blockchain**: Chain metadata for multi-chain support

### Output Target Languages ✅

- **TypeScript** (Production-ready, fully featured)

### Roadmap 🗓️

- Python code generation (v0.2)
- GraphQL schema support (v0.2)
- Solana IDL support (v0.2)
- Go, Rust language targets (future)

### Generated SDK Includes

- Fully-typed client class
- Type definitions for all requests/responses
- Comprehensive API documentation
- Example code and usage patterns
- Unit and integration tests
- Error handling with custom error types

### Configuration

Create `fost.config.json`:

```json
{
  "outputDir": "./sdk",
  "language": "typescript",
  "includeTests": true,
  "includeDocs": true,
  "strict": true,
  "logLevel": "info"
}
```

Or use `package.json`:

```json
{
  "fost": {
    "outputDir": "./sdk",
    "language": "typescript"
  }
}
```

## Commands

```bash
fost generate [input] [options]    # Generate SDKs
fost validate [input]               # Validate specifications
fost config show                    # Show configuration
fost --version                      # Show version
fost --help                         # Show help
```

## Environment Variables

```bash
DEBUG=1 fost generate api.yaml      # Enable debug output
NO_COLOR=1 fost generate api.yaml   # Disable colored output
```

## Examples

### OpenAPI to TypeScript SDK

```bash
fost generate petstore.openapi.yaml \
  --lang typescript \
  --output ./petstore-sdk
```

Generated code:

```typescript
import { PetstoreClient } from './petstore-sdk';

const client = new PetstoreClient();
const pet = await client.pets.get('123');
console.log(pet); // Fully typed!
```

### Smart Contract to Web3 SDK

```bash
fost generate uniswap-v4.abi.json \
  --lang typescript \
  --type web3 \
  --output ./uniswap-sdk
```

Generated code:

```typescript
import { UniswapV4 } from './uniswap-sdk';

const contract = new UniswapV4(provider);
const pools = await contract.getPools();
return pools; // Type-safe with ABI runtime checking
```

## Project Structure

```plaintext
src/
├── cli/              # Command-line interface
├── errors/           # Error handling system
├── logger/           # Structured logging
├── config/           # Configuration management
├── code-generation/  # SDK code generators
├── input-analysis/   # Spec parsing & normalization
├── llm-operations/   # LLM integration
└── plugins/          # Plugin system
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Watch mode
npm run watch

# Try locally
npm run cli -- --help
```

## Release Process

To publish a new version:

1. **Setup NPM Token** (first time only):
   - Navigate to GitHub Settings → Secrets → Actions
   - Add a new secret named `NPM_TOKEN` with your npm authentication token
   - You can generate this token at <https://www.npmjs.com/settings/~/tokens>

2. **Create a release**:

   ```bash
   npm run release        # For patch version (v1.0.0 → v1.0.1)
   npm run release:minor  # For minor version (v1.0.0 → v1.1.0)
   npm run release:major  # For major version (v1.0.0 → v2.0.0)
   git push --follow-tags
   ```

3. **The GitHub Actions workflow will automatically**:
   - Run tests and lint
   - Build the package
   - Update CHANGELOG.md
   - Publish to npm
   - Create a GitHub Release

The publish workflow only runs when pushing a tag matching `v*` (e.g., `v0.1.0`).

## Documentation

See detailed guides in the `docs/` folder:

- [Quick Start Guide](./docs/quickstart.md)
- [CLI Reference](./docs/cli-reference.md)
- [Architecture Overview](./docs/README.md)

## License

MIT - See [LICENSE](./LICENSE) for details

## Support

- **Issues**: [GitHub Issues](https://github.com/geekstrancend/fost/issues)
- **Discussions**: [GitHub Discussions](https://github.com/geekstrancend/fost/discussions)
- **Docs**: [Full documentation](./docs/)

---

Built with TypeScript, tested with Vitest, and published to npm.

**Fost** - Generate SDKs. Not documentation. Not boilerplate. Real, usable code.
