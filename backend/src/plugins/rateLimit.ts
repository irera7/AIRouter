import fp from 'fastify-plugin';
import rateLimit from '@fastify/rate-limit';

export default fp(async (fastify) => {
  fastify.register(rateLimit, {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
    cache: 10000,
    allowList: ['127.0.0.1'],
    redis: process.env.REDIS_URL ? undefined : undefined, // Will add Redis support later
  });
});

