/**
 * OpenAI Provider Implementation
 * Handles communication with OpenAI's API
 */

import { BaseProvider } from './BaseProvider';
import {
  ProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ProviderHealth,
  ProviderError,
} from './types';
import { logger } from '../../utils/logger';

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIProvider extends BaseProvider {
  private apiKey: string;

  constructor(config: ProviderConfig) {
    super(config);
    
    if (!config.apiKey) {
      throw new ProviderError('OpenAI API key is required', this.name);
    }
    
    this.apiKey = config.apiKey;
  }

  async initialize(): Promise<void> {
    logger.info(`Initializing OpenAI provider...`);
    
    // Validate API key by making a test request
    try {
      await this.healthCheck();
      logger.info(`OpenAI provider initialized successfully`);
    } catch (error) {
      logger.error({ error }, `Failed to initialize OpenAI provider`);
      throw new ProviderError(
        'Failed to initialize OpenAI provider',
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
      // Check if this is an o1 or o3 model (they use different parameters)
      const isO1OrO3Model = /^(o1|o3)/.test(request.model);

      logger.info({
        model: request.model,
        isO1OrO3Model,
        provider: this.name,
      }, 'Preparing OpenAI request');

      // Transform our request format to OpenAI format
      const openAIRequest: any = {
        model: request.model,
        messages: request.messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        temperature: request.temperature,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty,
        stop: request.stop,
        stream: request.stream || false,
        user: request.user,
      };

      // o1/o3 models use max_completion_tokens instead of max_tokens
      if (isO1OrO3Model) {
        openAIRequest.max_completion_tokens = request.maxTokens;
        logger.info('Using max_completion_tokens for o1/o3 model');
      } else {
        openAIRequest.max_tokens = request.maxTokens;
        logger.info('Using max_tokens for regular model');
      }

      const response = await this.makeRequest<OpenAIResponse>(
        `${this.config.baseUrl}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(openAIRequest),
        }
      );

      const latency = Date.now() - startTime;
      
      // Transform OpenAI response to our format
      const chatResponse: ChatCompletionResponse = {
        id: response.id,
        object: response.object,
        created: response.created,
        model: response.model,
        choices: response.choices.map(choice => ({
          index: choice.index,
          message: {
            role: choice.message.role as 'system' | 'user' | 'assistant',
            content: choice.message.content,
          },
          finishReason: choice.finish_reason,
        })),
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
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
      await this.makeRequest<{ data: Array<{ id: string }> }>(
        `${this.config.baseUrl}/models`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
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
}

/**
 * Factory function to create OpenAI provider from database config
 */
export function createOpenAIProvider(dbProvider: any): OpenAIProvider {
  const config: ProviderConfig = {
    name: dbProvider.name,
    displayName: dbProvider.displayName,
    baseUrl: dbProvider.baseUrl,
    apiKey: process.env.OPENAI_API_KEY,
    isActive: dbProvider.isActive,
    timeout: dbProvider.config.timeout || 60000,
    retries: 3,
    supportedModels: dbProvider.config.supportedModels,
    pricing: dbProvider.pricing,
  };

  return new OpenAIProvider(config);
}

