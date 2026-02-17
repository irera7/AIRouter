/**
 * Mock Provider Implementation
 * Simulates an LLM provider for testing purposes
 */

import { BaseProvider } from './BaseProvider';
import {
  ProviderConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ProviderHealth,
} from './types';
import { logger } from '../../utils/logger';
import { nanoid } from 'nanoid';

export class MockProvider extends BaseProvider {
  private simulateLatency: number;
  private shouldFail: boolean;
  
  constructor(config: ProviderConfig, options: { simulateLatency?: number; shouldFail?: boolean } = {}) {
    super(config);
    this.simulateLatency = options.simulateLatency || 100;
    this.shouldFail = options.shouldFail || false;
  }

  async initialize(): Promise<void> {
    logger.info(`Initializing Mock provider...`);
    await this.delay(50); // Simulate initialization time
    logger.info(`Mock provider initialized successfully`);
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    this.validateRequest(request);
    this.logRequest(request);

    const startTime = Date.now();

    // Simulate network latency
    await this.delay(this.simulateLatency);

    if (this.shouldFail) {
      const error = new Error('Mock provider simulated failure');
      this.recordFailure(error);
      throw error;
    }

    // Generate mock response
    const promptTokens = this.estimateTokens(
      request.messages.map(m => m.content).join(' ')
    );
    const completionTokens = Math.floor(Math.random() * 100) + 50;

    const response: ChatCompletionResponse = {
      id: `mock-${nanoid(10)}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: request.model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: this.generateMockResponse(request),
        },
        finishReason: 'stop',
      }],
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      provider: this.name,
    };

    const latency = Date.now() - startTime;
    this.recordSuccess(latency);
    this.logResponse(response, latency);

    return response;
  }

  async healthCheck(): Promise<ProviderHealth> {
    await this.delay(10);
    
    return {
      isHealthy: !this.shouldFail,
      latency: 10,
      error: this.shouldFail ? 'Mock provider is configured to fail' : undefined,
    };
  }

  /**
   * Generate a mock response based on the request
   */
  private generateMockResponse(request: ChatCompletionRequest): string {
    const lastMessage = request.messages[request.messages.length - 1];
    const userContent = lastMessage.content.toLowerCase();

    // Simple pattern matching for more realistic responses
    if (userContent.includes('hello') || userContent.includes('hi')) {
      return 'Hello! I am a mock AI assistant. How can I help you today?';
    }
    
    if (userContent.includes('what') || userContent.includes('?')) {
      return `This is a mock response to your question. In a real scenario, an actual LLM would provide a meaningful answer based on the context: "${lastMessage.content}"`;
    }

    if (userContent.includes('code') || userContent.includes('program')) {
      return '```javascript\n// This is mock code\nfunction example() {\n  return "Mock response";\n}\n```';
    }

    return `Mock AI response generated for model: ${request.model}. This simulates a real LLM provider response. Your message was: "${lastMessage.content}"`;
  }

  /**
   * Simple token estimation (roughly 4 characters = 1 token)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Set whether the mock should fail
   */
  public setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  /**
   * Set simulated latency
   */
  public setLatency(latency: number): void {
    this.simulateLatency = latency;
  }
}

/**
 * Factory function to create Mock provider from database config
 */
export function createMockProvider(
  dbProvider: any,
  options?: { simulateLatency?: number; shouldFail?: boolean }
): MockProvider {
  const config: ProviderConfig = {
    name: dbProvider.name,
    displayName: dbProvider.displayName,
    baseUrl: dbProvider.baseUrl,
    isActive: dbProvider.isActive,
    timeout: dbProvider.config.timeout || 5000,
    retries: 1,
    supportedModels: dbProvider.config.supportedModels,
    pricing: dbProvider.pricing,
  };

  return new MockProvider(config, options);
}

