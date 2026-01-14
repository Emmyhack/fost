# FOST - Fast Open SDK Toolkit

A comprehensive TypeScript SDK generator for Web2 and Web3 APIs with LLM-powered code generation, prompt management, and safety features.

## Quick Start

```bash
# Build the project
npm run build

# Generate SDK from OpenAPI spec
node dist/src/cli/index.js generate --input api.yaml --lang typescript --type web2

# For Web3 SDK generation
node dist/src/cli/index.js generate --input api.yaml --lang typescript --type web3
```

## Features

- **Multi-target Support**: Generate SDKs for Web2 and Web3
- **LLM Operations**: AI-powered code generation with safety controls
- **Input Analysis**: Parse and normalize OpenAPI, Chain Metadata, and Contract ABI specifications
- **Code Generation**: Generate type-safe, optimized SDKs
- **CLI Tool**: Full-featured command-line interface
- **Monitoring**: Built-in metrics collection and health monitoring
- **Determinism Control**: Reproducible code generation with version management

## Project Structure

```
src/
├── cli/              # Command-line interface
├── input-analysis/   # Specification parsing and normalization
├── code-generation/  # SDK code generators
└── llm-operations/   # LLM orchestration and safety
```

## Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Code Generation Architecture](./CODE_GENERATION_ARCHITECTURE.md)
- [LLM Operations Strategy](./LLM_OPERATIONS_STRATEGY.md)
- [Project Status](./PROJECT_STATUS.md)
- [Delivery Summary](./DELIVERY_SUMMARY.md)

## Commands

- `generate` - Generate SDK from specification
- `validate` - Validate input specification
- `test` - Run generated SDK tests
- `lint` - Lint generated code
- `config` - Manage configuration
- `version` - Show version

## Build

```bash
npm run build     # Compile TypeScript
npm run watch     # Watch mode
npm run cli       # Run CLI
```

## License

MIT
