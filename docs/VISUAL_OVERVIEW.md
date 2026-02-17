# AIRouter Visual Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Browser    │  │   Mobile App │  │  Server App  │         │
│  │  Dashboard   │  │              │  │   (Node.js)  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                 │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              Fastify Web Server (Port 3000)            │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │     CORS     │  │ Rate Limit   │  │   Logger    │ │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │ JWT Auth     │  │ API Key Auth │                  │   │
│  │  └──────────────┘  └──────────────┘                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    Auth     │  │  Providers  │  │   Routing   │            │
│  │   Module    │  │   Module    │  │   Engine    │            │
│  │             │  │  (Week 3-4) │  │  (Week 3-4) │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                │                 │                    │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐            │
│  │   Billing   │  │    Usage    │  │  Analytics  │            │
│  │   Module    │  │   Tracking  │  │   (Future)  │            │
│  │ (Week 5-6)  │  │ (Week 5-6)  │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│                                                                  │
│  ┌──────────────────────┐         ┌──────────────────────┐     │
│  │   PostgreSQL 16      │         │      Redis 7         │     │
│  │   (Port 5432)        │         │    (Port 6379)       │     │
│  │                      │         │                      │     │
│  │  ┌────────────────┐ │         │  ┌────────────────┐ │     │
│  │  │     users      │ │         │  │  Session Cache │ │     │
│  │  │     orgs       │ │         │  │  Rate Limits   │ │     │
│  │  │   api_keys     │ │         │  │  Response Cache│ │     │
│  │  │   providers    │ │         │  └────────────────┘ │     │
│  │  │   requests     │ │         │                      │     │
│  │  │ billing_events │ │         └──────────────────────┘     │
│  │  │routing_policies│ │                                       │
│  │  └────────────────┘ │                                       │
│  └──────────────────────┘                                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### User Registration Flow

```
┌──────┐     POST /auth/register      ┌─────────┐
│Client├──────────────────────────────>│ Fastify │
└──────┘    {email, password, ...}    └────┬────┘
                                            │
                                            ▼
                                      ┌──────────┐
                                      │Validation│
                                      │  (Zod)   │
                                      └────┬─────┘
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │Auth Service │
                                    │             │
                                    │ 1. Hash pwd │
                                    │ 2. Create   │
                                    │    org      │
                                    │ 3. Create   │
                                    │    user     │
                                    └──────┬──────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │  PostgreSQL  │
                                    │              │
                                    │ INSERT INTO  │
                                    │   orgs       │
                                    │ INSERT INTO  │
                                    │   users      │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Generate JWT │
                                    └──────┬───────┘
                                           │
                                           ▼
┌──────┐     {user, org, token}     ┌─────────┐
│Client│<──────────────────────────│ Response│
└──────┘                            └─────────┘
```

### API Request Flow (Future - Week 3-4)

```
┌──────┐  POST /chat/completions   ┌─────────┐
│Client├─────────────────────────>│ Fastify │
└──────┘  Bearer: sk-air-xxxxx    └────┬────┘
                                        │
                                        ▼
                                  ┌──────────┐
                                  │ API Key  │
                                  │  Auth    │
                                  └────┬─────┘
                                       │
                                       ▼
                                  ┌──────────┐
                                  │  Rate    │
                                  │  Limit   │
                                  └────┬─────┘
                                       │
                                       ▼
                                  ┌──────────┐
                                  │ Routing  │
                                  │  Engine  │
                                  │          │
                                  │ Select:  │
                                  │ - OpenAI │
                                  │ - Claude │
                                  │ - Local  │
                                  └────┬─────┘
                                       │
                                       ▼
                                  ┌──────────┐
                                  │Provider  │
                                  │Connector │
                                  └────┬─────┘
                                       │
                                       ▼
                                  ┌──────────┐
                                  │   LLM    │
                                  │ Provider │
                                  └────┬─────┘
                                       │
                                       ▼
                                  ┌──────────┐
                                  │  Log     │
                                  │ Request  │
                                  │          │
                                  │ - Tokens │
                                  │ - Cost   │
                                  │ - Time   │
                                  └────┬─────┘
                                       │
                                       ▼
┌──────┐      Response            ┌─────────┐
│Client│<─────────────────────────│ Fastify │
└──────┘                          └─────────┘
```

## 📊 Database Schema

```
┌─────────────────┐
│      orgs       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ slug (UNIQUE)   │
│ plan            │
│ creditBalance   │
│ createdAt       │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────┴────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ passwordHash    │
│ name            │
│ orgId (FK)      │◄──────┐
│ role            │       │
│ createdAt       │       │
└────────┬────────┘       │
         │                │
         │ 1:N            │
         │                │
┌────────┴────────┐       │
│    api_keys     │       │
├─────────────────┤       │
│ id (PK)         │       │
│ key (UNIQUE)    │       │
│ keyHash         │       │
│ name            │       │
│ userId (FK)     │───────┘
│ orgId (FK)      │───────┐
│ permissions     │       │
│ isActive        │       │
│ lastUsedAt      │       │
│ expiresAt       │       │
└────────┬────────┘       │
         │                │
         │ 1:N            │
         │                │
┌────────┴────────┐       │
│    requests     │       │
├─────────────────┤       │
│ id (PK)         │       │
│ apiKeyId (FK)   │       │
│ orgId (FK)      │───────┘
│ providerId (FK) │───────┐
│ model           │       │
│ inputTokens     │       │
│ outputTokens    │       │
│ cost            │       │
│ latencyMs       │       │
│ status          │       │
│ createdAt       │       │
└─────────────────┘       │
                          │
         ┌────────────────┘
         │
┌────────┴────────┐
│   providers     │
├─────────────────┤
│ id (PK)         │
│ name (UNIQUE)   │
│ displayName     │
│ baseUrl         │
│ isActive        │
│ config          │
│ pricing         │
└─────────────────┘
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Authentication                        │
└─────────────────────────────────────────────────────────┘

User Authentication (JWT)
┌──────────┐
│  Login   │
└────┬─────┘
     │
     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Validate │────>│ Generate │────>│  Return  │
│  Email   │     │   JWT    │     │  Token   │
│Password  │     │  Token   │     │          │
└──────────┘     └──────────┘     └──────────┘
     │
     │ Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     │
     ▼
┌──────────┐
│Protected │
│Endpoints │
│          │
│ /auth/me │
│/api-keys │
└──────────┘


API Key Authentication
┌──────────┐
│  Create  │
│ API Key  │
└────┬─────┘
     │
     ▼
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Generate │────>│   Hash   │────>│  Store   │
│   Key    │     │   Key    │     │    in    │
│sk-air-xxx│     │  (bcrypt)│     │    DB    │
└──────────┘     └──────────┘     └──────────┘
     │
     │ Key: sk-air-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     │
     ▼
┌──────────┐
│   LLM    │
│Endpoints │
│          │
│  /chat   │
│/embeddings│
└──────────┘
```

