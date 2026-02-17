/**
 * Chat Service
 * Business logic for chat completions with routing, caching, and billing
 */

import { providerManager } from '../providers/ProviderManager';
import { RoutingEngine } from '../routing/RoutingEngine';
import { IntentRouter } from '../routing/IntentRouter';
import { RoutingConfig, RoutingStrategy } from '../routing/types';
import { ChatCompletionRequest, ChatCompletionResponse } from '../providers/types';
import { cacheService } from '../../utils/cache';
import { requestLogger, RequestLogData } from '../../utils/requestLogger';
import { db } from '../../db/index';
import { orgs, providers as providersTable } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../../utils/logger';
import { isValidIntent } from '../routing/IntentRegistry';

export interface ChatRequestContext {
  apiKeyId: string;
  userId: string;
  orgId: string;
  routingStrategy?: RoutingStrategy;
  preferredProvider?: string;
  enableCache?: boolean;
  intent?: string;  // NEW: Intent-based routing
}

export class ChatService {
  private routingEngine: RoutingEngine;
  private intentRouter: IntentRouter;

  constructor() {
    this.routingEngine = new RoutingEngine();
    this.intentRouter = new IntentRouter();
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    logger.info('Initializing ChatService...');

    // Initialize providers
    await providerManager.initialize();

    // Register providers with routing engines
    const providers = providerManager.getAllProviders();
    for (const provider of providers) {
      this.routingEngine.registerProvider(provider);
      this.intentRouter.registerProvider(provider);  // Register with intent router too
    }

    logger.info(`ChatService initialized with ${providers.length} providers`);
  }

  /**
   * Process a chat completion request
   */
  async chatCompletion(
    request: ChatCompletionRequest,
    context: ChatRequestContext
  ): Promise<ChatCompletionResponse> {
    const startTime = Date.now();

    logger.info({
      model: request.model,
      intent: context.intent,
      orgId: context.orgId,
      messages: request.messages.length,
    }, 'Processing chat completion request');

    try {
      // Check if response is cached
      if (context.enableCache !== false) {
        const cached = await cacheService.getCachedResponse(request);
        if (cached) {
          logger.info('Returning cached response');
          cached.cached = true;
          
          // Still log the request (but with 0 cost)
          await this.logCachedRequest(context, request, cached, startTime);
          
          return cached;
        }
      }

      // Check organization credit balance
      await this.checkCreditBalance(context.orgId);

      // Route request - NEW: Support both intent-based and model-based routing
      let decision;
      let selectedModel: string;

      if (context.intent && isValidIntent(context.intent)) {
        // NEW: Intent-based routing
        logger.info({ intent: context.intent }, 'Using intent-based routing');
        
        const routingConfig: RoutingConfig = {
          strategy: context.routingStrategy || 'cost',
          preferredProvider: context.preferredProvider,
        };

        const intentDecision = await this.intentRouter.routeByIntent(
          context.intent,
          request,
          routingConfig
        );

        decision = {
          provider: intentDecision.provider,
          strategy: intentDecision.strategy,
          reason: intentDecision.reason,
          alternatives: intentDecision.alternatives,
        };
        
        selectedModel = intentDecision.selectedModel;
        
        logger.info({
          intent: context.intent,
          provider: decision.provider.name,
          model: selectedModel,
          strategy: decision.strategy,
          reason: decision.reason,
        }, 'Intent-based provider selected');
      } else {
        // OLD: Model-based routing (backward compatibility)
        logger.info({ model: request.model }, 'Using model-based routing');
        
        const routingConfig: RoutingConfig = {
          strategy: context.routingStrategy || 'cost',
          preferredProvider: context.preferredProvider,
        };

        decision = await this.routingEngine.route(request, routingConfig);
        selectedModel = request.model;

        logger.info({
          provider: decision.provider.name,
          model: selectedModel,
          strategy: decision.strategy,
          reason: decision.reason,
        }, 'Model-based provider selected');
      }

      // Make the request with the selected model
      const requestWithModel = {
        ...request,
        model: selectedModel,
      };
      
      const response = await decision.provider.chatCompletion(requestWithModel);
      
      const latency = Date.now() - startTime;

      // Calculate cost
      const cost = decision.provider.calculateCost(
        response.usage.promptTokens,
        response.usage.completionTokens
      );

      logger.info({
        provider: decision.provider.name,
        model: request.model,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        calculatedCost: cost,
        costType: typeof cost,
      }, 'Cost calculated successfully');

      // Get provider ID from database
      const [dbProvider] = await db
        .select()
        .from(providersTable)
        .where(eq(providersTable.name, decision.provider.name))
        .limit(1);

      // Log request
      await this.logRequest(context, request, response, dbProvider.id, latency, cost);

      // Deduct credits
      await this.deductCredits(context.orgId, cost);

      // Cache response
      if (context.enableCache !== false) {
        await cacheService.cacheResponse(request, response, 3600); // Cache for 1 hour
      }

      // Add cost to response for client display
      response.cost = cost;

      return response;
    } catch (error) {
      const latency = Date.now() - startTime;
      
      logger.error({
        error: error instanceof Error ? error.message : 'Unknown error',
        model: request.model,
        orgId: context.orgId,
      }, 'Chat completion request failed');

      // Log failed request
      await this.logFailedRequest(context, request, error, latency);

      throw error;
    }
  }

