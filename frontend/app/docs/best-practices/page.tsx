'use client'

export default function BestPracticesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Best Practices
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Optimize your AIRouter integration for performance, cost, and reliability
      </p>

      {/* Cost Optimization */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          💰 Cost Optimization
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              1. Enable Response Caching
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Cached responses cost $0 and return instantly. Enable for all repeated queries.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100"><code>{`{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "enableCache": true  // Default: true
}`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              2. Use Cheaper Models When Possible
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="border border-red-200 dark:border-red-800 rounded p-3 bg-red-50 dark:bg-red-900/20">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">❌ Bad</p>
                <code className="text-xs text-red-800 dark:text-red-200">model: "gpt-4" // $30/1M tokens</code>
              </div>
              <div className="border border-green-200 dark:border-green-800 rounded p-3 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">✅ Good</p>
                <code className="text-xs text-green-800 dark:text-green-200">model: "gpt-3.5-turbo" // $0.50/1M tokens</code>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              3. Use Cost-Based Routing
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Let AIRouter automatically select the cheapest provider
            </p>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100"><code>{`{
  "routingStrategy": "cost"
}`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* Performance Optimization */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ⚡ Performance Optimization
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              1. Use Latency-Based Routing
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              For real-time applications, route to the fastest provider
            </p>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100"><code>{`{
  "routingStrategy": "latency"
}`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              2. Monitor Rate Limits
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Check response headers to avoid hitting rate limits
            </p>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100"><code>{`const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');

if (remaining < 10) {
  console.warn(\`Only \${remaining} requests remaining\`);
}`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🔐 Security Best Practices
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              1. Secure API Key Storage
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="border border-red-200 dark:border-red-800 rounded p-3 bg-red-50 dark:bg-red-900/20">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">❌ Bad</p>
                <code className="text-xs text-red-800 dark:text-red-200 block">const key = "sk-air-1234..."</code>
              </div>
              <div className="border border-green-200 dark:border-green-800 rounded p-3 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">✅ Good</p>
                <code className="text-xs text-green-800 dark:text-green-200 block">const key = process.env.API_KEY</code>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              2. Use Appropriate Permissions
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Create separate keys with minimal required permissions
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Read-only keys for analytics dashboards</li>
              <li>Full access keys for production apps</li>
              <li>Set expiration dates for temporary keys</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              3. Rotate Keys Regularly
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Implement key rotation every 90 days for production environments
            </p>
          </div>
        </div>
      </section>

      {/* Reliability Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🛡️ Reliability Best Practices
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              1. Use Fallback Routing for Critical Operations
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100"><code>{`{
  "routingStrategy": "fallback"  // Automatic failover
}`}</code></pre>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              2. Implement Error Handling
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100"><code>{`try {
  const response = await chat({...});
} catch (error) {
  if (error.status === 429) {
    // Rate limited - wait and retry
  } else if (error.status === 402) {
    // Insufficient credits
  } else if (error.status === 503) {
    // Service unavailable
  }
}`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Checklist */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-4">
          ✅ Quick Checklist
        </h3>
        <ul className="space-y-2 text-indigo-800 dark:text-indigo-200">
          <li>✓ Enable response caching</li>
          <li>✓ Use appropriate routing strategy</li>
          <li>✓ Store API keys securely</li>
          <li>✓ Monitor rate limits</li>
          <li>✓ Implement error handling</li>
          <li>✓ Track costs in analytics</li>
          <li>✓ Set up fallback routing for critical systems</li>
          <li>✓ Rotate API keys regularly</li>
        </ul>
      </div>
    </div>
  )
}

