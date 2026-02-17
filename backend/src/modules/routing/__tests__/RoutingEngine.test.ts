/**
 * Routing Engine Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { RoutingEngine } from '../RoutingEngine';
import { MockProvider } from '../../providers/MockProvider';
import { ProviderConfig } from '../../providers/types';

describe('RoutingEngine', () => {
  let engine: RoutingEngine;
  let provider1: MockProvider;
  let provider2: MockProvider;

  const config1: ProviderConfig = {
    name: 'mock-1',
    displayName: 'Mock Provider 1',
    baseUrl: 'http://localhost:3001',
    isActive: true,
    timeout: 5000,
    retries: 1,
    supportedModels: ['mock-gpt-4'],
    pricing: {
      inputTokenPrice: 10,
      outputTokenPrice: 30,
      currency: 'USD',
    },
  };

  const config2: ProviderConfig = {
    name: 'mock-2',
    displayName: 'Mock Provider 2',
    baseUrl: 'http://localhost:3002',
    isActive: true,
    timeout: 5000,
    retries: 1,
    supportedModels: ['mock-gpt-4'],
    pricing: {
      inputTokenPrice: 20,
      outputTokenPrice: 40,
      currency: 'USD',
    },
  };

  beforeAll(async () => {
    engine = new RoutingEngine();

    provider1 = new MockProvider(config1, { simulateLatency: 50 });
    provider2 = new MockProvider(config2, { simulateLatency: 100 });

    await provider1.initialize();
    await provider2.initialize();

    engine.registerProvider(provider1);
    engine.registerProvider(provider2);
  });

  it('should register providers', () => {
    const providers = engine.getProviders();
    expect(providers).toHaveLength(2);
  });

  it('should route by cost (select cheapest)', async () => {
    const request = {
      model: 'mock-gpt-4',
      messages: [{ role: 'user' as const, content: 'Hello' }],
    };

    const decision = await engine.route(request, { strategy: 'cost' });

    expect(decision.provider.name).toBe('mock-1'); // Cheaper provider
    expect(decision.strategy).toBe('cost');
    expect(decision.reason).toContain('Lowest cost');
  });

  it('should route by latency (select fastest)', async () => {
    // Make some requests to establish latency metrics
    const request = {
      model: 'mock-gpt-4',
      messages: [{ role: 'user' as const, content: 'Test' }],
    };

    await provider1.chatCompletion(request);
    await provider2.chatCompletion(request);

    const decision = await engine.route(request, { strategy: 'latency' });

    expect(decision.provider.name).toBe('mock-1'); // Faster provider (50ms vs 100ms)
    expect(decision.strategy).toBe('latency');
  });

  it('should route by priority', async () => {
    const request = {
      model: 'mock-gpt-4',
      messages: [{ role: 'user' as const, content: 'Test' }],
    };

    const decision = await engine.route(request, {
      strategy: 'priority',
      preferredProvider: 'mock-2',
    });

    expect(decision.provider.name).toBe('mock-2');
    expect(decision.strategy).toBe('priority');
  });

  it('should route by fallback order', async () => {
    const request = {
      model: 'mock-gpt-4',
      messages: [{ role: 'user' as const, content: 'Test' }],
    };

    const decision = await engine.route(request, {
      strategy: 'fallback',
      fallbackProviders: ['mock-2', 'mock-1'],
    });

    expect(decision.provider.name).toBe('mock-2'); // First in fallback order
    expect(decision.strategy).toBe('fallback');
  });

  it('should execute with automatic fallback on failure', async () => {
    // Create a failing provider
    const failingProvider = new MockProvider(config1, { shouldFail: true });
    await failingProvider.initialize();

    const newEngine = new RoutingEngine();
    newEngine.registerProvider(failingProvider);
    newEngine.registerProvider(provider2); // Working provider

    const request = {
      model: 'mock-gpt-4',
      messages: [{ role: 'user' as const, content: 'Test' }],
    };

    const result = await newEngine.executeWithFallback(request, { strategy: 'fallback' });

    expect(result.provider).toBe('mock-2'); // Fallback to working provider
    expect(result.attempts).toHaveLength(2); // Tried both providers
    expect(result.attempts[0].error).toBeDefined(); // First attempt failed
    expect(result.attempts[1].error).toBeUndefined(); // Second attempt succeeded
  });

  it('should get routing statistics', () => {
    const stats = engine.getStatistics();

    expect(stats.totalProviders).toBe(2);
    expect(stats.activeProviders).toBe(2);
    expect(stats.providers).toHaveLength(2);
  });
});