  /**
   * Check if organization has sufficient credits
   */
  private async checkCreditBalance(orgId: string): Promise<void> {
    const [org] = await db
      .select()
      .from(orgs)
      .where(eq(orgs.id, orgId))
      .limit(1);

    if (!org) {
      throw new Error('Organization not found');
    }

    if (parseFloat(org.creditBalance) <= 0) {
      throw new Error('Insufficient credits. Please top up your account.');
    }
  }

  /**
   * Deduct credits from organization
   */
  private async deductCredits(orgId: string, amount: number): Promise<void> {
    await db
      .update(orgs)
      .set({
        creditBalance: sql`${orgs.creditBalance} - ${amount}`,
        updatedAt: new Date(),
      })
      .where(eq(orgs.id, orgId));

    logger.info({ orgId, amount }, 'Credits deducted');
  }

  /**
   * Log a successful request
   */
  private async logRequest(
    context: ChatRequestContext,
    request: ChatCompletionRequest,
    response: ChatCompletionResponse,
    providerId: string,
    latency: number,
    cost: number
  ): Promise<void> {
    const logData: RequestLogData = {
      apiKeyId: context.apiKeyId,
      orgId: context.orgId,
      providerId,
      model: request.model,
      inputTokens: response.usage.promptTokens,
      outputTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      latencyMs: latency,
      cost,
      status: 'success',
      cached: response.cached || false,
      request: {
        messages: request.messages.length,
        temperature: request.temperature,
      },
      response: {
        finishReason: response.choices[0]?.finishReason,
      },
    };

    const requestId = await requestLogger.logRequest(logData);

    // Create billing event
    await requestLogger.createBillingEvent(
      context.orgId,
      requestId,
      cost,
      `Chat completion: ${request.model}`
    );
  }

  /**
   * Log a cached request
   */
  private async logCachedRequest(
    context: ChatRequestContext,
    request: ChatCompletionRequest,
    response: ChatCompletionResponse,
    startTime: number
  ): Promise<void> {
    const latency = Date.now() - startTime;

    // Get provider ID from response
    const [dbProvider] = await db
      .select()
      .from(providersTable)
      .where(eq(providersTable.name, response.provider))
      .limit(1);

    const logData: RequestLogData = {
      apiKeyId: context.apiKeyId,
      orgId: context.orgId,
      providerId: dbProvider?.id || 'unknown',
      model: request.model,
      inputTokens: response.usage.promptTokens,
      outputTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      latencyMs: latency,
      cost: 0, // No cost for cached responses
      status: 'success',
      cached: true,
    };

    await requestLogger.logRequest(logData);
  }

  /**
   * Log a failed request
   */
  private async logFailedRequest(
    context: ChatRequestContext,
    request: ChatCompletionRequest,
    error: unknown,
    latency: number
  ): Promise<void> {
    try {
      const logData: RequestLogData = {
        apiKeyId: context.apiKeyId,
        orgId: context.orgId,
        providerId: null as any, // Set to null for failed requests where provider isn't determined
        model: request.model,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        latencyMs: latency,
        cost: 0,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };

      await requestLogger.logRequest(logData);
    } catch (logError) {
      logger.error({ logError }, 'Failed to log failed request');
    }
  }

  /**
   * Get available models
   */
  getAvailableModels(): Array<{ provider: string; models: string[] }> {
    const providers = providerManager.getAllProviders();
    return providers.map(p => ({
      provider: p.name,
      models: p.config.supportedModels,
    }));
  }

  /**
   * Get service statistics
   */
  getStatistics(): any {
    return {
      providers: providerManager.getStatistics(),
      routing: this.routingEngine.getStatistics(),
    };
  }
}

// Singleton instance
export const chatService = new ChatService();

// Import sql from drizzle-orm
import { sql } from 'drizzle-orm';

