/**
 * Routing Engine
 * Intelligently routes requests to the best available provider
 */

import { IProvider, ChatCompletionRequest, ProviderError } from '../providers/types';
import { RoutingConfig, RoutingDecision, RoutingStrategy, ProviderSelection } from './types';
import { logger } from '../../utils/logger';

export class RoutingEngine {
  private providers: Map<string, IProvider> = new Map();
  
  /**
   * Register a provider with the routing engine
   */
  registerProvider(provider: IProvider): void {
    this.providers.set(provider.name, provider);
    logger.info(`Registered provider: ${provider.name}`);
  }

  /**
   * Unregister a provider
   */
  unregisterProvider(providerName: string): void {
    this.providers.delete(providerName);
    logger.info(`Unregistered provider: ${providerName}`);
  }

  /**
   * Get all registered providers
   */
  getProviders(): IProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get a specific provider by name
   */
  getProvider(name: string): IProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Route a request to the best provider based on the routing configuration
   */
  async route(
    request: ChatCompletionRequest,
    config: RoutingConfig
  ): Promise<RoutingDecision> {
    const availableProviders = this.getAvailableProviders(request.model);

    if (availableProviders.length === 0) {
      throw new Error(`No providers available for model: ${request.model}`);
    }

    logger.info({
      strategy: config.strategy,
      model: request.model,
      availableProviders: availableProviders.map(p => p.name),
    }, 'Routing request');

    let selectedProvider: IProvider;
    let reason: string;

    switch (config.strategy) {
      case 'cost':
        ({ provider: selectedProvider, reason } = await this.selectByCost(
          availableProviders,
          request
        ));
        break;

      case 'latency':
        ({ provider: selectedProvider, reason } = await this.selectByLatency(
          availableProviders
        ));
        break;

      case 'priority':
        ({ provider: selectedProvider, reason } = await this.selectByPriority(
          availableProviders,
          config.preferredProvider
        ));
        break;

      case 'fallback':
        ({ provider: selectedProvider, reason } = await this.selectByFallback(
          availableProviders,
          config.fallbackProviders
        ));
        break;

      default:
        throw new Error(`Unknown routing strategy: ${config.strategy}`);
    }

    const alternatives = availableProviders
      .filter(p => p.name !== selectedProvider.name)
      .map(p => p.name);

    logger.info({
      selected: selectedProvider.name,
      reason,
      alternatives,
    }, 'Provider selected');

    return {
      provider: selectedProvider,
      strategy: config.strategy,
      reason,
      alternatives,
    };
  }

  /**
   * Get providers that support the requested model
   */
  private getAvailableProviders(model: string): IProvider[] {
    return this.getProviders().filter(provider => {
      return provider.config.isActive && provider.supportsModel(model);
    });
  }

  /**
   * Select provider based on cost (cheapest first)
   */
  private async selectByCost(
    providers: IProvider[],
    request: ChatCompletionRequest
  ): Promise<ProviderSelection> {
    // Estimate tokens (rough estimate: 4 chars = 1 token)
    const estimatedInputTokens = Math.ceil(
      request.messages.map(m => m.content).join('').length / 4
    );
    const estimatedOutputTokens = request.maxTokens || 1000;

    const providerCosts = providers.map(provider => {
      const cost = provider.calculateCost(estimatedInputTokens, estimatedOutputTokens);
      return { provider, cost };
    });

    // Sort by cost (ascending)
    providerCosts.sort((a, b) => a.cost - b.cost);

    const selected = providerCosts[0];
    
    return {
      provider: selected.provider,
      score: selected.cost,
      reason: `Lowest cost: $${(selected.cost / 100).toFixed(4)} (est. ${estimatedInputTokens} input + ${estimatedOutputTokens} output tokens)`,
    };
  }

