'use client'

export default function RoutingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Routing Strategies
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Intelligently route your AI requests to optimize for cost, speed, or reliability
      </p>

      {/* Cost-Based Routing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          💰 Cost-Based Routing
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Route to the cheapest provider that supports your requested model. Perfect for batch processing and non-time-sensitive tasks.
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100"><code>{`{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "routingStrategy": "cost"
}`}</code></pre>
          </div>
        </div>
      </section>

      {/* Latency-Based Routing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ⚡ Latency-Based Routing
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Route to the fastest provider based on historical response times. Ideal for real-time chat and interactive applications.
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100"><code>{`{
  "model": "gpt-4",
  "messages": [...],
  "routingStrategy": "latency"
}`}</code></pre>
          </div>
        </div>
      </section>

      {/* Priority Routing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🎯 Priority Routing
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Use your preferred provider with automatic fallback. Great for compliance requirements or provider-specific features.
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100"><code>{`{
  "model": "claude-3-opus",
  "messages": [...],
  "routingStrategy": "priority",
  "preferredProvider": "anthropic"
}`}</code></pre>
          </div>
        </div>
      </section>

      {/* Fallback Routing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🛡️ Fallback Routing
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Maximum reliability by automatically trying multiple providers. Essential for mission-critical systems.
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100"><code>{`{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "routingStrategy": "fallback"
}`}</code></pre>
          </div>
        </div>
      </section>

      {/* Response Caching */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ⚡ Response Caching
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            All routing strategies benefit from intelligent caching. Identical requests return instantly at $0 cost!
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">Benefits:</h3>
            <ul className="list-disc list-inside text-green-800 dark:text-green-200 space-y-1">
              <li>0ms latency for cached responses</li>
              <li>$0 cost for cached responses</li>
              <li>Enabled by default</li>
              <li>Automatic cache key generation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Strategy Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Strategy</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Best For</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Pros</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-900 dark:text-white font-medium">Cost</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Batch processing</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Lowest cost</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-900 dark:text-white font-medium">Latency</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Real-time chat</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Fastest response</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-900 dark:text-white font-medium">Priority</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Compliance needs</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Control + fallback</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-900 dark:text-white font-medium">Fallback</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Critical systems</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Maximum reliability</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

