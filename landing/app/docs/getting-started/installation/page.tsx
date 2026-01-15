'use client';

import Link from 'next/link';

export default function InstallationPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="text-sm font-mono text-gray-600 mb-4">
          <Link href="/docs" className="text-accent-green hover:underline">Docs</Link>
          {' / '}
          <Link href="/docs/getting-started/overview" className="text-accent-green hover:underline">Getting Started</Link>
          {' / Installation'}
        </div>
        <h1 className="text-4xl font-bold font-mono mb-4">Installation</h1>
        <p className="text-lg text-gray-600">
          Set up FOST CLI and SDK generation tools
        </p>
      </div>

      <div className="prose prose-sm max-w-none font-mono space-y-8">
        {/* CLI Installation */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">CLI Installation</h2>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Using npm (Recommended)</h3>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">npm install -g @fost/cli</pre>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Using yarn</h3>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">yarn global add @fost/cli</pre>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3">Verify Installation</h3>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`$ fost --version
FOST CLI v1.0.0`}</pre>
          </div>
        </section>

        {/* Web Installation */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Web Dashboard</h2>
          <p className="text-gray-700 mb-4">
            No installation needed! Use the web-based dashboard for a visual SDK generation experience.
          </p>
          <div className="rounded-lg bg-green-50 border border-accent-green p-4 mb-4">
            <p className="text-sm text-gray-900 mb-3">
              <strong>1. Create Account</strong>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Visit <Link href="/platform/auth/signup" className="text-accent-green hover:underline">FOST Dashboard</Link> and create a free account.
            </p>
            <p className="text-sm text-gray-900 mb-3">
              <strong>2. Generate SDKs</strong>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Upload your API spec or contract ABI using the visual interface.
            </p>
            <p className="text-sm text-gray-900 mb-3">
              <strong>3. Download</strong>
            </p>
            <p className="text-sm text-gray-600">
              Download generated SDKs in your preferred language and framework.
            </p>
          </div>
        </section>

        {/* Requirements */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">System Requirements</h2>
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-gray-900 mb-2">Node.js</p>
              <p className="text-sm text-gray-600">v16.0 or higher (for CLI)</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-gray-900 mb-2">npm / yarn</p>
              <p className="text-sm text-gray-600">Latest stable version</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-gray-900 mb-2">Modern Browser</p>
              <p className="text-sm text-gray-600">Chrome, Firefox, Safari, or Edge (for web dashboard)</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="font-bold text-gray-900 mb-2">Disk Space</p>
              <p className="text-sm text-gray-600">~500MB for FOST and dependencies</p>
            </div>
          </div>
        </section>

        {/* First Command */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your First Command</h2>
          <p className="text-gray-700 mb-4">
            After installation, try the help command:
          </p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`$ fost --help

FOST CLI - Web3 SDK Generation

Usage:
  fost [command] [options]

Commands:
  generate    Generate SDK from spec or ABI
  validate    Validate input specifications
  config      Manage FOST configuration
  auth        Authenticate with FOST account
  version     Show version information

Global Options:
  -h, --help     Show help text
  -v, --verbose  Enable verbose logging
  --version      Show version number`}</pre>
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting</h2>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Command not found: fost</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-3">
              Try updating npm and reinstalling:
            </p>
            <div className="bg-gray-900 text-gray-100 rounded p-3 text-xs mb-3">
              <pre>{`npm install -g npm
npm install -g @fost/cli`}</pre>
            </div>
            <p className="text-sm text-gray-600">
              On macOS/Linux, you may need to use `sudo`
            </p>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Permission Denied</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-3">
              On macOS/Linux:
            </p>
            <div className="bg-gray-900 text-gray-100 rounded p-3 text-xs">
              <pre>sudo npm install -g @fost/cli</pre>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Version Mismatch</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-3">
              Ensure you have Node.js v16+:
            </p>
            <div className="bg-gray-900 text-gray-100 rounded p-3 text-xs mb-3">
              <pre>node --version  # Should be v16.0.0 or higher</pre>
            </div>
            <p className="text-sm text-gray-600">
              Update Node.js from <a href="https://nodejs.org" className="text-accent-green hover:underline">nodejs.org</a>
            </p>
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
          <p className="text-gray-700 mb-4">
            Now that FOST is installed, let's generate your first SDK:
          </p>
          <Link 
            href="/docs/getting-started/first-sdk"
            className="inline-block rounded bg-accent-green px-6 py-2 font-bold text-white hover:bg-accent-green-dark"
          >
            Generate Your First SDK →
          </Link>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/docs" className="text-accent-green hover:underline">→ Browse documentation</Link>
            </li>
            <li>
              <Link href="/docs/resources/troubleshooting" className="text-accent-green hover:underline">→ Troubleshooting guide</Link>
            </li>
            <li>
              <a href="https://github.com/emmyhack/fost" target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline">→ GitHub issues</a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
