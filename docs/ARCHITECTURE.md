# AIRouter Architecture

## System Overview

AIRouter is a multi-provider LLM routing gateway that intelligently routes requests to different AI providers (OpenAI, Anthropic, local models) based on cost, latency, and availability.

## High-Level Architecture

```
┌─────────────┐
│   Client    │
│ Application │
└──────┬──────┘
       │ API Key
       ▼
┌─────────────────────────────────────────┐
│          AIRouter Gateway               │
│  ┌────────────────────────────────┐    │
│  │   Authentication & Rate Limit  │    │
│  └────────────┬───────────────────┘    │
│               ▼                         │
│  ┌────────────────────────────────┐    │
│  │      Routing Engine            │    │
│  │  - Cost optimization           │    │
│  │  - Latency optimization        │    │
│  │  - Fallback handling           │    │
│  └────────────┬───────────────────┘    │
│               ▼                         │
│  ┌────────────────────────────────┐    │
│  │    Provider Connectors         │    │
│  │  - OpenAI                      │    │
│  │  - Anthropic                   │    │
│  │  - Local Models                │    │
│  └────────────┬───────────────────┘    │
└───────────────┼─────────────────────────┘
                ▼
       ┌────────────────┐
       │   LLM Providers │
       └────────────────┘
```

## Core Components

### 1. API Gateway (Fastify)

**Responsibilities:**
- Request validation
- Authentication (JWT + API Keys)
- Rate limiting
- CORS handling
- Error handling
- Request/response logging

**Tech Stack:**
- Fastify (web framework)
- @fastify/jwt (JWT authentication)
- @fastify/rate-limit (rate limiting)
- @fastify/cors (CORS)
- Zod (validation)

### 2. Authentication Module

**Features:**
- User registration and login
- Organization management (multi-tenant)
- API key generation and validation
- Permission management
- Key expiration and revocation

**Database Tables:**
- `users` - User accounts
- `orgs` - Organizations
- `api_keys` - API key management

**Security:**
- Bcrypt password hashing (10 rounds)
- API key hashing before storage
- JWT token expiration
- Rate limiting per API key

### 3. Routing Engine

**Strategies:**

1. **Cost-Based Routing**
   - Calculate cost per request based on token count
   - Route to cheapest provider meeting requirements
   - Configurable cost thresholds

2. **Latency-Based Routing**
   - Track historical latency per provider
   - Route to fastest provider
   - Fallback on timeout

3. **Fallback Routing**
   - Define fallback chain: OpenAI → Anthropic → Local
   - Automatic retry on failure
   - Circuit breaker pattern

4. **Round-Robin**
   - Distribute load evenly
   - Health check integration

**Database Tables:**
- `routing_policies` - Custom routing rules
- `providers` - Provider configurations

### 4. Provider Connectors

**Interface:**
```typescript
interface ProviderConnector {
  name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
  embeddings(request: EmbeddingRequest): Promise<EmbeddingResponse>;
  healthCheck(): Promise<boolean>;
}
```

**Implementations:**
- OpenAI Connector
- Anthropic Connector
- Mock Connector (for testing)
- Local Model Connector (Ollama, LM Studio)

**Features:**
- Unified request/response format
- Automatic retries
- Timeout handling
- Token counting
- Cost calculation

### 5. Billing & Usage Tracking

**Features:**
- Credit-based system (cents)
- Real-time usage tracking
- Detailed request logs
- Cost attribution per API key/org
- Usage analytics

**Database Tables:**
- `requests` - Request logs (tokens, latency, cost)
- `billing_events` - Credit transactions

**Metrics Tracked:**
- Input/output tokens
- Request latency
- Cost per request
- Success/error rates
- Provider usage distribution

### 6. Caching Layer (Redis)

**Cache Strategy:**
- Cache key: hash(model + messages + params)
- TTL: Configurable per request
- Invalidation: Manual or time-based

**Benefits:**
- Reduced API costs
- Improved latency
- Rate limit protection

### 7. Monitoring & Observability

**Prometheus Metrics:**
- Request count by provider
- Request duration histogram
- Error rate by provider
- Token usage
- Cost tracking

**Grafana Dashboards:**
- Real-time request metrics
- Provider health status
- Cost analytics
- Usage trends

**Logging:**
- Structured JSON logs (Pino)
- Request/response logging
- Error tracking
- Audit logs

## Data Flow

