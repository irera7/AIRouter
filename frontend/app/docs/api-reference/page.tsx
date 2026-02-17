'use client'

export default function APIReferencePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        API Reference
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Complete documentation for all AIRouter endpoints
      </p>

      {/* Base URL */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
        <p className="text-blue-900 dark:text-blue-100">
          <strong>Base URL:</strong> <code className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">http://localhost:3000</code>
        </p>
      </div>

      {/* Chat Completions */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Chat Completions
        </h2>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded font-mono text-sm font-semibold">
                POST
              </span>
              <code className="text-gray-900 dark:text-white">/api/v1/chat/completions</code>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create a chat completion with intelligent routing
            </p>
            
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Request Body:</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
              <pre className="text-sm text-gray-100"><code>{`{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "Hello, world!"
    }
  ],
  "temperature": 0.7,
  "routingStrategy": "cost",
  "enableCache": true
}`}</code></pre>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Response:</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100"><code>{`{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-3.5-turbo",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Hello! How can I help you today?"
    },
    "finishReason": "stop"
  }],
  "usage": {
    "promptTokens": 10,
    "completionTokens": 9,
    "totalTokens": 19
  },
  "provider": "openai",
  "cost": 28,
  "cached": false
}`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Authentication
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            All API requests require an API key in the Authorization header:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100"><code>Authorization: Bearer sk-air-your-api-key</code></pre>
          </div>
        </div>
      </section>

      {/* Parameters */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Key Parameters
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Parameter</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Type</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">model</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">string</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Model name (e.g., "gpt-3.5-turbo")</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">messages</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">array</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Array of message objects</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">routingStrategy</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">string</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">cost, latency, priority, fallback</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">enableCache</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">boolean</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Enable response caching (default: true)</td>
              </tr>
              <tr>
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">temperature</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">number</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">0-2, controls randomness</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Error Codes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Error Codes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Code</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">200</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Success</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">400</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Bad Request - Invalid parameters</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">401</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Unauthorized - Invalid API key</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">402</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Payment Required - Insufficient credits</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">429</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Rate Limited - Too many requests</td>
              </tr>
              <tr>
                <td className="p-4 font-mono text-sm text-gray-900 dark:text-white">503</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Service Unavailable - No providers available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Interactive API */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
          Try the Interactive API
        </h3>
        <p className="text-indigo-800 dark:text-indigo-200 mb-4">
          Want to test the API directly in your browser? Check out our Swagger UI with live examples.
        </p>
        <a
          href={(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/docs'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Open Interactive API Docs →
        </a>
      </div>
    </div>
  )
}

