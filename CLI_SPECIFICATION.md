# SDK Generator CLI Specification

## Overview

Command-line interface for FOST SDK code generation. Supports Web2 (REST/GraphQL) and Web3 (Blockchain) SDK generation with comprehensive progress reporting and error handling.

## Installation

```bash
npm install -g @fost/sdkgen
# or
npm install @fost/sdkgen
```

## Quick Start

```bash
sdkgen generate --input openapi.yaml --lang typescript --type web2 --output ./generated
```

## Commands

### 1. Generate Command

Generates SDK code from input specification.

```bash
sdkgen generate [OPTIONS]
```

#### Options

| Option | Short | Type | Required | Default | Description |
|--------|-------|------|----------|---------|-------------|
| `--input` | `-i` | string | Yes | - | Input specification file (OpenAPI, GraphQL schema, ABI) |
| `--language` | `-l` | string | Yes | - | Target language: typescript, python, go, rust, kotlin, swift |
| `--type` | `-t` | string | Yes | - | SDK type: web2, web3, hybrid |
| `--output` | `-o` | string | No | ./sdk | Output directory |
| `--config` | `-c` | string | No | - | Configuration file path (.json or .yaml) |
| `--name` | `-n` | string | No | auto | SDK package name |
| `--version` | `-v` | string | No | 1.0.0 | SDK version |
| `--validate-only` | - | boolean | No | false | Validate input without generating |
| `--skip-tests` | - | boolean | No | false | Skip test generation |
| `--skip-docs` | - | boolean | No | false | Skip documentation generation |
| `--verbose` | - | boolean | No | false | Verbose output |
| `--quiet` | `-q` | boolean | No | false | Minimal output |
| `--color` | - | boolean | No | true | Colorized output |
| `--help` | `-h` | boolean | No | false | Show help |

#### Examples

**Basic Web2 SDK**
```bash
sdkgen generate -i api.openapi.json -l typescript -t web2
```

**Web3 SDK with output directory**
```bash
sdkgen generate -i contract.abi.json -l typescript -t web3 -o ./uniswap-sdk
```

**With configuration file**
```bash
sdkgen generate -i openapi.yaml -l python -t web2 -c sdkgen.config.json
```

**Validation only**
```bash
sdkgen generate -i openapi.yaml -l typescript -t web2 --validate-only
```

**Verbose output**
```bash
sdkgen generate -i api.json -l typescript -t web2 --verbose
```

### 2. Validate Command

Validates input specification without generating code.

```bash
sdkgen validate [OPTIONS]
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `--input` | string | Input specification file |
| `--type` | string | SDK type: web2, web3 |
| `--strict` | boolean | Strict validation (default: false) |
| `--rules` | string | Custom validation rules file |

#### Example

```bash
sdkgen validate -i openapi.yaml -t web2 --strict
```

### 3. Test Command

Runs generated SDK tests.

```bash
sdkgen test [OPTIONS]
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `--path` | string | SDK directory path (default: ./sdk) |
| `--type` | string | Test type: unit, integration, all (default: all) |
| `--coverage` | boolean | Generate coverage report |
| `--watch` | boolean | Watch for changes |

#### Example

```bash
sdkgen test --path ./generated-sdk --type integration --coverage
```

### 4. Lint Command

Lints generated SDK code.

```bash
sdkgen lint [OPTIONS]
```

#### Options

| Option | Type | Description |
|--------|------|-------------|
| `--path` | string | SDK directory path (default: ./sdk) |
| `--fix` | boolean | Auto-fix linting issues |
| `--strict` | boolean | Strict mode |

#### Example

```bash
sdkgen lint --path ./generated-sdk --fix
```

### 5. Config Command

Manages configuration.

```bash
sdkgen config [SUBCOMMAND] [OPTIONS]
```

#### Subcommands

**Show current config**
```bash
sdkgen config show
```

**Set configuration value**
```bash
sdkgen config set <key> <value>
```

**Reset to defaults**
```bash
sdkgen config reset
```

**List all configurations**
```bash
sdkgen config list
```

#### Example

```bash
sdkgen config set defaultLanguage python
sdkgen config show
```

### 6. Version Command

Shows version information.

```bash
sdkgen version
# or
sdkgen -v
```

### 7. Help Command

Shows help information.

```bash
sdkgen help [COMMAND]
# or
sdkgen -h
# or
sdkgen --help
```

#### Examples

```bash
sdkgen help
sdkgen help generate
sdkgen generate --help
```

