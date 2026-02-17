# AIRouter Project Structure

```
AIRouter/
│
├── backend/                          # Backend application
│   └── src/
│       ├── db/                       # Database layer
│       │   ├── schema/               # Drizzle ORM schemas
│       │   │   ├── users.ts          # Users table schema
│       │   │   ├── orgs.ts           # Organizations table schema
│       │   │   ├── apiKeys.ts        # API keys table schema
│       │   │   ├── providers.ts      # Providers table schema
│       │   │   ├── requests.ts       # Requests log table schema
│       │   │   ├── billingEvents.ts  # Billing events table schema
│       │   │   ├── routingPolicies.ts# Routing policies table schema
│       │   │   └── index.ts          # Schema exports
│       │   ├── migrations/           # Database migrations (auto-generated)
│       │   ├── index.ts              # Database connection
│       │   ├── migrate.ts            # Migration runner
│       │   └── seed.ts               # Seed data script
│       │
│       ├── modules/                  # Feature modules
│       │   ├── auth/                 # Authentication module
│       │   │   ├── auth.service.ts   # Auth business logic
│       │   │   ├── auth.routes.ts    # Auth API routes
│       │   │   └── auth.service.spec.ts # Auth tests
│       │   │
│       │   ├── providers/            # Provider connectors (Week 3-4)
│       │   │   ├── connectors/
│       │   │   │   ├── base.connector.ts
│       │   │   │   ├── openai.connector.ts
│       │   │   │   ├── anthropic.connector.ts
│       │   │   │   └── mock.connector.ts
│       │   │   ├── provider.service.ts
│       │   │   ├── provider.routes.ts
│       │   │   └── README.md
│       │   │
│       │   ├── routing/              # Routing engine (Week 3-4)
│       │   │   ├── strategies/
│       │   │   │   ├── cost.strategy.ts
│       │   │   │   ├── latency.strategy.ts
│       │   │   │   ├── fallback.strategy.ts
│       │   │   │   └── round-robin.strategy.ts
│       │   │   ├── routing.service.ts
│       │   │   ├── routing.routes.ts
│       │   │   └── README.md
│       │   │
│       │   ├── billing/              # Billing system (Week 5-6)
│       │   │   ├── billing.service.ts
│       │   │   └── billing.routes.ts
│       │   │
│       │   └── usage/                # Usage tracking (Week 5-6)
│       │       ├── usage.service.ts
│       │       └── usage.routes.ts
│       │
│       ├── plugins/                  # Fastify plugins
│       │   ├── jwt.ts                # JWT authentication plugin
│       │   ├── apiKey.ts             # API key authentication plugin
│       │   ├── cors.ts               # CORS plugin
│       │   └── rateLimit.ts          # Rate limiting plugin
│       │
│       ├── utils/                    # Utility functions
│       │   ├── logger.ts             # Pino logger setup
│       │   └── redis.ts              # Redis client setup
│       │
│       ├── types/                    # TypeScript type definitions
│       │   └── fastify.d.ts          # Fastify type extensions
│       │
│       ├── app.ts                    # Fastify app setup
│       ├── app.spec.ts               # App integration tests
│       └── index.ts                  # Application entry point
│
├── frontend/                         # React dashboard (Week 5-6)
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── pages/                    # Page components
│   │   ├── hooks/                    # Custom hooks
│   │   ├── utils/                    # Utility functions
│   │   ├── api/                      # API client
│   │   ├── App.tsx                   # Root component
│   │   └── main.tsx                  # Entry point
│   ├── public/                       # Static assets
│   ├── index.html                    # HTML template
│   ├── vite.config.ts                # Vite configuration
│   └── tailwind.config.js            # TailwindCSS configuration
│
├── infra/                            # Infrastructure configuration
│   ├── docker/                       # Docker files
│   │   ├── backend.Dockerfile
│   │   └── frontend.Dockerfile
│   │
│   ├── k8s/                          # Kubernetes manifests (Week 9-10)
│   │   ├── base/                     # Base configurations
│   │   ├── staging/                  # Staging environment
│   │   └── production/               # Production environment
│   │
│   └── prometheus/                   # Monitoring configuration
│       └── prometheus.yml            # Prometheus config
│
├── scripts/                          # Utility scripts
│   ├── setup.sh                      # Development setup script
│   └── test-api.sh                   # API testing script
│
├── docs/                             # Documentation
│   ├── API.md                        # API reference
│   ├── DEPLOYMENT.md                 # Deployment guide (coming soon)
│   └── DEVELOPMENT.md                # Development guide (coming soon)
│
├── .github/                          # GitHub configuration
│   └── workflows/                    # GitHub Actions workflows
│       └── ci.yml                    # CI/CD pipeline
│
├── .vscode/                          # VS Code configuration (optional)
│   ├── settings.json
│   ├── extensions.json
│   └── launch.json
│
├── node_modules/                     # Dependencies (gitignored)
├── dist/                             # Build output (gitignored)
├── coverage/                         # Test coverage (gitignored)
│
├── package.json                      # Node.js dependencies
├── package-lock.json                 # Dependency lock file
├── tsconfig.json                     # TypeScript configuration
├── drizzle.config.ts                 # Drizzle ORM configuration
├── vitest.config.ts                  # Vitest test configuration
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── .gitignore                        # Git ignore rules
├── .dockerignore                     # Docker ignore rules
├── docker-compose.yml                # Docker Compose configuration
├── Dockerfile                        # Production Dockerfile
├── Makefile                          # Make commands
│
├── README.md                         # Main documentation
├── QUICKSTART.md                     # Quick start guide
├── ARCHITECTURE.md                   # Architecture documentation
├── CONTRIBUTING.md                   # Contributing guidelines
├── CHANGELOG.md                      # Version history
├── LICENSE                           # MIT License
└── PROJECT_STRUCTURE.md              # This file
```

