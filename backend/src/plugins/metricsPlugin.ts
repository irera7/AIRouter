/**
 * Metrics Plugin
 * Fastify plugin for automatic request tracking
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { httpRequestsInProgress, trackHttpRequest } from '../utils/metrics.js';

async function metricsPlugin(fastify: FastifyInstance) {
  // Track requests in progress
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    const route = request.routerPath || request.url;
    httpRequestsInProgress.inc({ method: request.method, route });
  });

  // Track completed requests
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    const route = request.routerPath || request.url;
    const duration = reply.getResponseTime() / 1000; // Convert to seconds
    
    httpRequestsInProgress.dec({ method: request.method, route });
    trackHttpRequest(request.method, route, reply.statusCode, duration);
  });
}

export default fp(metricsPlugin, {
  name: 'metrics-plugin',
});

