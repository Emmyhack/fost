# FOST SDK Generator - Project Structure and User Flows

## Project Structure

### Root Directory

```
fost/
├── package.json                          # Main package configuration
├── tsconfig.json                         # TypeScript configuration
├── CLI_SPECIFICATION.md                  # CLI documentation (you are here)
├── ARCHITECTURE.md                       # Overall architecture
├── TESTING_STRATEGY.md                   # Testing and validation layer
├── README.md                             # Project readme
│
├── src/
│   ├── cli/                              # CLI implementation
│   │   ├── index.ts                      # Main CLI entry point
│   │   ├── argument-parser.ts            # Command-line argument parsing
│   │   ├── logger.ts                     # Logging utilities
│   │   ├── progress-reporter.ts          # Progress display
│   │   └── commands/                     # Individual command handlers
│   │       ├── generate.ts
│   │       ├── validate.ts
│   │       ├── test.ts
│   │       ├── lint.ts
│   │       └── config.ts
│   │
│   ├── api/                              # Programmatic API
│   │   ├── generator-api.ts              # Main API interface
│   │   └── hooks.ts                      # Lifecycle hooks
│   │
│   ├── input-analysis/                   # Input schema analysis
│   │   ├── index.ts
│   │   ├── base-parser.ts
│   │   ├── normalizer.ts
│   │   ├── types.ts
│   │   └── parsers/
│   │       ├── openapi.ts
│   │       ├── graphql.ts
│   │       ├── contract-abi.ts
│   │       └── chain-metadata.ts
│   │
│   ├── code-generation/                  # Code generation engine
│   │   ├── index.ts
│   │   ├── generators.ts                 # Language-specific generators
│   │   ├── emitter.ts                    # Code emitter
│   │   ├── types.ts                      # SDK design types
│   │   ├── api.ts                        # API generation
│   │   ├── validation.ts                 # Validation layer
│   │   ├── testing.ts                    # Test generation
│   │   ├── doc-generator.ts              # Documentation generator
│   │   └── examples.ts                   # Example code generation
│   │
│   └── utils/                            # Shared utilities
│       ├── file-system.ts
│       ├── string-utils.ts
│       ├── config-loader.ts
│       └── error-handler.ts
│
├── bin/
│   ├── sdkgen.ts                         # CLI executable entry point
│   └── sdkgen.js                         # Compiled JavaScript entry point
│
├── tests/
│   ├── cli/
│   │   ├── argument-parser.test.ts
│   │   ├── cli.integration.test.ts
│   │   └── commands.test.ts
│   ├── api/
│   │   └── generator-api.test.ts
│   └── fixtures/
│       ├── sample-openapi.json
│       ├── sample-contract.abi.json
│       └── config-examples/
│
└── examples/
    ├── web2-github-api/                  # GitHub API SDK example
    │   ├── input-spec.openapi.json
    │   ├── sdkgen.config.json
    │   └── generated/                    # Generated SDK (example output)
    │       ├── package.json
    │       ├── src/
    │       ├── tests/
    │       └── docs/
    │
    ├── web3-uniswap-v4/                  # Uniswap V4 SDK example
    │   ├── input-spec.abi.json
    │   ├── sdkgen.config.json
    │   └── generated/
    │
    └── hybrid-example/                   # Hybrid Web2/Web3 example
        ├── input-spec-web2.json
        ├── input-spec-web3.json
        └── generated/
```

### Generated SDK Structure

```
generated-sdk/
├── package.json                          # SDK package metadata
├── tsconfig.json                         # TypeScript config
├── .eslintrc.json                        # Linting config
├── .prettierrc.json                      # Code formatting
├── jest.config.js                        # Test configuration
├── README.md                             # SDK documentation
├── QUICKSTART.md                         # Quick start guide
├── LICENSE                               # License file
├── .github/
│   └── workflows/
│       └── ci.yml                        # CI/CD configuration
│
├── src/
│   ├── index.ts                          # Main export file
│   ├── client.ts                         # SDK client class
│   ├── types.ts                          # Generated type definitions
│   ├── constants.ts                      # Constants and defaults
│   ├── errors.ts                         # Error classes
│   ├── utils.ts                          # Utility functions
│   │
│   ├── api/                              # API layer
│   │   ├── index.ts
│   │   ├── methods.ts                    # API method definitions
│   │   ├── handlers.ts                   # Request/response handlers
│   │   ├── validation.ts                 # Parameter validation
│   │   └── transformers.ts               # Data transformation
│   │
│   ├── web3/                             # Web3-specific (if applicable)
│   │   ├── index.ts
│   │   ├── contracts.ts                  # Contract interactions
│   │   ├── abi.ts                        # Contract ABIs
│   │   ├── signers.ts                    # Transaction signing
│   │   └── providers.ts                  # Blockchain providers
│   │
│   └── middleware/                       # Middleware/interceptors
│       ├── index.ts
│       ├── auth.ts                       # Authentication
│       ├── retry.ts                      # Retry logic
│       └── rate-limit.ts                 # Rate limiting
│
├── tests/
│   ├── setup.ts                          # Test setup
│   │
│   ├── unit/
│   │   ├── client.test.ts
│   │   ├── types.test.ts
│   │   ├── errors.test.ts
│   │   └── utils.test.ts
│   │
│   ├── integration/
│   │   ├── api.test.ts
│   │   ├── auth.test.ts
│   │   └── web3.test.ts                  # If Web3 SDK
│   │
│   ├── fixtures/
│   │   ├── mock-responses.ts
│   │   ├── sample-data.ts
│   │   └── mock-server.ts
│   │
│   └── e2e/
│       └── basic-flow.test.ts
│
├── docs/
│   ├── API_REFERENCE.md                  # Complete API reference
│   ├── EXAMPLES.md                       # Usage examples
│   ├── ERROR_HANDLING.md                 # Error handling guide
│   ├── AUTHENTICATION.md                 # Auth setup guide
│   ├── TROUBLESHOOTING.md                # Common issues
│   └── CONTRIBUTING.md                   # Contributing guidelines
│
└── dist/                                 # Compiled output (generated)
    ├── index.d.ts
    ├── index.js
    └── ...compiled files
```

