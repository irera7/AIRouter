/**
 * Base Provider Class
 * Abstract base class that provides common functionality for all providers
 */

import {
  IProvider,
  ProviderConfig,
  ProviderMetrics,
  ProviderHealth,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ProviderError,
  ProviderTimeoutError,
} from './types';
import { logger } from '../../utils/logger';

export abstract class BaseProvider implements IProvider {
  public readonly name: string;
  public readonly config: ProviderConfig;
  
  protected metrics: ProviderMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageLatency: 0,
  };

  private latencies: number[] = [];

  constructor(config: ProviderConfig) {
    this.name = config.name;
    this.config = config;
  }

  abstract initialize(): Promise<void>;
  
  abstract chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
  
  abstract healthCheck(): Promise<ProviderHealth>;

  /**
   * Calculate cost based on token usage
   */
  calculateCost(inputTokens: number, outputTokens: number): number {
    const inputCost = (inputTokens / 1_000_000) * (this.config.pricing.inputTokenPrice || 0);
    const outputCost = (outputTokens / 1_000_000) * (this.config.pricing.outputTokenPrice || 0);
    const totalCostInDollars = inputCost + outputCost;
    
    // Convert to cents (multiply by 100) and round to 2 decimal places (0.01 cents precision)
    // This allows us to track costs as small as $0.0001
    const totalCostInCents = Math.round(totalCostInDollars * 100 * 100) / 100;
    
    // Ensure we return a valid number (default to 0 if NaN)
    return isNaN(totalCostInCents) ? 0 : totalCostInCents;
  }

  /**
   * Check if model is supported
   */
  supportsModel(model: string): boolean {
    return this.config.supportedModels.includes(model);
  }

  /**
   * Get current metrics
   */
  getMetrics(): ProviderMetrics {
    return { ...this.metrics };
  }

  /**
   * Record a successful request
   */
  protected recordSuccess(latency: number): void {
    this.metrics.totalRequests++;
    this.metrics.successfulRequests++;
    this.updateAverageLatency(latency);
  }

  /**
   * Record a failed request
   */
  protected recordFailure(error: Error): void {
    this.metrics.totalRequests++;
    this.metrics.failedRequests++;
    this.metrics.lastError = error.message;
    this.metrics.lastErrorTime = new Date();
    
    logger.error({
      provider: this.name,
      error: error.message,
      stack: error.stack,
    }, `Provider ${this.name} request failed`);
  }

  /**
   * Update average latency
   */
  private updateAverageLatency(latency: number): void {
    this.latencies.push(latency);
    
    // Keep only last 100 latencies
    if (this.latencies.length > 100) {
      this.latencies.shift();
    }
    
    this.metrics.averageLatency = 
      this.latencies.reduce((sum, l) => sum + l, 0) / this.latencies.length;
  }

  /**
   * Make HTTP request with timeout and retry logic
   */
  protected async makeRequest<T>(
    url: string,
    options: RequestInit,
    retries: number = this.config.retries
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new ProviderError(
          `HTTP ${response.status}: ${errorText}`,
          this.name,
          response.status
        );
      }

      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeout);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ProviderTimeoutError(this.name, this.config.timeout);
      }

      // Retry logic
      if (retries > 0 && this.shouldRetry(error)) {
        logger.warn({
          provider: this.name,
          retriesLeft: retries - 1,
          error: error instanceof Error ? error.message : 'Unknown error',
        }, `Retrying request to ${this.name}`);
        
        await this.delay(1000 * (this.config.retries - retries + 1)); // Exponential backoff
        return this.makeRequest<T>(url, options, retries - 1);
      }

      throw error;
    }
  }

  /**
   * Determine if error should trigger a retry
   */
  private shouldRetry(error: unknown): boolean {
    if (error instanceof ProviderError) {
      // Retry on 5xx errors and rate limits
      return (error.statusCode && error.statusCode >= 500) || error.statusCode === 429;
    }
    return false;
  }

  /**
   * Delay utility for retries
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Validate request before sending
   */
  protected validateRequest(request: ChatCompletionRequest): void {
    if (!request.model) {
      throw new ProviderError('Model is required', this.name);
    }

    if (!this.supportsModel(request.model)) {
      throw new ProviderError(
        `Model ${request.model} is not supported by ${this.name}`,
        this.name
      );
    }

    if (!request.messages || request.messages.length === 0) {
      throw new ProviderError('Messages are required', this.name);
    }
  }

  /**
   * Log request details
   */
  protected logRequest(request: ChatCompletionRequest): void {
    logger.info({
      provider: this.name,
      model: request.model,
      messageCount: request.messages.length,
      temperature: request.temperature,
    }, `Sending request to ${this.name}`);
  }

  /**
   * Log response details
   */
  protected logResponse(response: ChatCompletionResponse, latency: number): void {
    logger.info({
      provider: this.name,
      model: response.model,
      usage: response.usage,
      latency,
      cached: response.cached,
    }, `Received response from ${this.name}`);
  }
}