  /**
   * Select provider based on latency (fastest first)
   */
  private async selectByLatency(providers: IProvider[]): Promise<ProviderSelection> {
    const providerLatencies = providers.map(provider => {
      const metrics = provider.getMetrics();
      return {
        provider,
        latency: metrics.averageLatency || Infinity,
      };
    });

    // Sort by latency (ascending)
    providerLatencies.sort((a, b) => a.latency - b.latency);

    const selected = providerLatencies[0];
    
    return {
      provider: selected.provider,
      score: selected.latency,
      reason: `Lowest average latency: ${selected.latency.toFixed(0)}ms`,
    };
  }

  /**
   * Select provider based on priority/preference
   */
  private async selectByPriority(
    providers: IProvider[],
    preferredProvider?: string
  ): Promise<ProviderSelection> {
    // If preferred provider is specified and available, use it
    if (preferredProvider) {
      const preferred = providers.find(p => p.name === preferredProvider);
      if (preferred) {
        return {
          provider: preferred,
          score: 1,
          reason: `Preferred provider: ${preferredProvider}`,
        };
      }
    }

    // Otherwise, use the first available provider
    const selected = providers[0];
    
    return {
      provider: selected,
      score: 1,
      reason: `First available provider: ${selected.name}`,
    };
  }

  /**
   * Select provider based on fallback order
   */
  private async selectByFallback(
    providers: IProvider[],
    fallbackOrder?: string[]
  ): Promise<ProviderSelection> {
    if (!fallbackOrder || fallbackOrder.length === 0) {
      // If no fallback order specified, use the first available
      const selected = providers[0];
      return {
        provider: selected,
        score: 1,
        reason: `No fallback order specified, using: ${selected.name}`,
      };
    }

    // Try each provider in the fallback order
    for (const providerName of fallbackOrder) {
      const provider = providers.find(p => p.name === providerName);
      if (provider) {
        // Check if provider is healthy
        const health = await provider.healthCheck();
        if (health.isHealthy) {
          return {
            provider,
            score: 1,
            reason: `Fallback provider (healthy): ${providerName}`,
          };
        }
      }
    }

    // If no provider in fallback order is available, use the first available
    const selected = providers[0];
    return {
      provider: selected,
      score: 1,
      reason: `All fallback providers unavailable, using: ${selected.name}`,
    };
  }

  /**
   * Execute request with automatic fallback on failure
   */
  async executeWithFallback(
    request: ChatCompletionRequest,
    config: RoutingConfig
  ): Promise<{
    response: any;
    provider: string;
    attempts: Array<{ provider: string; error?: string }>;
  }> {
    const availableProviders = this.getAvailableProviders(request.model);
    
    if (availableProviders.length === 0) {
      throw new Error(`No providers available for model: ${request.model}`);
    }

    const attempts: Array<{ provider: string; error?: string }> = [];
    let lastError: Error | null = null;

    // Try each provider
    for (const provider of availableProviders) {
      try {
        logger.info(`Attempting request with provider: ${provider.name}`);
        
        const response = await provider.chatCompletion(request);
        
        attempts.push({ provider: provider.name });
        
        return {
          response,
          provider: provider.name,
          attempts,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        attempts.push({
          provider: provider.name,
          error: lastError.message,
        });
        
        logger.warn({
          provider: provider.name,
          error: lastError.message,
        }, `Provider failed, trying next...`);
      }
    }

    // All providers failed
    throw new Error(
      `All providers failed. Last error: ${lastError?.message}. Attempts: ${JSON.stringify(attempts)}`
    );
  }

  /**
   * Get routing engine statistics
   */
  getStatistics(): {
    totalProviders: number;
    activeProviders: number;
    providers: Array<{
      name: string;
      isActive: boolean;
      metrics: any;
    }>;
  } {
    const providers = this.getProviders();
    
    return {
      totalProviders: providers.length,
      activeProviders: providers.filter(p => p.config.isActive).length,
      providers: providers.map(p => ({
        name: p.name,
        isActive: p.config.isActive,
        metrics: p.getMetrics(),
      })),
    };
  }
}