## User Flows

### Flow 1: Basic Generation

```
User Input
  |
  v
CLI receives command
  |
  v
Parse arguments -> argument-parser.ts
  |
  v
Load config (if provided)
  |
  v
Display help or proceed
  |
  v
Validate options
  |
  +-> Invalid? -> Show error -> Exit(2)
  |
  v
Validate input specification
  |
  +-> Invalid? -> Show errors -> Exit(3)
  |
  v
Analyze input schema
  |
  v
Generate SDK code
  |
  v
Generate tests (unless --skip-tests)
  |
  v
Generate documentation (unless --skip-docs)
  |
  v
Validate generated code
  |
  v
Display success message
  |
  v
Exit(0)
```

### Flow 2: Error Handling

```
Error occurs during operation
  |
  v
Catch error
  |
  v
Determine error type
  |
  +-> Validation Error -> Show validation details -> Exit(3)
  +-> File System Error -> Show file error -> Exit(5)
  +-> Generation Error -> Show generation error -> Exit(4)
  +-> Config Error -> Show config error -> Exit(6)
  +-> Other Error -> Show generic error -> Exit(1)
  |
  v
If --verbose or --debug
  |
  +-> Show full stack trace
  |
  v
Log error details (if logging enabled)
```

### Flow 3: Interactive Mode

```
User runs: sdkgen interactive
  |
  v
Prompt for input file
  |
  v
Show supported types (web2, web3, hybrid)
  +-> User selects type
  |
  v
Show supported languages
  +-> User selects language
  |
  v
Ask for output directory
  |
  v
Ask for SDK name
  |
  v
Ask for options (tests, docs, examples)
  |
  v
Ask for authentication (if applicable)
  |
  v
Show configuration summary
  +-> Confirm? -> Proceed or edit
  |
  v
Execute generation (same as Flow 1)
```

### Flow 4: Config Management

```
User runs: sdkgen config <subcommand>
  |
  v
Load config file (sdkgen.config.json or env var)
  |
  v
Parse config
  |
  v
Route based on subcommand
  |
  +-> show -> Display current config
  +-> set <key> <value> -> Update config
  +-> get <key> -> Display single config value
  +-> list -> List all available configs
  +-> reset -> Reset to defaults
  +-> validate -> Validate config structure
```

### Flow 5: Testing Generated SDK

```
User runs: sdkgen test --path ./generated-sdk
  |
  v
Verify SDK exists
  |
  v
Discover test files
  |
  v
Load test runner (Jest, Vitest, etc.)
  |
  v
Run tests
  |
  +-> If --coverage: Generate coverage report
  +-> If --watch: Watch for changes
  |
  v
Aggregate results
  |
  v
Display summary
  +-> All passed? -> Exit(0)
  +-> Some failed? -> Display failures -> Exit(1)
```

### Flow 6: Linting Generated Code

```
User runs: sdkgen lint --path ./generated-sdk
  |
  v
Verify SDK exists
  |
  v
Load linter (ESLint, Pylint, etc.)
  |
  v
Lint all code files
  |
  v
Collect violations
  |
  v
If --fix: Apply fixes
  |
  v
Display results
  +-> No issues? -> Exit(0)
  +-> Issues found? -> Display issues -> Exit(1 if --strict)
```

## User Interaction Patterns

### Pattern 1: Simple Generation

```bash
sdkgen generate -i api.json -l typescript -t web2
```

Interaction:
1. User provides minimal required arguments
2. System uses defaults for optional parameters
3. System generates with standard options
4. Shows brief success message

### Pattern 2: Advanced Generation with Config

```bash
sdkgen generate \
  --input api.json \
  --language python \
  --type web3 \
  --config sdkgen.config.json \
  --output ./my-sdk \
  --name my-awesome-sdk \
  --verbose
```

