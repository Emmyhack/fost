'use client';

export default function CLIReferencePage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">FOST CLI Reference</h1>
      <p className="text-lg text-gray-600 mb-8">
        Complete command reference for the FOST command-line interface
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">Installation</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`# Install globally
npm install -g @fost/cli

# Verify installation
fost --version`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">generate command</h2>
          <p className="text-gray-700 mb-4">Generate an SDK from a smart contract ABI or OpenAPI schema.</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`fost generate [options]

Options:
  --input, -i      Path to ABI or schema file (required)
  --output, -o     Output directory (default: ./sdk)
  --language, -l   Programming language (ts, py, go, java, cs, rs)
  --name, -n       SDK name (default: MySDK)
  --chain          Blockchain network (ethereum, polygon, arbitrum, etc.)
  --contract       Smart contract address (for Web3 SDKs)
  --verbose, -v    Detailed output
  --dry-run        Preview generation without writing files

Examples:
  # Generate TypeScript SDK from ABI
  fost generate -i contract.json -l ts -o ./sdk

  # Generate Python SDK for Polygon
  fost generate -i uniswap.json -l py --chain polygon

  # Generate and preview
  fost generate -i api.yaml -l go --dry-run`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">init command</h2>
          <p className="text-gray-700 mb-4">Initialize a new FOST project with configuration.</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`fost init [directory]

Options:
  --name, -n       Project name
  --template       Template type (web3, rest-api, hybrid)
  --interactive    Interactive setup wizard (default)
  --skip-git       Don't initialize Git repository

Examples:
  # Interactive setup
  fost init my-project

  # With template
  fost init my-app --template web3

  # Non-interactive
  fost init --name my-sdk --template rest-api --skip-git`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">validate command</h2>
          <p className="text-gray-700 mb-4">Validate ABI or schema files for correctness.</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`fost validate [file] [options]

Options:
  --type           Schema type (abi, openapi, swagger)
  --strict         Enable strict validation
  --json           Output JSON format

Examples:
  # Validate ABI
  fost validate contract.json

  # Validate OpenAPI with strict mode
  fost validate api.yaml --type openapi --strict

  # JSON output
  fost validate schema.json --json`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">test command</h2>
          <p className="text-gray-700 mb-4">Test generated SDK functionality.</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`fost test [SDK] [options]

Options:
  --rpc            RPC endpoint URL
  --contract       Contract address to test against
  --chain          Network to test on
  --timeout        Test timeout in seconds (default: 60)

Examples:
  # Test generated SDK against contract
  fost test ./sdk --rpc https://eth.llamarpc.com \\
    --contract 0x123... --chain ethereum

  # Test with timeout
  fost test ./sdk --timeout 120`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">types command</h2>
          <p className="text-gray-700 mb-4">Extract and display type information from SDK.</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`fost types [SDK] [options]

Options:
  --format         Output format (json, ts, go, py)
  --filter         Filter types by pattern
  --export         Export types to file

Examples:
  # Display all types in JSON
  fost types ./sdk --format json

  # Export TypeScript types
  fost types ./sdk --format ts --export types.ts

  # Filter by pattern
  fost types ./sdk --filter "*Event"`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">version command</h2>
          <p className="text-gray-700 mb-4">Display FOST CLI version information.</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`fost --version        # Short form
fost -v

fost version          # Long form
fost version --json   # JSON output`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">config command</h2>
          <p className="text-gray-700 mb-4">Manage FOST configuration.</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`fost config get [key]              # Get config value
fost config set [key] [value]      # Set config value
fost config list                   # List all settings
fost config reset                  # Reset to defaults

Examples:
  # Get default output directory
  fost config get output.directory

  # Set default language
  fost config set default.language typescript

  # List all configuration
  fost config list

  # Reset everything
  fost config reset`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Global Options</h2>
          <div className="space-y-3 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">--help, -h</p>
              <p className="text-sm text-gray-600">Display help for command</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">--verbose, -v</p>
              <p className="text-sm text-gray-600">Enable verbose logging</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">--json</p>
              <p className="text-sm text-gray-600">Output in JSON format</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">--quiet</p>
              <p className="text-sm text-gray-600">Suppress output except errors</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">--config</p>
              <p className="text-sm text-gray-600">Path to configuration file</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Common Workflows</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`# Workflow 1: New project from scratch
fost init my-project
cd my-project
foram generate -i contract.json -l ts

# Workflow 2: Validate before generating
fost validate contract.json --strict
fost generate -i contract.json -l py

# Workflow 3: Generate and test
fost generate -i api.yaml -l go -o ./sdk
fost test ./sdk --timeout 120

# Workflow 4: Multiple language targets
fost generate -i contract.json -l ts -o ./sdk-ts
fost generate -i contract.json -l py -o ./sdk-py
fost generate -i contract.json -l go -o ./sdk-go`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Troubleshooting</h2>
          <div className="space-y-4 mb-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Command not found</p>
              <p className="text-sm text-gray-600 mb-2">Install FOST globally or use npx:</p>
              <p className="text-xs font-mono text-gray-600">npx @fost/cli generate -i contract.json -l ts</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Invalid ABI</p>
              <p className="text-sm text-gray-600 mb-2">Validate with strict mode to see detailed errors:</p>
              <p className="text-xs font-mono text-gray-600">fost validate contract.json --strict</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold mb-2">Permission denied</p>
              <p className="text-sm text-gray-600 mb-2">Check directory permissions or use sudo:</p>
              <p className="text-xs font-mono text-gray-600">sudo npm install -g @fost/cli</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Learn More</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><a href="/docs/getting-started/installation" className="text-accent-green hover:underline">Installation Guide</a></li>
            <li><a href="/docs/getting-started/first-sdk" className="text-accent-green hover:underline">First SDK Guide</a></li>
            <li><a href="https://github.com/emmyhack/fost" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">GitHub Repository</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