## Key Directories Explained

### `/backend/src/db/`
Database layer with Drizzle ORM schemas, migrations, and seed data. All database interactions go through this layer.

### `/backend/src/modules/`
Feature modules organized by domain. Each module contains:
- `*.service.ts` - Business logic
- `*.routes.ts` - API endpoints
- `*.types.ts` - TypeScript types
- `*.spec.ts` - Tests

### `/backend/src/plugins/`
Fastify plugins for cross-cutting concerns like authentication, CORS, and rate limiting.

### `/backend/src/utils/`
Shared utility functions and configurations (logger, Redis client, etc.).

### `/frontend/` (Coming in Week 5-6)
React dashboard for managing API keys, viewing usage, and billing.

### `/infra/`
Infrastructure as Code (IaC) configurations for Docker, Kubernetes, and monitoring.

### `/scripts/`
Utility scripts for development, testing, and deployment.

### `/docs/`
Comprehensive documentation including API reference and guides.

## File Naming Conventions

- **Services**: `*.service.ts` - Business logic and data access
- **Routes**: `*.routes.ts` - API endpoint definitions
- **Types**: `*.types.ts` - TypeScript type definitions
- **Tests**: `*.spec.ts` - Unit and integration tests
- **Configs**: `*.config.ts` - Configuration files

## Module Dependencies

```
┌─────────────────┐
│   API Routes    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Services     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │
└─────────────────┘
```

## Technology Stack by Directory

### Backend (`/backend/`)
- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Framework**: Fastify
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Validation**: Zod
- **Testing**: Vitest

### Frontend (`/frontend/`) - Coming Soon
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State**: React Query
- **Charts**: Recharts

### Infrastructure (`/infra/`)
- **Containers**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **Monitoring**: Prometheus & Grafana
- **CI/CD**: GitHub Actions

## Development Workflow

1. **Database Changes**:
   - Modify schema in `/backend/src/db/schema/`
   - Generate migration: `npm run db:generate`
   - Run migration: `npm run db:migrate`

2. **New Feature**:
   - Create module in `/backend/src/modules/feature-name/`
   - Implement service, routes, and tests
   - Register routes in `/backend/src/app.ts`

3. **Testing**:
   - Write tests alongside code (`*.spec.ts`)
   - Run tests: `npm test`
   - Check coverage: `npm run test:coverage`

4. **Deployment**:
   - Build Docker image: `docker build -t airouter .`
   - Push to registry
   - Deploy to Kubernetes (Week 9-10)

## Future Structure (Weeks 3-12)

### Week 3-4: Provider Connectors
- `/backend/src/modules/providers/connectors/`
- OpenAI, Anthropic, Mock implementations

### Week 5-6: Dashboard
- `/frontend/src/` - Complete React application
- `/frontend/src/pages/` - Dashboard pages
- `/frontend/src/components/` - Reusable components

### Week 7-8: SDKs
- `/sdks/node/` - Node.js SDK
- `/sdks/python/` - Python SDK
- `/docs/sdk/` - SDK documentation

### Week 9-10: Kubernetes
- `/infra/k8s/base/` - Base configurations
- `/infra/k8s/staging/` - Staging overlays
- `/infra/k8s/production/` - Production overlays

### Week 11-12: Enterprise
- `/backend/src/modules/webhooks/` - Webhook system
- `/backend/src/modules/analytics/` - Advanced analytics
- `/backend/src/modules/audit/` - Audit logging

---

This structure is designed to be:
- **Modular**: Easy to add new features
- **Testable**: Tests alongside code
- **Scalable**: Clear separation of concerns
- **Maintainable**: Consistent patterns throughout

