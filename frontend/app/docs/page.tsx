'use client'

import Link from 'next/link'
import { BookOpen, Zap, Code, Shield, TrendingUp, Rocket } from 'lucide-react'

const docSections = [
  {
    title: 'Getting Started',
    icon: Rocket,
    links: [
      { name: 'Quickstart Guide', href: '/docs/quickstart', description: 'Get up and running in 5 minutes' },
      { name: 'API Reference', href: '/docs/api-reference', description: 'Complete API documentation' },
    ]
  },
  {
    title: 'Features',
    icon: Zap,
    links: [
      { name: 'Routing Strategies', href: '/docs/routing', description: 'Cost, latency, and fallback routing' },
      { name: 'Best Practices', href: '/docs/best-practices', description: 'Optimization tips and patterns' },
    ]
  },
  {
    title: 'Resources',
    icon: BookOpen,
    links: [
      { name: 'Architecture', href: '/docs/architecture', description: 'System design and components' },
      { name: 'Interactive API (Swagger)', href: process.env.NEXT_PUBLIC_API_URL + '/docs' || 'http://localhost:3000/docs', description: 'Try the API in your browser', external: true },
    ]
  }
]

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AIRouter Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to integrate and optimize your AI applications
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Link 
            href="/docs/quickstart"
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg group-hover:scale-110 transition-transform">
                <Rocket className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Start</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Get started in 5 minutes with code examples
            </p>
          </Link>

          <Link 
            href="/docs/api-reference"
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:scale-110 transition-transform">
                <Code className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">API Reference</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Complete endpoint documentation
            </p>
          </Link>

          <Link 
            href="/docs/routing"
            className="group p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Routing</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              Intelligent provider selection
            </p>
          </Link>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-12">
          {docSections.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-6">
                  <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {section.links.map((link) => (
                    link.external ? (
                      <a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              {link.name} ↗
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {link.description}
                            </p>
                          </div>
                        </div>
                      </a>
                    ) : (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="group p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {link.name} →
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {link.description}
                        </p>
                      </Link>
                    )
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Features Grid */}
        <div className="mt-16 grid md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Smart Routing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Cost & latency optimization</p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
              <Shield className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">API key authentication</p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Usage tracking & insights</p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg mb-4">
              <Code className="w-6 h-6 text-orange-600 dark:text-orange-300" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">OpenAI SDK</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Drop-in compatible</p>
          </div>
        </div>
      </div>
    </div>
  )
}