## Configuration File

Configuration can be specified via `sdkgen.config.json` or `sdkgen.config.yaml`.

### JSON Example

```json
{
  "defaultLanguage": "typescript",
  "defaultType": "web2",
  "defaultOutput": "./sdk",
  "generation": {
    "includeTests": true,
    "includeDocumentation": true,
    "includeExamples": true,
    "skipLinting": false
  },
  "validation": {
    "strict": false,
    "customRules": []
  },
  "output": {
    "format": "typescript",
    "minify": false,
    "sourceMaps": true
  },
  "logging": {
    "level": "info",
    "format": "text",
    "colorize": true
  }
}
```

### YAML Example

```yaml
defaultLanguage: typescript
defaultType: web2
defaultOutput: ./sdk

generation:
  includeTests: true
  includeDocumentation: true
  includeExamples: true
  skipLinting: false

validation:
  strict: false
  customRules: []

output:
  format: typescript
  minify: false
  sourceMaps: true

logging:
  level: info
  format: text
  colorize: true
```

## Output Structure

Generated SDK folder structure:

```
generated-sdk/
├── package.json
├── tsconfig.json
├── README.md
├── QUICKSTART.md
├── LICENSE
├── src/
│   ├── index.ts
│   ├── client.ts
│   ├── types.ts
│   ├── constants.ts
│   ├── errors.ts
│   ├── utils.ts
│   ├── api/
│   │   ├── index.ts
│   │   ├── methods.ts
│   │   └── handlers.ts
│   └── web3/ (if web3)
│       ├── index.ts
│       ├── contracts.ts
│       └── abi.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── docs/
│   ├── API_REFERENCE.md
│   ├── EXAMPLES.md
│   ├── ERROR_HANDLING.md
│   └── AUTHENTICATION.md
└── .eslintrc.json
```

## Progress Reporting

### Verbosity Levels

**Quiet Mode** (`--quiet`)
```
Generating SDK...
Complete!
```

**Normal Mode** (default)
```
Validating input...  [OK]
Analyzing schema...  [OK]
Generating code...   [50%]
Creating tests...    [75%]
Generating docs...   [90%]
Complete! Generated in /path/to/sdk
```

**Verbose Mode** (`--verbose`)
```
Validating input from api.openapi.json...
  - Checking schema version: 3.0.0
  - Validating endpoints: 42 found
  - Checking security schemes: 2 found
  [OK] Input is valid

Analyzing schema for TypeScript generation...
  - Processing 42 endpoints
  - Generating 15 types
  - Creating 8 error classes
  [OK] Schema analysis complete

Generating code...
  - Writing src/client.ts (450 lines)
  - Writing src/types.ts (1200 lines)
  - Writing src/api/methods.ts (800 lines)
  [50%] Code generation

Creating tests...
  - Writing test/unit/client.test.ts
  - Writing test/integration/api.test.ts
  [75%] Test generation

Generating documentation...
  - Writing README.md
  - Writing docs/API_REFERENCE.md
  - Writing docs/EXAMPLES.md
  [90%] Documentation generation

[OK] Complete! Generated 28 files in /path/to/sdk
```

## Error Handling

### Error Format

```
Error: [CODE] Message
Details: Additional context
Suggestion: How to fix
Location: File:Line
```

### Example Errors

**Invalid Input**
```
Error: INVALID_INPUT
  OpenAPI schema is missing required field: 'paths'
  Details: File: api.openapi.json, Line: 1
  Suggestion: Add 'paths' object to your OpenAPI schema
  Reference: https://spec.openapis.org/oas/v3.0.0
```

**Unsupported Type**
```
Error: UNSUPPORTED_TYPE
  Language 'dart' is not supported
  Supported languages: typescript, python, go, rust, kotlin, swift
  Suggestion: Use one of the supported languages
```

**Generation Failed**
```
Error: GENERATION_FAILED
  Failed to generate code for method: getUserById
  Details: Unknown return type: 'User | null'
  Suggestion: Ensure all types are properly defined in your schema
  Location: api.openapi.json:L245
```

**File Write Error**
```
Error: FILE_WRITE_FAILED
  Cannot write to output directory: /path/to/sdk
  Details: Permission denied
  Suggestion: Check directory permissions or use a different output path
```

### Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Input validation failed |
| 4 | Generation failed |
| 5 | File system error |
| 6 | Configuration error |

## Global Flags

Available on all commands:

