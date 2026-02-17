'use client'

export default function ArchitecturePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Architecture
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
        Understanding AIRouter's system design and components
      </p>

      {/* Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          System Overview
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            AIRouter is built as a high-performance API gateway that provides unified access to multiple LLM providers with intelligent routing and caching.
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 font-mono text-xs">
            <pre>{`┌─────────────────────────────────────────┐
│           Client Application            │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│           AIRouter Gateway              │
│  ┌────────────────────────────────────┐ │
│  │  Authentication & Rate Limiting    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Request Caching                   │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Routing Engine                    │ │
│  │  • Cost-based                      │ │
│  │  • Latency-based                   │ │
│  │  • Priority                        │ │
│  │  • Fallback                        │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Analytics & Billing               │ │
│  └────────────────────────────────────┘ │
└───────────────┬─────────────────────────┘
                │
        ┌───────┼───────┐
        ▼       ▼       ▼
    ┌─────┐ ┌─────┐ ┌─────┐
    │OpenAI│ │Claude│ │Other│
    └─────┘ └─────┘ └─────┘`}</pre>
          </div>
        </div>
      </section>

      {/* Core Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Core Components
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              1. API Gateway (Fastify)
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Request validation and routing</li>
              <li>Authentication (JWT + API Keys)</li>
              <li>Rate limiting</li>
              <li>CORS handling</li>
              <li>Error handling</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              2. Routing Engine
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Cost-Based:</strong> Route to cheapest provider</li>
              <li><strong>Latency-Based:</strong> Route to fastest provider</li>
              <li><strong>Priority:</strong> Preferred provider with fallback</li>
              <li><strong>Fallback:</strong> Automatic retry chain</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              3. Provider Connectors
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Unified interface for different LLM providers:
            </p>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>OpenAI (GPT-3.5, GPT-4)</li>
              <li>Anthropic (Claude 3)</li>
              <li>Mistral AI</li>
              <li>Extensible for new providers</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              4. Caching Layer (Redis)
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Intelligent cache key generation</li>
              <li>Instant response for cached queries</li>
              <li>$0 cost for cache hits</li>
              <li>Automatic cache invalidation</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              5. Database (PostgreSQL)
            </h3>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>User and organization management</li>
              <li>API key storage (hashed)</li>
              <li>Request logging and analytics</li>
              <li>Billing and credit tracking</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Technology Stack
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Component</th>
                <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">Technology</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-900 dark:text-white">Backend</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Node.js + TypeScript + Fastify</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-900 dark:text-white">Frontend</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Next.js 14 + React + Tailwind CSS</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-900 dark:text-white">Database</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">PostgreSQL + Drizzle ORM</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-900 dark:text-white">Cache</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Redis</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="p-4 text-gray-900 dark:text-white">Authentication</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">JWT + API Keys + Bcrypt</td>
              </tr>
              <tr>
                <td className="p-4 text-gray-900 dark:text-white">Monitoring</td>
                <td className="p-4 text-gray-600 dark:text-gray-300">Prometheus + Pino Logger</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Security */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Security Features
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔐 API Key Hashing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Bcrypt with 10 rounds</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🚦 Rate Limiting</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Per API key limits</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🛡️ CORS Protection</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Configurable origins</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📝 Audit Logging</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Track all activities</p>
          </div>
        </div>
      </section>
    </div>
  )
}

