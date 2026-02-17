import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default fp(async (fastify) => {
  // Get allowed origins from environment variable
  const corsOriginEnv = process.env.CORS_ORIGIN;
  
  // If CORS_ORIGIN is *, allow all origins
  if (corsOriginEnv === '*') {
    fastify.register(cors, {
      origin: true, // Allow all origins
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
    });
    return;
  }
  
  // Parse specific origins from environment
  const allowedOrigins = corsOriginEnv
    ? corsOriginEnv.split(',').map(origin => origin.trim())
    : process.env.NODE_ENV === 'production'
      ? ['https://airouter.rera.work', 'https://www.airouter.rera.work']
      : ['http://localhost:3001', 'http://localhost:3000', 'http://127.0.0.1:3001'];
  
  fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) {
        cb(null, true);
        return;
      }
      
      // In development, allow all origins
      if (process.env.NODE_ENV !== 'production') {
        cb(null, true);
        return;
      }
      
      // In production, check against allowed origins
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        cb(null, true);
        return;
      }
      
      cb(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  });
});

