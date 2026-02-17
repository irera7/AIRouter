/**
 * Provider Manager
 * Centralized management of all LLM providers
 */

import { IProvider } from './types';
import { OpenAIProvider, createOpenAIProvider } from './OpenAIProvider';
import { AnthropicProvider, createAnthropicProvider } from './AnthropicProvider';
import { MistralProvider, createMistralProvider } from './MistralProvider';
import { GeminiProvider, createGeminiProvider } from './GeminiProvider';
import { MockProvider, createMockProvider } from './MockProvider';
import { db } from '../../db/index';
import { providers } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../utils/logger';

export class ProviderManager {
  private providers: Map<string, IProvider> = new Map();
  private initialized = false;

  /**
   * Initialize all providers from database
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      logger.warn('ProviderManager already initialized');
      return;
    }

    logger.info('Initializing ProviderManager...');

    try {
      // Load providers from database
      const dbProviders = await db.select().from(providers).where(eq(providers.isActive, true));

      logger.info(`Found ${dbProviders.length} active providers in database`);

      // Initialize each provider
      for (const dbProvider of dbProviders) {
        try {
          const provider = await this.createProvider(dbProvider);
          await provider.initialize();
          this.providers.set(provider.name, provider);
          logger.info(`Initialized provider: ${provider.name}`);
        } catch (error) {
          logger.error({
            provider: dbProvider.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          }, `Failed to initialize provider: ${dbProvider.name}`);
        }
      }

      this.initialized = true;
      logger.info(`ProviderManager initialized with ${this.providers.size} providers`);
    } catch (error) {
      logger.error({ error }, 'Failed to initialize ProviderManager');
      throw error;
    }
  }

  /**
   * Create a provider instance based on database config
   */
  private async createProvider(dbProvider: any): Promise<IProvider> {
    switch (dbProvider.name) {
      case 'openai':
        return createOpenAIProvider(dbProvider);
      
      case 'anthropic':
        return createAnthropicProvider(dbProvider);
      
      case 'mistral':
        return createMistralProvider(dbProvider);
      
      case 'gemini':
        return createGeminiProvider(dbProvider);
      
      case 'mock':
        return createMockProvider(dbProvider);
      
      default:
        throw new Error(`Unknown provider type: ${dbProvider.name}`);
    }
  }

  /**
   * Get a provider by name
   */
  getProvider(name: string): IProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Get all providers
   */
  getAllProviders(): IProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get active providers that support a specific model
   */
  getProvidersForModel(model: string): IProvider[] {
    return this.getAllProviders().filter(provider => 
      provider.config.isActive && provider.supportsModel(model)
    );
  }

  /**
   * Reload providers from database
   */
  async reload(): Promise<void> {
    logger.info('Reloading providers...');
    this.providers.clear();
    this.initialized = false;
    await this.initialize();
  }

  /**
   * Get provider statistics
   */
  getStatistics(): {
    totalProviders: number;
    activeProviders: number;
    providers: Array<{
      name: string;
      displayName: string;
      isActive: boolean;
      supportedModels: string[];
      metrics: any;
      health?: any;
    }>;
  } {
    const allProviders = this.getAllProviders();

    return {
      totalProviders: allProviders.length,
      activeProviders: allProviders.filter(p => p.config.isActive).length,
      providers: allProviders.map(p => ({
        name: p.name,
        displayName: p.config.displayName,
        isActive: p.config.isActive,
        supportedModels: p.config.supportedModels,
        metrics: p.getMetrics(),
      })),
    };
  }

  /**
   * Health check for all providers
   */
  async healthCheckAll(): Promise<Map<string, any>> {
    const results = new Map();

    for (const [name, provider] of this.providers) {
      try {
        const health = await provider.healthCheck();
        results.set(name, health);
      } catch (error) {
        results.set(name, {
          isHealthy: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}

// Singleton instance
export const providerManager = new ProviderManager();

