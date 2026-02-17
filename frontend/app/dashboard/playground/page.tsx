'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { apiClient } from '@/lib/api'
import { Loader2, Send, Copy, Check, Settings, Zap, DollarSign, Clock } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Provider {
  name: string
  displayName: string
  models: string[]
  status: 'active' | 'inactive'
  pricing?: {
    input: number
    output: number
  }
}

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface TestResult {
  success: boolean
  response?: any
  error?: string
  latency?: number
  tokens?: {
    prompt: number
    completion: number
    total: number
  }
  cost?: number
  usedModel?: string  // Model that was actually used
  usedProvider?: string  // Provider that was actually used
}

export default function APIPlaygroundPage() {
  const [providers, setProviders] = useState<Provider[]>([
    { 
      name: 'openai', 
      displayName: 'OpenAI', 
      models: [
        // GPT-5 Series (Latest - Most Advanced) ⭐⭐⭐
        'gpt-5',
        'gpt-5-mini',
        'gpt-5-nano',
        'gpt-5-pro',
        'gpt-5-codex',
        // o3 Series (Reasoning Models) ⭐⭐
        'o3',
        'o3-mini',
        // o1 Series (Previous Reasoning Models)
        'o1',
        'o1-mini',
        'o1-preview',
        // GPT-4o Series
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4o-2024-11-20',
        'gpt-4o-2024-08-06',
        'gpt-4o-2024-05-13',
        'gpt-4o-mini-2024-07-18',
        'gpt-4o-audio-preview',
        'gpt-4o-audio-preview-2024-10-01',
        'chatgpt-4o-latest',
        // GPT-4 Turbo Series
        'gpt-4-turbo',
        'gpt-4-turbo-2024-04-09',
        'gpt-4-turbo-preview',
        'gpt-4-0125-preview',
        'gpt-4-1106-preview',
        'gpt-4-vision-preview',
        'gpt-4-1106-vision-preview',
        // GPT-4 Standard
        'gpt-4',
        'gpt-4-0613',
        'gpt-4-0314',
        'gpt-4-32k',
        'gpt-4-32k-0613',
        'gpt-4-32k-0314',
        // GPT-3.5 Turbo Series
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-0125',
        'gpt-3.5-turbo-1106',
        'gpt-3.5-turbo-16k',
        'gpt-3.5-turbo-0613',
        'gpt-3.5-turbo-16k-0613',
        // Legacy/Base Models
        'davinci-002',
        'babbage-002',
      ], 
      status: 'active', 
      pricing: { input: 2.5, output: 10 } // GPT-4o average pricing
    },
    { 
      name: 'anthropic', 
      displayName: 'Anthropic', 
      models: [
        // Claude 3.5 Series (Latest)
        'claude-3-5-sonnet-20241022',
        'claude-3-5-sonnet-20240620',
        // Claude 3 Series
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        // Claude 2 Series
        'claude-2.1',
        'claude-2.0',
        'claude-instant-1.2',
      ], 
      status: 'inactive', 
      pricing: { input: 3, output: 15 } // Claude 3.5 Sonnet pricing
    },
    { 
      name: 'mistral', 
      displayName: 'Mistral AI', 
      models: [
        // Large Models (Latest)
        'mistral-large-latest',
        'mistral-large-2411',
        'mistral-large-2407',
        'pixtral-large-latest',
        'pixtral-large-2411',
        // Medium Models
        'mistral-medium-latest',
        'mistral-medium-2312',
        // Small Models
        'mistral-small-latest',
        'mistral-small-2409',
        'mistral-small-2402',
        'mistral-small-2312',
        // Tiny Models
        'mistral-tiny',
        'mistral-tiny-2312',
        // Open Models
        'open-mistral-7b',
        'open-mistral-nemo',
        'open-mistral-nemo-2407',
        'open-mixtral-8x7b',
        'open-mixtral-8x22b',
        // Code Models
        'codestral-latest',
        'codestral-2405',
        'codestral-mamba-latest',
        'open-codestral-mamba',
        // Specialized Models
        'ministral-3b-latest',
        'ministral-8b-latest',
        'mistral-embed',
        'mistral-moderation-latest',
        'mistral-moderation-2411',
        // Vision Models
        'pixtral-12b-2409',
      ], 
      status: 'active', 
      pricing: { input: 1, output: 3 } // Mistral Small average pricing
    },
    { 
      name: 'gemini', 
      displayName: 'Google Gemini', 
      models: [
        // Gemini 2.0 Series (Latest)
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash-thinking-exp-1219',
        // Gemini 1.5 Series
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        // Gemini 1.0 Series
        'gemini-1.0-pro',
        'gemini-1.0-pro-vision',
        // Aliases (for compatibility)
        'gemini-pro',
        'gemini-pro-vision',
      ], 
      status: 'active', 
      pricing: { input: 1.25, output: 5 } // Gemini 1.5 Flash average pricing
    },
    { 
      name: 'mock', 
      displayName: 'Mock (Testing)', 
      models: ['mock-gpt-4', 'mock-claude-3'], 
      status: 'active', 
      pricing: { input: 0, output: 0 } 
    },
  ])
  
  const [selectedProvider, setSelectedProvider] = useState('openai')
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo')
  const [routingStrategy, setRoutingStrategy] = useState<string>('manual')
  const [useIntent, setUseIntent] = useState(false)  // NEW: Toggle between intent and model
  const [selectedIntent, setSelectedIntent] = useState('chat-standard')  // NEW: Selected intent
  const [systemMessage, setSystemMessage] = useState('You are a helpful assistant.')
  const [userMessage, setUserMessage] = useState('Hello! Tell me a fun fact about space.')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(500)
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TestResult | null>(null)
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState<'curl' | 'python' | 'javascript' | 'go'>('curl')
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('apiKey')
    if (storedKey) {
      setApiKey(storedKey)
    }
  }, [])

  // Save API key to localStorage when it changes
  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey)
    if (newKey) {
      localStorage.setItem('apiKey', newKey)
    } else {
      localStorage.removeItem('apiKey')
    }
  }

  const currentProvider = providers.find(p => p.name === selectedProvider)
  const availableModels = currentProvider?.models || []

  useEffect(() => {
    // Update model when provider changes
    if (availableModels.length > 0 && !availableModels.includes(selectedModel)) {
      setSelectedModel(availableModels[0])
    }
  }, [selectedProvider, availableModels, selectedModel])

  const handleTest = async () => {
    // Check if API key is configured
    if (!apiKey) {
      setResult({
        success: false,
        error: 'API key is required. Please enter your AIRouter API key above.',
        latency: 0,
      })
      return
    }

    setLoading(true)
    setResult(null)

    const startTime = Date.now()

    try {
      const messages: Message[] = []
      
      if (systemMessage.trim()) {
        messages.push({ role: 'system', content: systemMessage })
      }
      
      // Add conversation history
      conversationHistory.forEach(msg => messages.push(msg))
      
      // Add current user message
      messages.push({ role: 'user', content: userMessage })

      const requestBody: any = {
        messages,
        temperature,
        maxTokens,
      }

      // NEW: Support intent-based routing
      if (useIntent) {
        requestBody.intent = selectedIntent
        requestBody.routingStrategy = routingStrategy
      } else {
        // OLD: Model-based routing
        requestBody.model = selectedModel
        if (routingStrategy === 'manual') {
          requestBody.provider = selectedProvider
        } else {
          requestBody.routingStrategy = routingStrategy
        }
      }

      console.log('Sending request:', requestBody)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      })

      const latency = Date.now() - startTime
      const data = await response.json()

      if (response.ok) {
        const assistantMessage = data.choices[0]?.message?.content || 'No response'
        
        // Use backend-calculated cost if available, otherwise calculate locally
        const cost = data.cost 
          ? (data.cost / 100)  // Backend returns cents, convert to dollars
          : calculateCost(
              data.usage?.prompt_tokens || data.usage?.promptTokens || 0, 
              data.usage?.completion_tokens || data.usage?.completionTokens || 0
            )
        
        setResult({
          success: true,
          response: assistantMessage,
          latency,
          tokens: {
            prompt: data.usage?.prompt_tokens || data.usage?.promptTokens || 0,
            completion: data.usage?.completion_tokens || data.usage?.completionTokens || 0,
            total: data.usage?.total_tokens || data.usage?.totalTokens || 0,
          },
          cost,
          usedModel: data.model || selectedModel,  // Capture the actual model used
          usedProvider: data.provider || selectedProvider,  // Capture the actual provider used
        })

        // Add to conversation history
        setConversationHistory([
          ...conversationHistory,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: assistantMessage },
        ])

        setUserMessage('') // Clear input
      } else {
        setResult({
          success: false,
          error: data.message || data.error || 'Request failed',
          latency,
        })
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Network error',
        latency: Date.now() - startTime,
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateCost = (promptTokens: number, completionTokens: number): number => {
    if (!currentProvider?.pricing) return 0
    const inputCost = (promptTokens / 1_000_000) * currentProvider.pricing.input
    const outputCost = (completionTokens / 1_000_000) * currentProvider.pricing.output
    return inputCost + outputCost
  }

  const clearConversation = () => {
    setConversationHistory([])
    setResult(null)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // NEW: Get available options for an intent
  const getIntentOptions = (intent: string) => {
    // Intent registry data (subset for UI display)
    const intentRegistry: Record<string, Array<{
      provider: string
      model: string
      pricing: { input: number; output: number }
      performance: { avgLatency: number; quality: number }
    }>> = {
      'chat-premium': [
        { provider: 'openai', model: 'gpt-5', pricing: { input: 1.25, output: 10 }, performance: { avgLatency: 1200, quality: 10 } },
        { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', pricing: { input: 3, output: 15 }, performance: { avgLatency: 1000, quality: 9.5 } },
        { provider: 'mistral', model: 'mistral-large-latest', pricing: { input: 3, output: 9 }, performance: { avgLatency: 800, quality: 9 } },
      ],
      'chat-standard': [
        { provider: 'openai', model: 'gpt-4o', pricing: { input: 2.5, output: 10 }, performance: { avgLatency: 900, quality: 9 } },
        { provider: 'gemini', model: 'gemini-1.5-pro-latest', pricing: { input: 1.25, output: 5 }, performance: { avgLatency: 850, quality: 8.8 } },
        { provider: 'openai', model: 'gpt-5-mini', pricing: { input: 0.25, output: 2 }, performance: { avgLatency: 700, quality: 8.5 } },
        { provider: 'mistral', model: 'mistral-medium-latest', pricing: { input: 2.7, output: 8.1 }, performance: { avgLatency: 700, quality: 8 } },
      ],
      'chat-fast': [
        { provider: 'gemini', model: 'gemini-1.5-flash-latest', pricing: { input: 0.075, output: 0.3 }, performance: { avgLatency: 350, quality: 7.5 } },
        { provider: 'mistral', model: 'mistral-small-latest', pricing: { input: 0.2, output: 0.6 }, performance: { avgLatency: 400, quality: 7 } },
        { provider: 'mistral', model: 'mistral-tiny', pricing: { input: 0.1, output: 0.3 }, performance: { avgLatency: 300, quality: 6 } },
        { provider: 'openai', model: 'gpt-4o-mini', pricing: { input: 0.15, output: 0.6 }, performance: { avgLatency: 600, quality: 8 } },
        { provider: 'anthropic', model: 'claude-3-haiku-20240307', pricing: { input: 0.25, output: 1.25 }, performance: { avgLatency: 500, quality: 7.5 } },
      ],
      'chat-budget': [
        { provider: 'gemini', model: 'gemini-1.5-flash-8b', pricing: { input: 0.0375, output: 0.15 }, performance: { avgLatency: 300, quality: 6.5 } },
        { provider: 'mistral', model: 'ministral-3b-latest', pricing: { input: 0.04, output: 0.04 }, performance: { avgLatency: 250, quality: 5.5 } },
        { provider: 'openai', model: 'gpt-5-nano', pricing: { input: 0.05, output: 0.4 }, performance: { avgLatency: 500, quality: 7.5 } },
        { provider: 'mistral', model: 'mistral-tiny', pricing: { input: 0.1, output: 0.3 }, performance: { avgLatency: 300, quality: 6 } },
      ],
      'code-generation': [
        { provider: 'mistral', model: 'codestral-latest', pricing: { input: 0.25, output: 0.25 }, performance: { avgLatency: 800, quality: 9 } },
        { provider: 'openai', model: 'gpt-5-codex', pricing: { input: 1.5, output: 12 }, performance: { avgLatency: 1100, quality: 10 } },
        { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', pricing: { input: 3, output: 15 }, performance: { avgLatency: 1000, quality: 9.5 } },
      ],
      'code-review': [
        { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', pricing: { input: 3, output: 15 }, performance: { avgLatency: 1000, quality: 9.5 } },
        { provider: 'openai', model: 'gpt-5', pricing: { input: 1.25, output: 10 }, performance: { avgLatency: 1200, quality: 9 } },
        { provider: 'openai', model: 'gpt-4o', pricing: { input: 2.5, output: 10 }, performance: { avgLatency: 900, quality: 8.5 } },
      ],
      'vision-analysis': [
        { provider: 'gemini', model: 'gemini-1.5-pro-latest', pricing: { input: 1.25, output: 5 }, performance: { avgLatency: 900, quality: 8.8 } },
        { provider: 'openai', model: 'gpt-4o', pricing: { input: 2.5, output: 10 }, performance: { avgLatency: 1200, quality: 9 } },
        { provider: 'mistral', model: 'pixtral-large-latest', pricing: { input: 0.25, output: 0.25 }, performance: { avgLatency: 900, quality: 8 } },
        { provider: 'mistral', model: 'pixtral-12b-2409', pricing: { input: 0.25, output: 0.25 }, performance: { avgLatency: 700, quality: 7 } },
      ],
      'long-context': [
        { provider: 'gemini', model: 'gemini-1.5-pro-latest', pricing: { input: 1.25, output: 5 }, performance: { avgLatency: 1500, quality: 9 } },
        { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', pricing: { input: 3, output: 15 }, performance: { avgLatency: 1500, quality: 9.5 } },
        { provider: 'anthropic', model: 'claude-3-haiku-20240307', pricing: { input: 0.25, output: 1.25 }, performance: { avgLatency: 800, quality: 7.5 } },
        { provider: 'openai', model: 'gpt-4o', pricing: { input: 2.5, output: 10 }, performance: { avgLatency: 900, quality: 9 } },
      ],
      'creative-writing': [
        { provider: 'openai', model: 'gpt-5', pricing: { input: 1.25, output: 10 }, performance: { avgLatency: 1200, quality: 10 } },
        { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', pricing: { input: 3, output: 15 }, performance: { avgLatency: 1000, quality: 9.5 } },
        { provider: 'anthropic', model: 'claude-3-opus-20240229', pricing: { input: 15, output: 75 }, performance: { avgLatency: 1500, quality: 9.5 } },
      ],
      'translation': [
        { provider: 'mistral', model: 'mistral-large-latest', pricing: { input: 3, output: 9 }, performance: { avgLatency: 800, quality: 9 } },
        { provider: 'mistral', model: 'mistral-small-latest', pricing: { input: 0.2, output: 0.6 }, performance: { avgLatency: 400, quality: 7.5 } },
        { provider: 'openai', model: 'gpt-5', pricing: { input: 1.25, output: 10 }, performance: { avgLatency: 1200, quality: 9 } },
      ],
      'summarization': [
        { provider: 'anthropic', model: 'claude-3-haiku-20240307', pricing: { input: 0.25, output: 1.25 }, performance: { avgLatency: 500, quality: 7.5 } },
        { provider: 'openai', model: 'gpt-5-mini', pricing: { input: 0.25, output: 2 }, performance: { avgLatency: 700, quality: 8.5 } },
        { provider: 'mistral', model: 'mistral-small-latest', pricing: { input: 0.2, output: 0.6 }, performance: { avgLatency: 400, quality: 7 } },
      ],
      'data-analysis': [
        { provider: 'openai', model: 'gpt-5', pricing: { input: 1.25, output: 10 }, performance: { avgLatency: 1200, quality: 9.5 } },
        { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022', pricing: { input: 3, output: 15 }, performance: { avgLatency: 1000, quality: 9.5 } },
        { provider: 'anthropic', model: 'claude-3-opus-20240229', pricing: { input: 15, output: 75 }, performance: { avgLatency: 1500, quality: 9.5 } },
      ],
    }

    const options = intentRegistry[intent] || []

    // Sort based on routing strategy
    if (routingStrategy === 'cost') {
      return [...options].sort((a, b) => (a.pricing.input + a.pricing.output) - (b.pricing.input + b.pricing.output))
    } else if (routingStrategy === 'latency') {
      return [...options].sort((a, b) => a.performance.avgLatency - b.performance.avgLatency)
    } else {
      return options // Default order (quality/priority)
    }
  }

  const generateCurlCommand = () => {
    const displayKey = apiKey || 'YOUR_API_KEY'
    const messages = [
      ...(systemMessage.trim() ? [{ role: 'system', content: systemMessage }] : []),
      { role: 'user', content: userMessage },
    ]

    const requestBody: any = {
      messages,
      temperature,
      maxTokens,
    }

    // NEW: Support intent-based examples
    if (useIntent) {
      requestBody.intent = selectedIntent
      requestBody.routingStrategy = routingStrategy
    } else {
      requestBody.model = selectedModel
      if (routingStrategy === 'manual') {
        requestBody.provider = selectedProvider
      } else {
        requestBody.routingStrategy = routingStrategy
      }
    }

    return `curl -X POST ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${displayKey}" \\
  -d '${JSON.stringify(requestBody, null, 2)}'`
  }

  const generatePythonExample = () => {
    const displayKey = apiKey || 'YOUR_API_KEY'
    const messages = [
      ...(systemMessage.trim() ? [{ role: 'system', content: systemMessage }] : []),
      { role: 'user', content: userMessage },
    ]

    const requestData: any = {
      messages,
      temperature,
      maxTokens,
    }

    if (useIntent) {
      requestData.intent = selectedIntent
      requestData.routingStrategy = routingStrategy
    } else {
      requestData.model = selectedModel
      if (routingStrategy === 'manual') {
        requestData.provider = selectedProvider
      } else {
        requestData.routingStrategy = routingStrategy
      }
    }

    return `import requests
import json

# Your AIRouter API key
api_key = "${displayKey}"
url = "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/chat/completions"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {api_key}"
}

data = ${JSON.stringify(requestData, null, 4)}

response = requests.post(url, headers=headers, json=data)
result = response.json()

print(json.dumps(result, indent=2))`
  }

  const generateJavaScriptExample = () => {
    const displayKey = apiKey || 'YOUR_API_KEY'
    const messages = [
      ...(systemMessage.trim() ? [{ role: 'system', content: systemMessage }] : []),
      { role: 'user', content: userMessage },
    ]

    const requestData: any = {
      messages,
      temperature,
      maxTokens,
    }

    if (useIntent) {
      requestData.intent = selectedIntent
      requestData.routingStrategy = routingStrategy
    } else {
      requestData.model = selectedModel
      if (routingStrategy === 'manual') {
        requestData.provider = selectedProvider
      } else {
        requestData.routingStrategy = routingStrategy
      }
    }

    return `// Node.js example
const fetch = require('node-fetch');

// Your AIRouter API key
const apiKey = '${displayKey}';
const url = '${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/chat/completions';

const data = ${JSON.stringify(requestData, null, 2)};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${apiKey}\`
  },
  body: JSON.stringify(data)
})
  .then(response => response.json())
  .then(result => console.log(JSON.stringify(result, null, 2)))
  .catch(error => console.error('Error:', error));`
  }

  const generateGoExample = () => {
    const displayKey = apiKey || 'YOUR_API_KEY'
    const messages = [
      ...(systemMessage.trim() ? [{ role: 'system', content: systemMessage }] : []),
      { role: 'user', content: userMessage },
    ]

    const requestData: any = {
      messages,
      temperature,
      maxTokens,
    }

    if (useIntent) {
      requestData.intent = selectedIntent
      requestData.routingStrategy = routingStrategy
    } else {
      requestData.model = selectedModel
      if (routingStrategy === 'manual') {
        requestData.provider = selectedProvider
      } else {
        requestData.routingStrategy = routingStrategy
      }
    }

    return `package main

import (
\t"bytes"
\t"encoding/json"
\t"fmt"
\t"io/ioutil"
\t"net/http"
)

func main() {
\t// Your AIRouter API key
\tapiKey := "${displayKey}"
\turl := "${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/chat/completions"

\tdata := ${JSON.stringify(requestData, null, 2).replace(/\n/g, '\n\t')}

\tjsonData, _ := json.Marshal(data)
\treq, _ := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
\treq.Header.Set("Content-Type", "application/json")
\treq.Header.Set("Authorization", "Bearer "+apiKey)

\tclient := &http.Client{}
\tresp, err := client.Do(req)
\tif err != nil {
\t\tfmt.Println("Error:", err)
\t\treturn
\t}
\tdefer resp.Body.Close()

\tbody, _ := ioutil.ReadAll(resp.Body)
\tfmt.Println(string(body))
}`
  }

  const getCurrentCodeExample = () => {
    switch (codeLanguage) {
      case 'curl':
        return generateCurlCommand()
      case 'python':
        return generatePythonExample()
      case 'javascript':
        return generateJavaScriptExample()
      case 'go':
        return generateGoExample()
      default:
        return generateCurlCommand()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Playground</h1>
        <p className="text-muted-foreground">
          Test your unified AI API with all available providers and models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Select provider and model</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Key Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>AIRouter API Key</Label>
                  {apiKey && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      ✓ Configured
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder="sk-air-..."
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3"
                  >
                    {showApiKey ? '👁️' : '👁️‍🗨️'}
                  </Button>
                </div>
                {!apiKey && (
                  <Alert>
                    <AlertDescription className="text-xs">
                      💡 Get your API key from the <a href="/dashboard/api-keys" className="underline font-medium">API Keys page</a>
                    </AlertDescription>
                  </Alert>
                )}
                {apiKey && (
                  <p className="text-xs text-muted-foreground">
                    Key: {apiKey.substring(0, 15)}...{apiKey.substring(apiKey.length - 4)}
                  </p>
                )}
              </div>

              {/* NEW: Intent vs Model Toggle */}
              <div className="space-y-2">
                <Label>Request Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={!useIntent ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUseIntent(false)}
                    className="flex-1"
                  >
                    🎯 By Model
                  </Button>
                  <Button
                    variant={useIntent ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setUseIntent(true)
                      // When switching to intent mode, use a non-manual strategy
                      if (routingStrategy === 'manual') {
                        setRoutingStrategy('cost')
                      }
                    }}
                    className="flex-1"
                  >
                    💡 By Intent (Smart)
                  </Button>
                </div>
                {useIntent && (
                  <p className="text-xs text-muted-foreground bg-green-50 dark:bg-green-900/20 p-2 rounded-md border border-green-200 dark:border-green-800">
                    ✨ Intent-based routing automatically selects the best model based on your goal and strategy!
                  </p>
                )}
              </div>

              {/* NEW: Intent Selector (only when useIntent is true) */}
              {useIntent && (
                <div className="space-y-2">
                  <Label>What do you want to do?</Label>
                  <Select value={selectedIntent} onValueChange={setSelectedIntent}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Chat</SelectLabel>
                        <SelectItem value="chat-premium">💎 Premium Chat (Best Quality)</SelectItem>
                        <SelectItem value="chat-standard">⚖️ Standard Chat (Balanced)</SelectItem>
                        <SelectItem value="chat-fast">⚡ Fast Chat (Speed Priority)</SelectItem>
                        <SelectItem value="chat-budget">💰 Budget Chat (Lowest Cost)</SelectItem>
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>Specialized</SelectLabel>
                        <SelectItem value="code-generation">💻 Code Generation</SelectItem>
                        <SelectItem value="code-review">🔍 Code Review</SelectItem>
                        <SelectItem value="vision-analysis">👁️ Vision Analysis</SelectItem>
                        <SelectItem value="long-context">📄 Long Documents</SelectItem>
                        <SelectItem value="creative-writing">✍️ Creative Writing</SelectItem>
                        <SelectItem value="translation">🌐 Translation</SelectItem>
                        <SelectItem value="summarization">📝 Summarization</SelectItem>
                        <SelectItem value="data-analysis">📊 Data Analysis</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Routing Strategy */}
              <div className="space-y-2">
                <Label>Routing Strategy</Label>
                <Select value={routingStrategy} onValueChange={setRoutingStrategy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {!useIntent && <SelectItem value="manual">Manual Selection</SelectItem>}
                    <SelectItem value="cost">Cost Optimized</SelectItem>
                    <SelectItem value="latency">Latency Optimized</SelectItem>
                    <SelectItem value="priority">Priority Based</SelectItem>
                    <SelectItem value="fallback">Fallback Chain</SelectItem>
                  </SelectContent>
                </Select>
                
                {/* Strategy Descriptions */}
                {routingStrategy === 'manual' && (
                  <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">📌 Manual Selection</p>
                    <p>You choose the exact provider and model. Perfect for testing specific models or when you need complete control over which AI service handles your request.</p>
                  </div>
                )}
                
                {routingStrategy === 'cost' && (
                  <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                    <p className="font-medium text-green-900 dark:text-green-100 mb-1">💰 Cost Optimized</p>
                    <p>AIRouter automatically selects the cheapest provider that supports your requested model. Ideal for high-volume applications where cost savings matter. The system estimates token usage and picks the provider with the lowest price.</p>
                  </div>
                )}
                
                {routingStrategy === 'latency' && (
                  <div className="text-xs text-muted-foreground bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border border-purple-200 dark:border-purple-800">
                    <p className="font-medium text-purple-900 dark:text-purple-100 mb-1">⚡ Latency Optimized</p>
                    <p>AIRouter selects the fastest responding provider based on historical performance metrics. Best for real-time applications where speed is critical. The system tracks average response times and routes to the provider with the lowest latency.</p>
                  </div>
                )}
                
                {routingStrategy === 'priority' && (
                  <div className="text-xs text-muted-foreground bg-orange-50 dark:bg-orange-900/20 p-3 rounded-md border border-orange-200 dark:border-orange-800">
                    <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">🎯 Priority Based</p>
                    <p>Routes to your preferred provider if available, otherwise falls back to the next available option. Useful when you have a preferred provider but want automatic failover. The model you specify will be used if the provider supports it.</p>
                  </div>
                )}
                
                {routingStrategy === 'fallback' && (
                  <div className="text-xs text-muted-foreground bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                    <p className="font-medium text-red-900 dark:text-red-100 mb-1">🔄 Fallback Chain</p>
                    <p>Tries providers in order until one succeeds. Provides maximum reliability by automatically switching to backup providers if the primary fails. Includes health checks to skip unhealthy providers. Perfect for production environments requiring high availability.</p>
                  </div>
                )}
              </div>

              {/* Provider Selection (only for manual and not using intent) */}
              {!useIntent && routingStrategy === 'manual' && (
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => (
                        <SelectItem key={provider.name} value={provider.name}>
                          <div className="flex items-center gap-2">
                            {provider.displayName}
                            <Badge variant={provider.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                              {provider.status}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Model Selection (only for manual routing and not using intent) */}
              {!useIntent && routingStrategy === 'manual' ? (
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map(model => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {availableModels.length} models available for {currentProvider?.displayName}
                  </p>
                </div>
              ) : !useIntent ? (
                <div className="space-y-2">
                  <Label>Model Name</Label>
                  <input
                    type="text"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    placeholder="e.g., gpt-4o, claude-3-5-sonnet-20241022, mistral-large-latest"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="text-xs text-muted-foreground">
                    AIRouter will find the best provider for this model based on your selected strategy
                  </p>
                </div>
              ) : null}

              {/* Advanced Settings Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full"
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
              </Button>

              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="space-y-4 pt-2 border-t">
                  <div className="space-y-2">
                    <Label>Temperature: {temperature}</Label>
                    <Slider
                      value={[temperature]}
                      onValueChange={([value]) => setTemperature(value)}
                      min={0}
                      max={2}
                      step={0.1}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher values make output more random
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Tokens: {maxTokens}</Label>
                    <Slider
                      value={[maxTokens]}
                      onValueChange={([value]) => setMaxTokens(value)}
                      min={1}
                      max={4000}
                      step={100}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum length of the response
                    </p>
                  </div>
                </div>
              )}

              {/* Pricing Info */}
              {currentProvider?.pricing && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Pricing</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Input:</span>
                      <span>${currentProvider.pricing.input}/1M tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Output:</span>
                      <span>${currentProvider.pricing.output}/1M tokens</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NEW: Available Options Comparison (only when using intent mode) */}
          {useIntent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Available Options for {selectedIntent.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</CardTitle>
                <CardDescription>Comparing models based on your {routingStrategy} strategy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getIntentOptions(selectedIntent).map((option, index) => (
                    <div 
                      key={`${option.provider}-${option.model}`}
                      className={`p-3 rounded-lg border ${
                        index === 0 && routingStrategy === 'cost' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                        index === 0 && routingStrategy === 'latency' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' :
                        'border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium">{option.provider.charAt(0).toUpperCase() + option.provider.slice(1)}</p>
                          <p className="text-xs text-muted-foreground">{option.model}</p>
                        </div>
                        {index === 0 && routingStrategy === 'cost' && (
                          <Badge variant="default" className="bg-green-600">💰 Cheapest</Badge>
                        )}
                        {index === 0 && routingStrategy === 'latency' && (
                          <Badge variant="default" className="bg-purple-600">⚡ Fastest</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">Cost</p>
                          <p className="font-medium">${option.pricing.input}/{option.pricing.output}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Speed</p>
                          <p className="font-medium">{option.performance.avgLatency}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quality</p>
                          <p className="font-medium">{option.performance.quality}/10</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {routingStrategy === 'cost' && '💡 Comparing costs for estimated token usage'}
                  {routingStrategy === 'latency' && '💡 Based on historical latency data'}
                  {routingStrategy === 'priority' && '💡 Using priority ordering with fallbacks'}
                  {routingStrategy === 'fallback' && '💡 Will try each option until success'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Testing Interface */}
        <div className="lg:col-span-2 space-y-4">
          {/* System Message */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">System Message (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={systemMessage}
                onChange={(e) => setSystemMessage(e.target.value)}
                placeholder="Define the AI's behavior and personality..."
                rows={2}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Conversation History</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearConversation}>
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {conversationHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                          : 'bg-gray-50 dark:bg-gray-800 mr-8'
                      }`}
                    >
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        {msg.role === 'user' ? 'You' : 'Assistant'}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Message Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Your Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={4}
                className="resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleTest()
                  }
                }}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  Press Cmd+Enter (Mac) or Ctrl+Enter (Windows) to send
                </p>
                <Button onClick={handleTest} disabled={loading || !userMessage.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Request
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Response */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Response</span>
                  {result.success && (
                    <div className="flex gap-2 flex-wrap">
                      {/* Show which model/provider was actually used */}
                      {result.usedProvider && result.usedModel && (
                        <Badge variant="default" className="flex items-center gap-1 bg-blue-600">
                          <span className="font-semibold">Used:</span>
                          {result.usedProvider} / {result.usedModel}
                        </Badge>
                      )}
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {result.latency}ms
                      </Badge>
                      {result.tokens && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {result.tokens.total} tokens
                        </Badge>
                      )}
                      {result.cost !== undefined && result.cost > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${result.cost.toFixed(6)}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-3">
                    {/* Routing Info - Show prominently when using routing strategies */}
                    {routingStrategy !== 'manual' && result.usedProvider && result.usedModel && (
                      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                        <AlertDescription className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-900 dark:text-blue-100">
                              🎯 Routing Result:
                            </span>
                            <span className="text-blue-800 dark:text-blue-200">
                              Selected <strong>{result.usedProvider}</strong> provider with <strong>{result.usedModel}</strong> model
                            </span>
                          </div>
                          <Badge variant="outline" className="bg-white dark:bg-gray-800">
                            {routingStrategy} strategy
                          </Badge>
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{result.response}</p>
                    </div>
                    {result.tokens && (
                      <div className="text-xs text-muted-foreground grid grid-cols-3 gap-2">
                        <div>Prompt: {result.tokens.prompt} tokens</div>
                        <div>Completion: {result.tokens.completion} tokens</div>
                        <div>Total: {result.tokens.total} tokens</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertDescription>{result.error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* API Examples */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">API Examples</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(getCurrentCodeExample())}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant={codeLanguage === 'curl' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCodeLanguage('curl')}
                >
                  cURL
                </Button>
                <Button
                  variant={codeLanguage === 'python' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCodeLanguage('python')}
                >
                  Python
                </Button>
                <Button
                  variant={codeLanguage === 'javascript' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCodeLanguage('javascript')}
                >
                  JavaScript
                </Button>
                <Button
                  variant={codeLanguage === 'go' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCodeLanguage('go')}
                >
                  Go
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                {getCurrentCodeExample()}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

