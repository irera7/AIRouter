/**
 * Mock Provider Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { MockProvider } from '../MockProvider';
import { ProviderConfig } from '../types';

describe('MockProvider', () => {
  let provider: MockProvider;

  const mockConfig: ProviderConfig = {
    name: 'mock',
    displayName: 'Mock Provider',
    baseUrl: 'http://localhost:3001',
    isActive: true,
    timeout: 5000,
    retries: 1,
    supportedModels: ['mock-gpt-4', 'mock-claude-3'],
    pricing: {
      inputTokenPrice: 0,
      outputTokenPrice: 0,
      currency: 'USD',
    },
  };

  beforeAll(async () => {
    provider = new MockProvider(mockConfig, { simulateLatency: 50 });
    await provider.initialize();
  });

  it('should initialize successfully', async () => {
    const health = await provider.healthCheck();
    expect(health.isHealthy).toBe(true);
  });

  it('should support configured models', () => {
    expect(provider.supportsModel('mock-gpt-4')).toBe(true);
    expect(provider.supportsModel('mock-claude-3')).toBe(true);
    expect(provider.supportsModel('unsupported-model')).toBe(false);
  });

  it('should complete a chat request', async () => {
    const request = {
      model: 'mock-gpt-4',
      messages: [
        { role: 'user' as const, content: 'Hello!' },
      ],
    };

    const response = await provider.chatCompletion(request);

    expect(response).toBeDefined();
    expect(response.model).toBe('mock-gpt-4');
    expect(response.choices).toHaveLength(1);
    expect(response.choices[0].message.role).toBe('assistant');
    expect(response.choices[0].message.content).toBeTruthy();
    expect(response.usage.totalTokens).toBeGreaterThan(0);
  });

  it('should calculate cost correctly', () => {
    const cost = provider.calculateCost(1000, 500);
    expect(cost).toBe(0); // Mock provider has 0 pricing
  });

  it('should record metrics', async () => {
    const request = {
      model: 'mock-gpt-4',
      messages: [{ role: 'user' as const, content: 'Test' }],
    };

    await provider.chatCompletion(request);

    const metrics = provider.getMetrics();
    expect(metrics.totalRequests).toBeGreaterThan(0);
    expect(metrics.successfulRequests).toBeGreaterThan(0);
    expect(metrics.averageLatency).toBeGreaterThan(0);
  });

  it('should handle failures when configured', async () => {
    const failingProvider = new MockProvider(mockConfig, { shouldFail: true });
    await failingProvider.initialize();

    const request = {
      model: 'mock-gpt-4',
      messages: [{ role: 'user' as const, content: 'Test' }],
    };

    await expect(failingProvider.chatCompletion(request)).rejects.toThrow();
  });
});

