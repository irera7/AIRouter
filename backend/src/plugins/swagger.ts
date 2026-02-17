/**
 * Swagger/OpenAPI Plugin
 * Auto-generates API documentation
 */

import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

export default fp(async (fastify) => {
  // Register Swagger
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'AIRouter API',
        description: 'AI API Marketplace and Router Platform - Unified access to multiple LLM providers',
        version: '1.0.0',
        contact: {
          name: 'AIRouter Support',
          email: 'support@airouter.dev',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server',
        },
        {
          url: 'https://api.airouter.dev',
          description: 'Production server',
        },
      ],
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'chat', description: 'Chat completion endpoints' },
        { name: 'analytics', description: 'Analytics and reporting endpoints' },
        { name: 'billing', description: 'Billing and payment endpoints' },
        { name: 'admin', description: 'Admin panel endpoints' },
        { name: 'health', description: 'Health check endpoints' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token for authentication',
          },
          apiKey: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'API Key',
            description: 'API Key for accessing endpoints (format: sk-air-...)',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: { type: 'string', example: 'Error message' },
              message: { type: 'string', example: 'Detailed error description' },
              details: { type: 'object', nullable: true },
            },
          },
          ChatMessage: {
            type: 'object',
            required: ['role', 'content'],
            properties: {
              role: {
                type: 'string',
                enum: ['system', 'user', 'assistant'],
                example: 'user',
              },
              content: { type: 'string', example: 'Hello, how are you?' },
            },
          },
          ChatCompletionRequest: {
            type: 'object',
            required: ['model', 'messages'],
            properties: {
              model: { type: 'string', example: 'gpt-4' },
              messages: {
                type: 'array',
                items: { $ref: '#/components/schemas/ChatMessage' },
              },
              temperature: { type: 'number', minimum: 0, maximum: 2, example: 0.7 },
              maxTokens: { type: 'integer', example: 1000 },
              topP: { type: 'number', minimum: 0, maximum: 1, example: 1 },
              routingStrategy: {
                type: 'string',
                enum: ['cost', 'latency', 'priority', 'fallback'],
                example: 'cost',
              },
              preferredProvider: { type: 'string', example: 'openai' },
              enableCache: { type: 'boolean', example: true },
            },
          },
          ChatCompletionResponse: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  object: { type: 'string', example: 'chat.completion' },
                  created: { type: 'integer' },
                  model: { type: 'string' },
                  provider: { type: 'string' },
                  choices: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        index: { type: 'integer' },
                        message: { $ref: '#/components/schemas/ChatMessage' },
                        finish_reason: { type: 'string' },
                      },
                    },
                  },
                  usage: {
                    type: 'object',
                    properties: {
                      prompt_tokens: { type: 'integer' },
                      completion_tokens: { type: 'integer' },
                      total_tokens: { type: 'integer' },
                    },
                  },
                },
              },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              role: { type: 'string', enum: ['user', 'admin', 'owner'] },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          ApiKey: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
              key: { type: 'string', example: 'sk-air-xxxx...' },
              permissions: { type: 'array', items: { type: 'string' } },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              expiresAt: { type: 'string', format: 'date-time', nullable: true },
            },
          },
        },
      },
      security: [
        { bearerAuth: [] },
        { apiKey: [] },
      ],
    },
  });

  // Register Swagger UI
  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
    },
    uiHooks: {
      onRequest: function (_request, _reply, next) { next() },
      preHandler: function (_request, _reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, _request, _reply) => {
      return swaggerObject
    },
    transformSpecificationClone: true
  });
})