Interaction:
1. User provides detailed configuration
2. System loads config file
3. System merges CLI args with config file
4. CLI args override config file
5. Shows detailed progress
6. Displays comprehensive result

### Pattern 3: CI/CD Pipeline

```bash
# Validate first
sdkgen validate -i api.json -t web2 --strict && \
# Then generate
sdkgen generate \
  -i api.json \
  -l typescript \
  -t web2 \
  --skip-docs \
  --json > result.json && \
# Run tests
sdkgen test --path ./sdk --coverage
```

Interaction:
1. Multiple commands in sequence
2. Each checks exit code of previous
3. Output in machine-readable format (JSON)
4. Integration with build systems

### Pattern 4: Interactive Mode

```bash
sdkgen interactive
```

Interaction:
1. User gets prompted for each option
2. Defaults are shown
3. Validation happens at each step
4. User can confirm or go back
5. No need to remember CLI syntax

### Pattern 5: Debugging

```bash
sdkgen generate \
  -i api.json \
  -l typescript \
  -t web2 \
  --verbose \
  --debug
```

Interaction:
1. Detailed progress messages at each step
2. Full stack traces on errors
3. Debug-level logging
4. Intermediate file output preserved
5. Helpful for troubleshooting

## Command Execution Examples

### Example 1: GitHub API to TypeScript SDK

```bash
sdkgen generate \
  --input github-api.openapi.json \
  --language typescript \
  --type web2 \
  --name github-sdk \
  --output ./github-sdk
```

Output:
```
Validating input...          [OK]
Analyzing schema...          [OK]
Generating code...           [50%]
Creating tests...            [75%]
Generating docs...           [90%]
OK Successfully generated SDK in ./github-sdk
  - 28 files created
  - 42 methods
  - 15 types
  - Generated in 2.5s
```

### Example 2: Blockchain Contract to Python SDK

```bash
sdkgen generate \
  --input uniswap-v4.abi.json \
  --language python \
  --type web3 \
  --name uniswap-v4-sdk \
  --output ./uniswap-sdk \
  --verbose
```

Output:
```
Validating input from uniswap-v4.abi.json...
  - Checking ABI format: valid
  - Found 58 functions
  [OK] Input is valid

Analyzing schema...
  - Processing 58 functions
  - Generating 12 type classes
  - Creating 8 error classes
  [OK] Schema analysis complete

Generating code for Python...
  - Writing uniswap_sdk/client.py (450 lines)
  - Writing uniswap_sdk/types.py (1200 lines)
  - Writing uniswap_sdk/contracts.py (800 lines)
  [50%] Code generation

Creating tests...
  - Writing test/unit/client_test.py
  - Writing test/integration/contracts_test.py
  [75%] Test generation

Generating documentation...
  - Writing README.md
  - Writing docs/API_REFERENCE.md
  - Writing docs/EXAMPLES.md
  [90%] Documentation generation

[OK] Complete! Generated 28 files in ./uniswap-sdk
```

### Example 3: Validation with Errors

```bash
sdkgen validate -i broken-api.yaml -t web2 --strict
```

Output:
```
Validating specification...

Error: INVALID_SCHEMA
  Required field 'paths' is missing from OpenAPI specification
  Location: broken-api.yaml:L1
  Suggestion: Ensure your file contains the 'paths' object with endpoint definitions
  Reference: https://spec.openapis.org/oas/v3.0.0#paths-object

FAILED
```

## Environment Configuration

Users can configure FOST via:

1. **CLI arguments** (highest priority)
   ```bash
   sdkgen generate -i api.json -l typescript -t web2
   ```

2. **Configuration file** (sdkgen.config.json)
   ```json
   {
     "defaultLanguage": "typescript",
     "defaultType": "web2",
     "generation": {
       "includeTests": true,
       "includeDocumentation": true
     }
   }
   ```

3. **Environment variables** (medium priority)
   ```bash
   export SDKGEN_CONFIG=./myconfig.json
   export SDKGEN_OUTPUT=./generated
   export SDKGEN_LANGUAGE=typescript
   ```

4. **Defaults** (lowest priority)
   - Language: typescript
   - Type: web2
   - Output: ./sdk

Priority order: CLI args > Config file > Env vars > Defaults

## Exit Codes

| Code | Scenario |
|------|----------|
| 0 | Successful execution |
| 1 | General error (validation error, unexpected error) |
| 2 | Invalid command-line arguments |
| 3 | Input specification validation failed |
| 4 | Code generation failed |
| 5 | File system error (permissions, not found, etc.) |
| 6 | Configuration error |

## Next Steps for Implementation

1. Integrate CLI with code generation pipeline
2. Implement all command handlers
3. Add shell completion support
4. Create man pages for documentation
5. Set up npm package distribution
6. Add GitHub Actions CI/CD
7. Create interactive REPL mode
8. Add plugin system for custom generators
