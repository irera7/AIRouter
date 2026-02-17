/**
 * Intent-Based Routing Engine
 * Routes requests based on user intent rather than specific model names
 */

import { IProvider, ChatCompletionRequest } from '../providers/types'
import { RoutingConfig, RoutingDecision, RoutingStrategy } from './types'
import { logger } from '../../utils/logger'
import { 
  getModelsForIntent, 
  isValidIntent, 
  ModelOption 
} from './IntentRegistry'

export interface IntentRoutingContext {
  estimatedInputTokens?: number
  estimatedOutputTokens?: number
  preferredProvider?: string
}

export class IntentRouter {
  private providers: Map<string, IProvider> = new Map()

  /**
   * Register a provider
   */
  registerProvider(provider: IProvider): void {
    this.providers.set(provider.name, provider)
    logger.info(`Intent Router: Registered provider ${provider.name}`)
  }

  /**
   * Unregister a provider
   */
  unregisterProvider(providerName: string): void {
    this.providers.delete(providerName)
    logger.info(`Intent Router: Unregistered provider ${providerName}`)
  }

  /**
   * Route by intent instead of model name
   */
  async routeByIntent(
    intent: string,
    request: ChatCompletionRequest,
    config: RoutingConfig
  ): Promise<RoutingDecision & { selectedModel: string }> {
    
    // Validate intent
    if (!isValidIntent(intent)) {
      throw new Error(`Unknown intent: ${intent}. Use one of: chat-premium, chat-standard, chat-fast, chat-budget, code-generation, etc.`)
    }

    // Get available models for this intent
    const availableModels = getModelsForIntent(intent)
    
    if (!availableModels || availableModels.length === 0) {
      throw new Error(`No models available for intent: ${intent}`)
    }

    // Filter to only active providers
    const activeModels = availableModels.filter(model => {
      const provider = this.providers.get(model.provider)
      return provider && provider.config.isActive
    })

    if (activeModels.length === 0) {
      throw new Error(`No active providers available for intent: ${intent}`)
    }

    logger.info({
      intent,
      strategy: config.strategy,
      availableModels: activeModels.length
    }, 'Routing by intent')

    // Prepare context for routing
    const context: IntentRoutingContext = {
      estimatedInputTokens: this.estimateInputTokens(request.messages),
      estimatedOutputTokens: request.maxTokens || 1000,
      preferredProvider: config.preferredProvider
    }

    // Select model based on strategy
    let selectedModel: ModelOption
    let reason: string

    switch (config.strategy) {
      case 'cost':
        ({ model: selectedModel, reason } = this.selectByCost(activeModels, context))
        break

      case 'latency':
        ({ model: selectedModel, reason } = this.selectByLatency(activeModels))
        break

      case 'priority':
        ({ model: selectedModel, reason } = this.selectByPriority(activeModels, context.preferredProvider))
        break

      case 'fallback':
        ({ model: selectedModel, reason } = await this.selectByFallback(activeModels))
        break

      default:
        throw new Error(`Unknown routing strategy: ${config.strategy}`)
    }

    // Get provider instance
    const provider = this.providers.get(selectedModel.provider)
    if (!provider) {
      throw new Error(`Provider ${selectedModel.provider} not found`)
    }

    // Get alternatives
    const alternatives = activeModels
      .filter(m => m.provider !== selectedModel.provider || m.model !== selectedModel.model)
      .map(m => `${m.provider}:${m.model}`)

    logger.info({
      intent,
      selected: `${selectedModel.provider}:${selectedModel.model}`,
      reason,
      alternatives: alternatives.length
    }, 'Intent routing decision')

    return {
      provider,
      selectedModel: selectedModel.model,
      strategy: config.strategy,
      reason,
      alternatives
    }
  }

