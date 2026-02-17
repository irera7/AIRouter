import * as dotenv from 'dotenv';
dotenv.config();

import { buildApp } from './app.js';
import { connectRedis, disconnectRedis } from './utils/redis.js';
import { logger } from './utils/logger.js';

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    // Connect to Redis
    await connectRedis();

    // Build and start Fastify app
    const app = await buildApp();

    await app.listen({ port: PORT, host: HOST });

    logger.info(`🚀 AIRouter server is running on http://${HOST}:${PORT}`);
    logger.info(`📚 Health check: http://${HOST}:${PORT}/health`);
    logger.info(`🔑 API docs: http://${HOST}:${PORT}/api/v1/docs (coming soon)`);

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, closing server...`);
        await app.close();
        await disconnectRedis();
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();