| Flag | Description |
|------|-------------|
| `--help` | Show help |
| `--verbose` | Verbose output |
| `--quiet` | Minimal output |
| `--no-color` | Disable colored output |
| `--json` | Output as JSON |
| `--debug` | Debug mode with stack traces |

## Interactive Mode

```bash
sdkgen interactive
# or
sdkgen i
```

Interactive guided generation with prompts.

## Piping and Scripting

### Output JSON

```bash
sdkgen generate --input api.json -l typescript -t web2 --json
```

Returns:
```json
{
  "success": true,
  "outputPath": "/path/to/sdk",
  "filesGenerated": 28,
  "duration": "2.5s",
  "metadata": {
    "language": "typescript",
    "type": "web2",
    "methods": 42,
    "types": 15
  }
}
```

### Piping

```bash
cat api.openapi.json | sdkgen generate -l typescript -t web2 > sdk.tar.gz
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SDKGEN_CONFIG` | Configuration file path |
| `SDKGEN_OUTPUT` | Default output directory |
| `SDKGEN_LANGUAGE` | Default language |
| `SDKGEN_VERBOSE` | Enable verbose output |
| `SDKGEN_COLOR` | Enable colored output |
| `SDKGEN_TEMP_DIR` | Temporary directory |

#### Example

```bash
export SDKGEN_CONFIG=./myconfig.json
export SDKGEN_OUTPUT=./generated
sdkgen generate -i api.json -l typescript -t web2
```

## Shell Completion

### Bash

```bash
sdkgen completion bash > /etc/bash_completion.d/sdkgen
```

### Zsh

```bash
sdkgen completion zsh > /usr/share/zsh/site-functions/_sdkgen
```

### Fish

```bash
sdkgen completion fish > ~/.config/fish/completions/sdkgen.fish
```

## Examples

### Example 1: Generate GitHub API SDK

```bash
sdkgen generate \
  --input github-api.openapi.json \
  --language typescript \
  --type web2 \
  --name github-sdk \
  --output ./github-sdk
```

### Example 2: Generate Uniswap V4 SDK

```bash
sdkgen generate \
  --input uniswap-v4.abi.json \
  --language typescript \
  --type web3 \
  --name uniswap-v4-sdk \
  --output ./uniswap-sdk \
  --config uniswap.config.json
```

### Example 3: Validate and Generate with Tests

```bash
sdkgen validate --input api.yaml --type web2 --strict && \
sdkgen generate \
  --input api.yaml \
  --language python \
  --type web2 \
  --verbose
```

### Example 4: Generate Multiple SDKs

```bash
for file in apis/*.openapi.json; do
  name=$(basename $file .openapi.json)
  sdkgen generate \
    --input "$file" \
    --language typescript \
    --type web2 \
    --name "$name-sdk" \
    --output "./generated/$name"
done
```

## Best Practices

1. **Use Configuration Files**: Store common settings in `sdkgen.config.json`
2. **Validate First**: Always validate input before generation
3. **Start Simple**: Generate without tests/docs first, then enable
4. **Version Control**: Commit generated SDK code (or exclude with .gitignore)
5. **Use Verbose Mode**: Troubleshoot with `--verbose` flag
6. **Monitor Output**: Check generated code quality before deployment
7. **Document Custom Rules**: If using custom validation rules, document them
8. **Use Environment Variables**: For CI/CD pipelines, use env vars
9. **Check Exit Codes**: In scripts, always check exit codes
10. **Keep Specs Updated**: Regenerate when API specifications change

## Troubleshooting

### Command Not Found

```bash
# Check installation
npm list -g @fost/sdkgen

# Reinstall if needed
npm install -g @fost/sdkgen

# Check PATH
echo $PATH | grep node_modules
```

### Permission Denied

```bash
# Use sudo
sudo sdkgen generate -i api.json -l typescript -t web2

# Or change output directory
sdkgen generate -i api.json -l typescript -t web2 -o ~/sdks
```

### Out of Memory

```bash
# Increase Node.js memory
NODE_OPTIONS=--max-old-space-size=4096 sdkgen generate -i large-api.json -l typescript -t web2
```

### Generation Timeout

```bash
# Increase timeout in config or use debug mode
sdkgen generate -i api.json -l typescript -t web2 --debug --verbose
```

## Support

- Documentation: https://docs.fost.dev/cli
- Issues: https://github.com/foi/fost/issues
- Discussions: https://github.com/foi/fost/discussions
- Email: support@fost.dev