### Request Flow

```
1. Client sends request with API key
   POST /api/v1/chat/completions
   Authorization: Bearer sk-air-xxxxx

2. API Gateway validates API key
   - Check key exists and is active
   - Check key not expired
   - Check rate limits
   - Load org and user context

3. Routing Engine selects provider
   - Apply routing policy
   - Check provider availability
   - Calculate estimated cost
   - Select optimal provider

4. Provider Connector executes request
   - Transform request to provider format
   - Send to provider API
   - Handle errors and retries
   - Count tokens and calculate cost

5. Response Processing
   - Transform response to standard format
   - Log request details
   - Update usage metrics
   - Deduct credits from org balance
   - Cache response (if enabled)

6. Return response to client
```

### Database Schema Relationships

```
orgs (1) ──< (N) users
orgs (1) ──< (N) api_keys
orgs (1) ──< (N) requests
orgs (1) ──< (N) billing_events
orgs (1) ──< (N) routing_policies

users (1) ──< (N) api_keys

api_keys (1) ──< (N) requests

providers (1) ──< (N) requests
```

## Scalability Considerations

### Horizontal Scaling

- Stateless API servers
- Load balancer (Nginx/HAProxy)
- Session storage in Redis
- Database connection pooling

### Vertical Scaling

- Optimize database queries
- Index frequently queried columns
- Implement query caching
- Use read replicas

### Caching Strategy

- Response caching (Redis)
- Provider metadata caching
- Rate limit state in Redis
- Session caching

### Database Optimization

- Partition `requests` table by date
- Archive old requests
- Use materialized views for analytics
- Implement database sharding (future)

## Security Architecture

### Authentication Layers

1. **User Authentication** (JWT)
   - Login with email/password
   - Token expiration and refresh
   - Role-based access control

2. **API Key Authentication**
   - Bearer token in Authorization header
   - Hashed storage
   - Per-key rate limits
   - Permission scopes

### Security Best Practices

- HTTPS only in production
- Rate limiting per IP and API key
- Input validation (Zod schemas)
- SQL injection prevention (Drizzle ORM)
- XSS prevention
- CORS configuration
- Secrets management (environment variables)

## Deployment Architecture

### Development

```
Docker Compose
├── PostgreSQL (5432)
├── Redis (6379)
├── Backend (3000)
├── Prometheus (9090)
└── Grafana (3001)
```

### Production (Kubernetes)

```
Kubernetes Cluster
├── Ingress (HTTPS)
├── Backend Pods (3+ replicas)
├── PostgreSQL (Cloud SQL)
├── Redis (Cloud Memorystore)
├── Prometheus
└── Grafana
```

### CI/CD Pipeline

```
GitHub Actions
├── Lint & Format
├── Run Tests
├── Build Docker Image
├── Push to Registry
├── Deploy to Staging
├── Run E2E Tests
└── Deploy to Production
```

## Future Enhancements

### Phase 2 (Week 3-4)
- Streaming responses
- Batch requests
- Model fine-tuning support

### Phase 3 (Week 5-6)
- React dashboard
- Real-time analytics
- Usage alerts

### Phase 4 (Week 7-8)
- SDKs (Node.js, Python)
- Webhook support
- API documentation site

### Phase 5 (Week 9-10)
- Multi-region deployment
- Advanced routing (A/B testing)
- Custom model hosting

### Phase 6 (Week 11-12)
- Enterprise features
- SSO integration
- Audit logs
- Compliance (SOC2, GDPR)

## Technology Stack Summary

**Backend:**
- Node.js 20+
- TypeScript (strict mode)
- Fastify (web framework)
- Drizzle ORM (database)
- PostgreSQL 16 (database)
- Redis 7 (cache)
- Zod (validation)

**Frontend (Coming):**
- React 18
- Vite
- TailwindCSS
- React Query
- Recharts (analytics)

**Infrastructure:**
- Docker & Docker Compose
- Kubernetes
- Prometheus & Grafana
- GitHub Actions

**Monitoring:**
- Pino (logging)
- Prometheus (metrics)
- Grafana (visualization)

---

This architecture is designed to be:
- **Scalable**: Horizontal and vertical scaling
- **Reliable**: Fallback routing, error handling
- **Secure**: Multi-layer authentication, rate limiting
- **Observable**: Comprehensive monitoring and logging
- **Maintainable**: Modular design, clean code

