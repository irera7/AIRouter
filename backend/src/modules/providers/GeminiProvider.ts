/**
 * Google Gemini Provider
 * Supports Gemini models via Google AI API
 */

import { BaseProvider } from './BaseProvider.js'
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ProviderConfig,
  ProviderError,
  ProviderHealth,
} from './types.js'
import { logger } from '../../utils/logger.js'

interface GeminiMessage {
  role: string
  parts: Array<{ text: string }>
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>
      role: string
    }
    finishReason: string
  }>
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export class GeminiProvider extends BaseProvider {
  private apiKey: string
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta'

  constructor(config: ProviderConfig) {
    super(config)
    
    if (!config.apiKey) {
      throw new ProviderError('Gemini API key is required', 'gemini')
    }

    this.apiKey = config.apiKey
  }

  async initialize(): Promise<void> {
    logger.info(`Initializing Gemini provider...`)
    try {
      const health = await this.healthCheck()
      if (!health.isHealthy) {
        throw new Error(health.error || 'Health check failed')
      }
      logger.info(`Gemini provider initialized successfully`)
    } catch (error) {
      logger.error({ error }, `Failed to initialize Gemini provider`)
      throw new ProviderError(
        'Failed to initialize Gemini provider',
        this.name,
        undefined,
        error instanceof Error ? error : undefined
      )
    }
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now()
    try {
      // Use a simple model list request for health check
      const model = 'gemini-pro'
      const url = `${this.baseUrl}/models/${model}?key=${this.apiKey}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          isHealthy: false,
          latency: Date.now() - startTime,
          error: `HTTP ${response.status}: ${errorText}`,
        }
      }

      const latency = Date.now() - startTime
      return {
        isHealthy: true,
        latency,
      }
    } catch (error) {
      return {
        isHealthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  async chatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    this.validateRequest(request)
    this.logRequest(request)

    const startTime = Date.now()
    
    try {
      const model = this.mapModel(request.model)
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`

      // Convert messages to Gemini format
      const contents = this.convertMessages(request.messages)

      // Build request body
      const requestBody: any = {
        contents,
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.maxTokens || 1000,
          topP: request.topP,
          stopSequences: request.stop,
        },
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new ProviderError(
          `Gemini API error: ${errorText}`,
          this.name,
          response.status
        )
      }

      const data: GeminiResponse = await response.json()

      if (!data.candidates || data.candidates.length === 0) {
        throw new ProviderError('No response from Gemini', this.name)
      }

      const candidate = data.candidates[0]
      const content = candidate.content.parts.map(p => p.text).join('')
      const latency = Date.now() - startTime

      // Handle token usage - use rough estimation if not provided
      const estimateTokens = (text: string) => Math.ceil(text.length / 4);
      const promptTokens = data.usageMetadata?.promptTokenCount || estimateTokens(
        request.messages.map((m) => m.content).join(' ')
      )
      const completionTokens = data.usageMetadata?.candidatesTokenCount || estimateTokens(content)
      const totalTokens = data.usageMetadata?.totalTokenCount || (promptTokens + completionTokens)

      const chatResponse: ChatCompletionResponse = {
        id: `gemini-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: request.model,
        provider: 'gemini',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: content,
            },
            finishReason: this.mapFinishReason(candidate.finishReason),
          },
        ],
        usage: {
          promptTokens: promptTokens,
          completionTokens: completionTokens,
          totalTokens: totalTokens,
        },
      }

      this.recordSuccess(latency)
      this.logResponse(chatResponse, latency)

      return chatResponse
    } catch (error: any) {
      this.recordFailure(error instanceof Error ? error : new Error('Unknown error'))
      throw error
    }
  }

  /**
   * Convert OpenAI-style messages to Gemini format
   */
  private convertMessages(messages: Array<{ role: string; content: string }>): GeminiMessage[] {
    const geminiMessages: GeminiMessage[] = []
    
    for (const msg of messages) {
      // Gemini uses 'user' and 'model' roles (not 'assistant')
      let role = msg.role
      if (role === 'assistant') {
        role = 'model'
      } else if (role === 'system') {
        // Gemini doesn't have a system role, prepend to first user message
        continue
      }

      geminiMessages.push({
        role,
        parts: [{ text: msg.content }],
      })
    }

    // If there was a system message, prepend it to the first user message
    const systemMsg = messages.find(m => m.role === 'system')
    if (systemMsg && geminiMessages.length > 0 && geminiMessages[0].role === 'user') {
      geminiMessages[0].parts[0].text = `${systemMsg.content}\n\n${geminiMessages[0].parts[0].text}`
    }

    return geminiMessages
  }

  /**
   * Map Gemini finish reason to OpenAI format
   */
  private mapFinishReason(finishReason: string): string {
    const mapping: Record<string, string> = {
      'STOP': 'stop',
      'MAX_TOKENS': 'length',
      'SAFETY': 'content_filter',
      'RECITATION': 'content_filter',
      'OTHER': 'stop',
    }
    return mapping[finishReason] || 'stop'
  }

  /**
   * Map model names (handle aliases)
   */
  protected mapModel(model: string): string {
    const modelMap: Record<string, string> = {
      // Gemini 2.0 series
      'gemini-2.0-flash': 'gemini-2.0-flash-exp',
      'gemini-2.0-flash-thinking': 'gemini-2.0-flash-thinking-exp-1219',
      
      // Gemini 1.5 series
      'gemini-1.5-pro-latest': 'gemini-1.5-pro-latest',
      'gemini-1.5-pro': 'gemini-1.5-pro',
      'gemini-1.5-flash-latest': 'gemini-1.5-flash-latest',
      'gemini-1.5-flash': 'gemini-1.5-flash',
      'gemini-1.5-flash-8b': 'gemini-1.5-flash-8b',
      
      // Gemini 1.0 series
      'gemini-pro': 'gemini-1.0-pro',
      'gemini-pro-vision': 'gemini-1.0-pro-vision',
    }

    return modelMap[model] || model
  }
}

export function createGeminiProvider(dbProvider: any): GeminiProvider {
  const config: ProviderConfig = {
    name: dbProvider.name,
    displayName: dbProvider.displayName,
    baseUrl: dbProvider.baseUrl,
    apiKey: process.env.GEMINI_API_KEY,
    isActive: dbProvider.isActive,
    timeout: dbProvider.config.timeout || 60000,
    retries: 3,
    supportedModels: dbProvider.config.supportedModels,
    pricing: dbProvider.pricing,
  }
  return new GeminiProvider(config)
}
