import Fastify from 'fastify';
import { logger } from './utils/logger.js';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugins
import corsPlugin from './plugins/cors.js';
import swaggerPlugin from './plugins/swagger.js';
import jwtPlugin from './plugins/jwt.js';
import apiKeyPlugin from './plugins/apiKey.js';
import authenticateEitherPlugin from './plugins/authenticateEither.js';
import rateLimitPlugin from './plugins/rateLimit.js';
import metricsPlugin from './plugins/metricsPlugin.js';

// Routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { chatRoutes } from './modules/chat/routes.js';
import { analyticsRoutes } from './modules/analytics/routes.js';
import { adminRoutes } from './modules/admin/routes.js';
import { healthRoutes } from './modules/health/routes.js';
import { billingRoutes } from './modules/billing/routes.js';

// Services
import { chatService } from './modules/chat/ChatService.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: logger as any,
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
  });

  // Register plugins
  await fastify.register(corsPlugin);
  await fastify.register(swaggerPlugin); // Swagger documentation
  await fastify.register(metricsPlugin); // Metrics first to track all requests
  await fastify.register(jwtPlugin);
  await fastify.register(apiKeyPlugin);
  await fastify.register(authenticateEitherPlugin); // Combined JWT + API key auth
  await fastify.register(rateLimitPlugin);

  // Serve static files (documentation landing page)
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../public'),
    prefix: '/public/',
  });

  // Root route - documentation landing page
  fastify.get('/', async (_request, reply) => {
    return reply.sendFile('index.html');
  });

  // Initialize services
  try {
    await chatService.initialize();
    fastify.log.info('Chat service initialized');
  } catch (error) {
    fastify.log.error({ error }, 'Failed to initialize chat service');
    throw error;
  }

  // Health check
  // Health routes (basic + advanced)
  fastify.register(healthRoutes);

  // API routes
  fastify.register(authRoutes, { prefix: '/api/v1' });
  fastify.register(chatRoutes);
  fastify.register(analyticsRoutes);
  fastify.register(adminRoutes);
  fastify.register(billingRoutes);

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      success: false,
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
    });
  });

  // Error handler
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);

    reply.code(error.statusCode || 500).send({
      success: false,
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  });

  return fastify;
}

