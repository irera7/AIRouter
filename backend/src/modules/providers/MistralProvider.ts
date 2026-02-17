/**
 * Mistral AI Provider
 * Integrates with Mistral AI models
 */

import { Mistral } from '@mistralai/mistralai'
import { BaseProvider } from './BaseProvider.js'
import {
  ChatCompletionRequest,
  ChatCompletionResponse,
  ProviderConfig,
  ProviderError,
  ProviderHealth,
} from './types.js'
import { logger } from '../../utils/logger.js'

export class MistralProvider extends BaseProvider {
  private client: Mistral
  private apiKey: string

  constructor(config: ProviderConfig) {
    super(config)
    
    if (!config.apiKey) {
      throw new ProviderError('Mistral API key is required', 'mistral')
    }

    this.apiKey = config.apiKey
    this.client = new Mistral({ apiKey: config.apiKey })
  }

  /**
   * Initialize the provider
   */
  async initialize(): Promise<void> {
    logger.info(`Initializing Mistral provider...`)
    
    try {
      const health = await this.healthCheck()
      if (!health.isHealthy) {
        throw new Error(health.error || 'Health check failed')
      }
      logger.info(`Mistral provider initialized successfully`)
    } catch (error) {
      logger.error({ error }, `Failed to initialize Mistral provider`)
      throw new ProviderError(
        'Failed to initialize Mistral provider',
        this.name,
        undefined,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Health check - verifies API connectivity
   */
  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now()

    try {
      // Try to list models as a health check
      const response = await fetch('https://api.mistral.ai/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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

  /**
   * Create a chat completion
   */
  async chatCompletion(
    request: ChatCompletionRequest
  ): Promise<ChatCompletionResponse> {
    this.validateRequest(request)
    this.logRequest(request)

    const startTime = Date.now()
    
    try {
      const response = await this.client.chat.complete({
        model: this.mapModel(request.model),
        messages: request.messages.map((msg) => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        topP: request.topP,
        stop: request.stop,
      } as any)

      const choice = response.choices[0]
      if (!choice) {
        throw new ProviderError('No response from Mistral', this.name)
      }

      const latency = Date.now() - startTime
      
      const usage = response.usage as any;
      const promptTokens = usage?.promptTokens || usage?.prompt_tokens || this.estimateTokens(
        request.messages.map((m) => m.content).join(' ')
      );
      const completionTokens = usage?.completionTokens || usage?.completion_tokens || this.estimateTokens(
        String(choice.message.content || '')
      );
      
      const chatResponse: ChatCompletionResponse = {
        id: response.id || `mistral-${Date.now()}`,
        object: 'chat.completion',
        created: response.created || Math.floor(Date.now() / 1000),
        model: request.model,
        provider: 'mistral',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: String(choice.message.content || ''),
            },
            finishReason: (choice as any).finishReason || (choice as any).finish_reason || 'stop',
          },
        ],
        usage: {
          promptTokens: promptTokens,
          completionTokens: completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
      }

      this.recordSuccess(latency)
      this.logResponse(chatResponse, latency)

      return chatResponse
    } catch (error: any) {
      this.recordFailure(error instanceof Error ? error : new Error('Unknown error'))
      throw this.handleError(error)
    }
  }

  /**
   * Map model name to Mistral model
   */
  private mapModel(model: string): string {
    const modelMap: Record<string, string> = {
      'mistral-tiny': 'mistral-tiny',
      'mistral-small': 'mistral-small-latest',
      'mistral-medium': 'mistral-medium-latest',
      'mistral-large': 'mistral-large-latest',
      'codestral': 'codestral-latest',
      'mixtral-8x7b': 'open-mixtral-8x7b',
      'mixtral-8x22b': 'open-mixtral-8x22b',
    }

    return modelMap[model] || 'mistral-small-latest'
  }

  /**
   * Estimate tokens
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~1.3 tokens per word
    return Math.ceil(text.split(/\s+/).length * 1.3)
  }

  /**
   * Handle provider-specific errors
   */
  protected handleError(error: any): ProviderError {
    let message = error.message || 'Unknown Mistral error'
    let statusCode = error.status || 500
    let retryable = false

    if (error.status === 429) {
      retryable = true
      message = 'Rate limit exceeded'
    } else if (error.status === 400) {
      statusCode = 400
      message = `Invalid request: ${error.message}`
    } else if (error.status === 401 || error.status === 403) {
      statusCode = 401
      message = 'Invalid API key'
    }

    return new ProviderError(message, this.name, statusCode)
  }

  /**
   * Get model information
   */
  async getModelInfo(model: string): Promise<any> {
    return {
      id: model,
      provider: 'mistral',
      pricing: this.getPricing(model),
      contextWindow: this.getContextWindow(model),
      features: ['chat', 'function-calling'],
    }
  }

  /**
   * Get pricing for model
   */
  private getPricing(model: string): { promptCost: number; completionCost: number } {
    const pricing: Record<string, { promptCost: number; completionCost: number }> = {
      'mistral-tiny': {
        promptCost: 0.00014,
        completionCost: 0.00042,
      },
      'mistral-small': {
        promptCost: 0.0006,
        completionCost: 0.0018,
      },
      'mistral-medium': {
        promptCost: 0.0027,
        completionCost: 0.0081,
      },
      'mistral-large': {
        promptCost: 0.004,
        completionCost: 0.012,
      },
      'codestral': {
        promptCost: 0.0006,
        completionCost: 0.0018,
      },
    }

    return pricing[model] || pricing['mistral-small']
  }

  /**
   * Get context window for model
   */
  private getContextWindow(model: string): number {
    const contextWindows: Record<string, number> = {
      'mistral-tiny': 32000,
      'mistral-small': 32000,
      'mistral-medium': 32000,
      'mistral-large': 32000,
      'codestral': 32000,
      'mixtral-8x7b': 32000,
      'mixtral-8x22b': 64000,
    }

    return contextWindows[model] || 32000
  }
}

/**
 * Factory function to create Mistral provider from database config
 */
export function createMistralProvider(dbProvider: any): MistralProvider {
  const config: ProviderConfig = {
    name: dbProvider.name,
    displayName: dbProvider.displayName,
    baseUrl: dbProvider.baseUrl,
    apiKey: process.env.MISTRAL_API_KEY,
    isActive: dbProvider.isActive,
    timeout: dbProvider.config.timeout || 60000,
    retries: 3,
    supportedModels: dbProvider.config.supportedModels,
    pricing: dbProvider.pricing,
  }

  return new MistralProvider(config)
}


