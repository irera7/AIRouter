import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../modules/auth/auth.service.js';

export default fp(async (fastify) => {
  const authService = new AuthService();

  fastify.decorate('authenticateApiKey', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Missing or invalid API key',
        });
      }

      const apiKey = authHeader.substring(7); // Remove 'Bearer '

      const validatedKey = await authService.validateApiKey(apiKey);

      if (!validatedKey) {
        return reply.code(401).send({
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired API key',
        });
      }

      // Attach to request
      request.apiKeyAuth = validatedKey;
    } catch (err) {
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
    authenticateApiKey: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    apiKeyAuth?: any;
  }
}

