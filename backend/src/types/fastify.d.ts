import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      orgId: string;
      role: string;
    };
    apiKeyAuth?: {
      id: string;
      key: string;
      userId: string;
      orgId: string;
      permissions: string[];
      org: any;
      user: any;
    };
  }
}