## 📦 Module Structure

```
backend/src/
│
├── db/                      # Database Layer
│   ├── schema/              # Table definitions
│   │   ├── users.ts
│   │   ├── orgs.ts
│   │   ├── apiKeys.ts
│   │   ├── providers.ts
│   │   ├── requests.ts
│   │   ├── billingEvents.ts
│   │   └── routingPolicies.ts
│   ├── migrations/          # SQL migrations
│   ├── migrate.ts           # Migration runner
│   └── seed.ts              # Seed data
│
├── modules/                 # Feature Modules
│   ├── auth/                # ✅ Week 1-2
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.spec.ts
│   │
│   ├── providers/           # 🔄 Week 3-4
│   │   ├── connectors/
│   │   │   ├── openai.connector.ts
│   │   │   ├── anthropic.connector.ts
│   │   │   └── mock.connector.ts
│   │   └── provider.service.ts
│   │
│   ├── routing/             # 🔄 Week 3-4
│   │   ├── strategies/
│   │   │   ├── cost.strategy.ts
│   │   │   ├── latency.strategy.ts
│   │   │   └── fallback.strategy.ts
│   │   └── routing.service.ts
│   │
│   ├── billing/             # ⏳ Week 5-6
│   └── usage/               # ⏳ Week 5-6
│
├── plugins/                 # Fastify Plugins
│   ├── jwt.ts               # ✅ JWT auth
│   ├── apiKey.ts            # ✅ API key auth
│   ├── cors.ts              # ✅ CORS
│   └── rateLimit.ts         # ✅ Rate limiting
│
├── utils/                   # Utilities
│   ├── logger.ts            # ✅ Pino logger
│   └── redis.ts             # ✅ Redis client
│
├── app.ts                   # ✅ Fastify setup
└── index.ts                 # ✅ Entry point
```

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Development                           │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │PostgreSQL│  │  Redis   │  │  Backend │             │
│  │  :5432   │  │  :6379   │  │  :3000   │             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                          │
│              Docker Compose                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Production                            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Load Balancer                        │  │
│  └────────────────────┬─────────────────────────────┘  │
│                       │                                  │
│         ┌─────────────┼─────────────┐                   │
│         │             │             │                   │
│    ┌────▼────┐   ┌────▼────┐  ┌────▼────┐             │
│    │Backend  │   │Backend  │  │Backend  │             │
│    │ Pod 1   │   │ Pod 2   │  │ Pod 3   │             │
│    └────┬────┘   └────┬────┘  └────┬────┘             │
│         │             │             │                   │
│         └─────────────┼─────────────┘                   │
│                       │                                  │
│         ┌─────────────┴─────────────┐                   │
│         │                           │                   │
│    ┌────▼────────┐         ┌────────▼────┐             │
│    │  Cloud SQL  │         │Cloud Memory-│             │
│    │(PostgreSQL) │         │store (Redis)│             │
│    └─────────────┘         └─────────────┘             │
│                                                          │
│              Kubernetes (GKE/EKS/AKS)                   │
└─────────────────────────────────────────────────────────┘
```

## 📈 Monitoring Stack

```
┌─────────────────────────────────────────────────────────┐
│                   Observability                          │
│                                                          │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐       │
│  │  Pino    │────>│Prometheus│────>│ Grafana  │       │
│  │ Logger   │     │ Metrics  │     │Dashboard │       │
│  └──────────┘     └──────────┘     └──────────┘       │
│       │                 │                 │             │
│       │                 │                 │             │
│       ▼                 ▼                 ▼             │
│  ┌──────────────────────────────────────────────┐     │
│  │         Application Insights                  │     │
│  │                                               │     │
│  │  - Request logs                               │     │
│  │  - Error tracking                             │     │
│  │  - Performance metrics                        │     │
│  │  - Cost tracking                              │     │
│  │  - Usage analytics                            │     │
│  └──────────────────────────────────────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## ✅ Current Status (Week 1-2)

```
✅ Project Setup
✅ Database Schema (7 tables)
✅ Authentication (JWT + API Keys)
✅ Fastify Server
✅ Docker Compose
✅ Tests
✅ Documentation
✅ CI/CD Pipeline

🔄 Next: Provider Connectors (Week 3-4)
⏳ Future: Dashboard (Week 5-6)
⏳ Future: SDKs (Week 7-8)
⏳ Future: Kubernetes (Week 9-10)
```

---

This visual overview provides a high-level understanding of the AIRouter architecture and implementation status.

