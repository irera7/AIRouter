/**
 * Chat Routes
 * API endpoints for chat completions
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { chatService } from './ChatService';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { RateLimitChecker } from '../../utils/rateLimitChecker';

// Initialize rate limit checker
const rateLimitChecker = new RateLimitChecker();

// Validation schemas
const MessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
});

const ChatCompletionSchema = z.object({
  // Model name (required if no intent)
  model: z.string().optional(),
  // Intent (NEW: required if no model)
  intent: z.string().optional(),
  // Messages
  messages: z.array(MessageSchema).min(1),
  // Standard OpenAI parameters
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(100000).optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stop: z.array(z.string()).optional(),
  stream: z.boolean().optional(),
  user: z.string().optional(),
  // AIRouter specific parameters
  routingStrategy: z.enum(['cost', 'latency', 'priority', 'fallback']).optional(),
  preferredProvider: z.string().optional(),
  enableCache: z.boolean().optional(),
}).refine(
  (data) => data.model || data.intent,
  {
    message: "Either 'model' or 'intent' must be provided",
    path: ["model", "intent"],
  }
);

export async function chatRoutes(fastify: FastifyInstance) {
  /**
   * POST /api/v1/chat/completions
   * Create a chat completion
   */
  fastify.post('/api/v1/chat/completions', {
    preHandler: [fastify.authenticateApiKey], // Requires API key authentication
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as z.infer<typeof ChatCompletionSchema>;
      const apiKeyAuth = request.apiKeyAuth as any; // From API key authentication

      logger.info({
        model: body.model,
        intent: body.intent,
        userId: apiKeyAuth.userId,
        orgId: apiKeyAuth.orgId,
      }, 'Chat completion request received');

      // Check rate limits
      const rateLimitResult = await rateLimitChecker.checkRateLimit(
        apiKeyAuth.orgId,
        apiKeyAuth.userId
      );

      // Add rate limit headers
      reply.header('X-RateLimit-Limit', rateLimitResult.limit.toString());
      reply.header('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      reply.header('X-RateLimit-Reset', rateLimitResult.resetAt.toISOString());

      if (!rateLimitResult.allowed) {
        logger.warn({
          userId: apiKeyAuth.userId,
          orgId: apiKeyAuth.orgId,
          limit: rateLimitResult.limit,
        }, 'Rate limit exceeded');

        if (rateLimitResult.retryAfter) {
          reply.header('Retry-After', rateLimitResult.retryAfter.toString());
        }

        return reply.code(429).send({
          success: false,
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again after ${rateLimitResult.retryAfter} seconds.`,
          limit: rateLimitResult.limit,
          remaining: 0,
          resetAt: rateLimitResult.resetAt,
        });
      }

      // Prepare request
      const chatRequest = {
        model: body.model || '',  // Will be set by intent router if using intent
        messages: body.messages,
        temperature: body.temperature,
        maxTokens: body.maxTokens,
        topP: body.topP,
        frequencyPenalty: body.frequencyPenalty,
        presencePenalty: body.presencePenalty,
        stop: body.stop,
        stream: body.stream,
        user: body.user,
      };

      // Prepare context
      const context = {
        apiKeyId: apiKeyAuth.id,
        userId: apiKeyAuth.userId,
        orgId: apiKeyAuth.orgId,
        routingStrategy: body.routingStrategy,
        preferredProvider: body.preferredProvider,
        enableCache: body.enableCache,
        intent: body.intent,  // NEW: Pass intent to ChatService
      };

      // Process request
      const response = await chatService.chatCompletion(chatRequest, context);

      return reply.code(200).send(response);
    } catch (error) {
      logger.error({ error }, 'Chat completion request failed');

      if (error instanceof Error) {
        if (error.message.includes('Insufficient credits')) {
          return reply.code(402).send({
            error: 'Insufficient credits',
            message: error.message,
          });
        }

        if (error.message.includes('No providers available')) {
          return reply.code(503).send({
            error: 'Service unavailable',
            message: 'No providers available for the requested model',
          });
        }
      }

      return reply.code(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/v1/chat/models
   * List available models
   */
  fastify.get('/api/v1/chat/models', {
    preHandler: [fastify.authenticateApiKey],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const models = chatService.getAvailableModels();
      return reply.code(200).send({ models });
    } catch (error) {
      logger.error({ error }, 'Failed to get available models');
      return reply.code(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/v1/chat/statistics
   * Get chat service statistics
   */
  fastify.get('/api/v1/chat/statistics', {
    preHandler: [fastify.authenticateApiKey],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get statistics (no role check for now since we're using API key)
      const statistics = chatService.getStatistics();
      return reply.code(200).send(statistics);
    } catch (error) {
      logger.error({ error }, 'Failed to get statistics');
      return reply.code(500).send({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}