  /**
   * Select by cost - Choose cheapest option
   */
  private selectByCost(
    models: ModelOption[],
    context: IntentRoutingContext
  ): { model: ModelOption; reason: string } {
    const inputTokens = context.estimatedInputTokens || 1000
    const outputTokens = context.estimatedOutputTokens || 1000

    // Calculate cost for each model
    const costs = models.map(model => {
      const inputCost = (inputTokens / 1_000_000) * model.pricing.input
      const outputCost = (outputTokens / 1_000_000) * model.pricing.output
      const totalCost = inputCost + outputCost

      return { model, totalCost }
    })

    // Sort by cost (ascending) and select cheapest
    costs.sort((a, b) => a.totalCost - b.totalCost)
    const selected = costs[0]

    const reason = `Lowest cost: $${selected.totalCost.toFixed(6)} (${selected.model.provider}:${selected.model.model}) - Est. ${inputTokens} input + ${outputTokens} output tokens`

    return { model: selected.model, reason }
  }

  /**
   * Select by latency - Choose fastest option
   */
  private selectByLatency(
    models: ModelOption[]
  ): { model: ModelOption; reason: string } {
    // Sort by latency (ascending) and select fastest
    const sorted = [...models].sort((a, b) => 
      a.performance.avgLatency - b.performance.avgLatency
    )
    const selected = sorted[0]

    const reason = `Lowest latency: ${selected.performance.avgLatency}ms avg (${selected.provider}:${selected.model})`

    return { model: selected, reason }
  }

  /**
   * Select by priority - Use preferred provider if available
   */
  private selectByPriority(
    models: ModelOption[],
    preferredProvider?: string
  ): { model: ModelOption; reason: string } {
    if (preferredProvider) {
      const preferred = models.find(m => m.provider === preferredProvider)
      if (preferred) {
        return {
          model: preferred,
          reason: `Preferred provider: ${preferredProvider} (${preferred.model})`
        }
      }
    }

    // No preference or preferred not available, use first (or highest quality)
    const sorted = [...models].sort((a, b) => 
      b.performance.quality - a.performance.quality
    )
    const selected = sorted[0]

    return {
      model: selected,
      reason: `Best quality available: ${selected.performance.quality}/10 (${selected.provider}:${selected.model})`
    }
  }

  /**
   * Select by fallback - Try each provider in quality order until one is healthy
   */
  private async selectByFallback(
    models: ModelOption[]
  ): Promise<{ model: ModelOption; reason: string }> {
    // Sort by quality (descending) to try best first
    const sorted = [...models].sort((a, b) => 
      b.performance.quality - a.performance.quality
    )

    // Try each provider in order
    for (const model of sorted) {
      const provider = this.providers.get(model.provider)
      if (!provider) continue

      try {
        const health = await provider.healthCheck()
        if (health.isHealthy) {
          return {
            model,
            reason: `First healthy provider: ${model.provider} (${model.model}) - latency ${health.latency}ms`
          }
        }
      } catch (error) {
        logger.warn({ provider: model.provider, error }, 'Health check failed')
        continue
      }
    }

    // All failed health check, use first as last resort
    const fallback = sorted[0]
    return {
      model: fallback,
      reason: `All providers failed health check, using fallback: ${fallback.provider} (${fallback.model})`
    }
  }

  /**
   * Estimate input tokens from messages
   */
  private estimateInputTokens(messages: Array<{ role: string; content: string }>): number {
    const totalChars = messages.map(m => m.content).join('').length
    // Rough estimate: 4 characters ≈ 1 token
    return Math.ceil(totalChars / 4)
  }

  /**
   * Get provider statistics
   */
  getStatistics() {
    const allProviders = Array.from(this.providers.values())
    
    return {
      totalProviders: allProviders.length,
      activeProviders: allProviders.filter(p => p.config.isActive).length,
      providers: allProviders.map(p => ({
        name: p.name,
        isActive: p.config.isActive,
        metrics: p.getMetrics()
      }))
    }
  }
}

