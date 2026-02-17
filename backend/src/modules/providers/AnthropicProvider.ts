/**
 * Anthropic Provider Implementation
 * Handles communication with Anthropic's Claude API
 */

import { BaseProvider } from './BaseProvider';
import {
  ProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ProviderHealth,
  ProviderError,
  Message,
} from './types';
import { logger } from '../../utils/logger';

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AnthropicRequest {
  model: string;
  messages: AnthropicMessage[];
  max_tokens: number;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  system?: string;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AnthropicProvider extends BaseProvider {
  private apiKey: string;
  private readonly apiVersion = '2023-06-01';

  constructor(config: ProviderConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new ProviderError('Anthropic API key is required', this.name);
    }
    
    this.apiKey = config.apiKey;
  }

  async initialize(): Promise<void> {
    logger.info(`Initializing Anthropic provider...`);
    
    // Validate API key by making a health check
    try {
      const health = await this.healthCheck();
      if (!health.isHealthy) {
        throw new Error(health.error || 'Health check failed');
      }
      logger.info(`Anthropic provider initialized successfully`);
    } catch (error) {
      logger.error({ error }, `Failed to initialize Anthropic provider`);
      throw new ProviderError(
        'Failed to initialize Anthropic provider',
        this.name,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    this.validateRequest(request);
    this.logRequest(request);

    const startTime = Date.now();

    try {
      // Extract system message if present
      const systemMessage = request.messages.find(m => m.role === 'system');
      const userMessages = request.messages.filter(m => m.role !== 'system');

      // Transform to Anthropic format
      const anthropicRequest: AnthropicRequest = {
        model: request.model,
        messages: userMessages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        max_tokens: request.maxTokens || 4096, // Anthropic requires max_tokens
        temperature: request.temperature,
        top_p: request.topP,
        stop_sequences: request.stop,
        system: systemMessage?.content,
      };

      const response = await this.makeRequest<AnthropicResponse>(
        `${this.config.baseUrl}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion,
          },
          body: JSON.stringify(anthropicRequest),
        }
      );

      const latency = Date.now() - startTime;
      
      // Transform Anthropic response to our format
      const chatResponse: ChatCompletionResponse = {
        id: response.id,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: response.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: response.content[0]?.text || '',
          },
          finishReason: response.stop_reason,
        }],
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
        provider: this.name,
      };

      this.recordSuccess(latency);
      this.logResponse(chatResponse, latency);

      return chatResponse;
    } catch (error) {
      this.recordFailure(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }

  async healthCheck(): Promise<ProviderHealth> {
    const startTime = Date.now();

    try {
      // Make a minimal request to check if the service is available
      const testRequest: AnthropicRequest = {
        model: this.config.supportedModels[0] || 'claude-3-haiku-20240307',
        messages: [{
          role: 'user',
          content: 'Hi',
        }],
        max_tokens: 10,
      };

      await this.makeRequest<AnthropicResponse>(
        `${this.config.baseUrl}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': this.apiVersion,
          },
          body: JSON.stringify(testRequest),
        }
      );

      const latency = Date.now() - startTime;

      return {
        isHealthy: true,
        latency,
      };
    } catch (error) {
      return {
        isHealthy: false,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Override validateRequest to add Anthropic-specific validation
   */
  protected validateRequest(request: ChatCompletionRequest): void {
    super.validateRequest(request);

    // Anthropic requires max_tokens
    if (!request.maxTokens) {
      throw new ProviderError(
        'maxTokens is required for Anthropic',
        this.name
      );
    }

    // Check for system message placement (should be first if present)
    const systemIndex = request.messages.findIndex(m => m.role === 'system');
    if (systemIndex > 0) {
      throw new ProviderError(
        'System message must be first in Anthropic requests',
        this.name
      );
    }
  }
}

/**
 * Factory function to create Anthropic provider from database config
 */
export function createAnthropicProvider(dbProvider: any): AnthropicProvider {
  const config: ProviderConfig = {
    name: dbProvider.name,
    displayName: dbProvider.displayName,
    baseUrl: dbProvider.baseUrl,
    apiKey: process.env.ANTHROPIC_API_KEY,
    isActive: dbProvider.isActive,
    timeout: dbProvider.config.timeout || 60000,
    retries: 3,
    supportedModels: dbProvider.config.supportedModels,
    pricing: dbProvider.pricing,
  };

  return new AnthropicProvider(config);
}

