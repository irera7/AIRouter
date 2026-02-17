/**
 * Combined Authentication Plugin
 * Allows either JWT token OR API key authentication
 * Used for dashboard endpoints that can be accessed both ways
 */

import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../modules/auth/auth.service.js';
import { logger } from '../utils/logger.js';

export default fp(async (fastify) => {
  const authService = new AuthService();

  /**
   * Authenticate with either JWT or API Key
   * Tries JWT first, then falls back to API Key
   */
  fastify.decorate('authenticateEither', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Missing or invalid authentication',
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer '

      // Try JWT authentication first (for dashboard users)
      try {
        const decoded = fastify.jwt.verify(token) as {
          userId: string;
          orgId: string;
          role: string;
        };

        // Attach user info to request
        request.user = decoded;
        logger.debug({ userId: decoded.userId, role: decoded.role }, 'JWT authentication successful');
        return; // Success
      } catch (jwtError) {
        // JWT failed, try API key
        logger.debug('JWT verification failed, trying API key');
      }

      // Try API key authentication (for API users)
      try {
        const validatedKey = await authService.validateApiKey(token);

        if (validatedKey) {
          request.apiKeyAuth = validatedKey;
          logger.debug({ userId: validatedKey.userId, orgId: validatedKey.orgId }, 'API key authentication successful');
          return; // Success
        }
      } catch (apiKeyError) {
        logger.debug('API key validation failed');
      }

      // Both failed
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired authentication token',
      });
    } catch (err) {
      logger.error({ error: err }, 'Authentication error');
      reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication failed',
      });
    }
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    authenticateEither: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

