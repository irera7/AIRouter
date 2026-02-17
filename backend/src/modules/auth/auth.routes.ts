import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { users } from '../../db/schema/index.js';
import { eq } from 'drizzle-orm';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  orgName: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const createApiKeySchema = z.object({
  name: z.string().min(1),
  permissions: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().optional(),
});

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();

  // Register
  fastify.post('/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = registerSchema.parse(request.body);

      // Check if user already exists
      const [existingUser] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);

      if (existingUser) {
        return reply.code(409).send({
          success: false,
          error: 'User already exists',
          message: `An account with email ${body.email} already exists. Please login instead.`,
        });
      }

      const { user, org } = await authService.createUser(body);

      const token = fastify.jwt.sign({
        userId: user.id,
        orgId: org.id,
        role: user.role,
      });

      return reply.code(201).send({
        success: true,
        message: 'Account created successfully!',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          org: {
            id: org.id,
            name: org.name,
            slug: org.slug,
          },
          token,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          message: 'Please check your input and try again',
          details: error.errors,
        });
      }
      
      fastify.log.error({ error }, 'Registration error');
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred during registration. Please try again.',
      });
    }
  });

  // Login
  fastify.post('/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      fastify.log.info({ body: request.body }, 'Login attempt');
      const body = loginSchema.parse(request.body);
      fastify.log.info({ email: body.email, passwordLength: body.password?.length }, 'Parsed login data');

      // Check if user exists first
      const [existingUser] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
      fastify.log.info({ userFound: !!existingUser, email: body.email }, 'User lookup result');

      if (!existingUser) {
        return reply.code(404).send({
          success: false,
          error: 'User not found',
          message: `No account found with email: ${body.email}. Please register first.`,
        });
      }

      // Validate password
      const user = await authService.validateUser(body.email, body.password);
      fastify.log.info({ passwordValidated: !!user }, 'Password validation result');

      if (!user) {
        fastify.log.warn({ email: body.email }, 'Invalid password attempt');
        return reply.code(401).send({
          success: false,
          error: 'Invalid password',
          message: 'The password you entered is incorrect.',
        });
      }

      const token = fastify.jwt.sign({
        userId: user.id,
        orgId: user.orgId,
        role: user.role,
      });

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          success: false,
          error: 'Validation error',
          message: 'Invalid email or password format',
          details: error.errors,
        });
      }
      
      fastify.log.error({ error }, 'Login error');
      return reply.code(500).send({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred during login. Please try again.',
      });
    }
  });

  // Get current user
  fastify.get(
    '/auth/me',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({
        success: true,
        data: request.user,
      });
    }
  );

  // Create API key
  fastify.post(
    '/auth/api-keys',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = createApiKeySchema.parse(request.body);
        const user = request.user as any;

        const { apiKey, plainKey } = await authService.createApiKey({
          name: body.name,
          userId: user.userId,
          orgId: user.orgId,
          permissions: body.permissions,
          expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        });

        return reply.code(201).send({
          success: true,
          data: {
            id: apiKey.id,
            name: apiKey.name,
            key: plainKey,
            permissions: apiKey.permissions,
            expiresAt: apiKey.expiresAt,
            createdAt: apiKey.createdAt,
          },
          message: 'Save this key! It will not be shown again.',
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            success: false,
            error: 'Validation error',
            details: error.errors,
          });
        }
        throw error;
      }
    }
  );

  // List API keys
  fastify.get(
    '/auth/api-keys',
    { onRequest: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const user = request.user as any;
      const keys = await authService.listApiKeys(user.orgId);

      return reply.send({
        success: true,
        data: keys.map((key) => ({
          id: key.id,
          name: key.name,
          key: `${key.key.substring(0, 12)}...`, // Masked
          permissions: key.permissions,
          isActive: key.isActive,
          lastUsedAt: key.lastUsedAt,
          expiresAt: key.expiresAt,
          createdAt: key.createdAt,
        })),
      });
    }
  );

  // Revoke API key
  fastify.delete<{ Params: { keyId: string } }>(
    '/auth/api-keys/:keyId',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const user = request.user as any;
      
      await authService.revokeApiKey(request.params.keyId, user.orgId);

      return reply.send({
        success: true,
        message: 'API key revoked successfully',
      });
    }
  );
}

