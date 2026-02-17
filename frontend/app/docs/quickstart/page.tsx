'use client'

import { Code2, Terminal, CheckCircle, ArrowRight } from 'lucide-react'

export default function QuickstartPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Quickstart Guide
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Get up and running with AIRouter in 5 minutes
        </p>
      </div>

      {/* Step 1 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full font-bold">
            1
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Register an Account</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Create your AIRouter account using the API or dashboard:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-100"><code>{`curl -X POST http://localhost:3000/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "you@example.com",
    "password": "your-secure-password",
    "name": "Your Name",
    "orgName": "Your Organization"
  }'`}</code></pre>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full font-bold">
            2
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create an API Key</h2>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Go to the <a href="/dashboard/api-keys" className="text-indigo-600 hover:underline">API Keys page</a> in your dashboard and create a new key, or use the API:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
            <pre className="text-sm text-gray-100"><code>{`curl -X POST http://localhost:3000/api/v1/auth/keys \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "name": "My First API Key",
    "permissions": ["read", "write"]
  }'`}</code></pre>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Important:</strong> Save your API key - it won't be shown again!
            </p>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white rounded-full font-bold">
            3
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Make Your First Request</h2>
        </div>
        
        <div className="space-y-6">
          {/* cURL Example */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Using cURL
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100"><code>{`curl -X POST http://localhost:3000/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer sk-air-your-api-key" \\
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ],
    "routingStrategy": "cost"
  }'`}</code></pre>
            </div>
          </div>

          {/* JavaScript Example */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Using JavaScript/TypeScript
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100"><code>{`const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-air-your-api-key',
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'Hello, world!' }
    ],
    routingStrategy: 'cost',
    enableCache: true
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);`}</code></pre>
            </div>
          </div>

          {/* OpenAI SDK Example */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Using OpenAI SDK
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100"><code>{`import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:3000/api/v1',
  apiKey: 'sk-air-your-api-key',
});

const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'user', content: 'Hello, world!' }
  ],
});

console.log(completion.choices[0].message.content);`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Next Steps</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <a href="/docs/routing" className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              Routing Strategies
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Learn about cost, latency, and fallback routing
            </p>
          </a>

          <a href="/docs/api-reference" className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              API Reference
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete API documentation
            </p>
          </a>

          <a href="/docs/best-practices" className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              Best Practices
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Optimization tips and patterns
            </p>
          </a>

          <a href="/dashboard/analytics" className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              View Analytics
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor your usage and costs
            </p>
          </a>
        </div>
      </section>

      {/* Success Indicator */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
              You're All Set! 🎉
            </h3>
            <p className="text-green-800 dark:text-green-200">
              You're now ready to build amazing AI-powered applications with AIRouter. Start making requests and let us handle the complexity!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

