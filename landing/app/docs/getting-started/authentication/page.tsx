'use client';

export default function AuthenticationPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold font-mono mb-4">Authentication</h1>
      <p className="text-lg text-gray-600 mb-8">
        Authenticate with FOST to access the platform and protect your API keys
      </p>

      <div className="space-y-8">
        {/* Overview */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-700 mb-4">
            FOST uses JWT (JSON Web Token) authentication for API access and session-based authentication for the web dashboard.
          </p>
        </section>

        {/* API Key Authentication */}
        <section>
          <h2 className="text-2xl font-bold mb-4">API Key Authentication</h2>
          <p className="text-gray-700 mb-4">Generate API keys for programmatic access:</p>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-4">
            <pre className="text-xs">{`# Install FOST CLI
npm install -g @fost/cli

# Login to your account
fost auth login

# Generate API key
fost auth generate-key

# Use in environment
export FOST_API_KEY=sk_live_xxxxx

# Call API
fost generate --spec api.json --languages typescript`}</pre>
          </div>
        </section>

        {/* Dashboard Login */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Dashboard Login</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
            <li>Go to <a href="/platform/auth/login" className="text-accent-green hover:underline">FOST Dashboard</a></li>
            <li>Enter your email and password</li>
            <li>You're logged in! Sessions are valid for 30 days</li>
          </ol>
        </section>

        {/* API Usage */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Using API Keys</h2>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4">
            <pre className="text-xs">{`# Include API key in headers
curl -H "Authorization: Bearer sk_live_xxxxx" \\
  https://api.fost.dev/v1/sdks/generate`}</pre>
          </div>
        </section>
      </div>
    </div>
  );
}
