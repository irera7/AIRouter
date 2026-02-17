/**
 * Provider Types and Interfaces
 * Defines the contract for all LLM providers
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  stream?: boolean;
  user?: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: Message;
    finishReason: string;
  }>;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  provider: string;
  cached?: boolean;
  cost?: number;  // Cost in cents (calculated by backend)
}

export interface ProviderConfig {
  name: string;
  displayName: string;
  baseUrl: string;
  apiKey?: string;
  isActive: boolean;
  timeout: number;
  retries: number;
  supportedModels: string[];
  pricing: {
    inputTokenPrice: number; // Price per 1M tokens in cents
    outputTokenPrice: number;
    currency: string;
  };
}

export interface ProviderMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageLatency: number;
  lastError?: string;
  lastErrorTime?: Date;
}

export interface ProviderHealth {
  isHealthy: boolean;
  latency: number;
  error?: string;
}

/**
 * Base interface that all providers must implement
 */
export interface IProvider {
  readonly name: string;
  readonly config: ProviderConfig;
  
  /**
   * Initialize the provider (setup clients, validate config, etc.)
   */
  initialize(): Promise<void>;
  
  /**
   * Send a chat completion request
   */
  chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  
  /**
   * Health check for the provider
   */
  healthCheck(): Promise<ProviderHealth>;
  
  /**
   * Calculate cost for a request
   */
  calculateCost(inputTokens: number, outputTokens: number): number;
  
  /**
   * Get current metrics
   */
  getMetrics(): ProviderMetrics;
  
  /**
   * Check if a model is supported
   */
  supportsModel(model: string): boolean;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public provider: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class ProviderTimeoutError extends ProviderError {
  constructor(provider: string, timeout: number) {
    super(`Provider ${provider} timed out after ${timeout}ms`, provider);
    this.name = 'ProviderTimeoutError';
  }
}

export class ProviderRateLimitError extends ProviderError {
  constructor(provider: string, retryAfter?: number) {
    super(`Provider ${provider} rate limit exceeded`, provider, 429);
    this.name = 'ProviderRateLimitError';
  }
}

