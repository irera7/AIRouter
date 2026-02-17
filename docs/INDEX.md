# 📚 AIRouter Documentation Index

Welcome to the AIRouter documentation! This index will help you find exactly what you need.

## 🚀 Getting Started

Start here if you're new to AIRouter:

1. **[GET_STARTED.md](GET_STARTED.md)** - 5-minute quick start guide
2. **[QUICKSTART.md](QUICKSTART.md)** - Detailed setup instructions
3. **[README.md](README.md)** - Complete project overview

## 📖 Core Documentation

### Project Overview
- **[README.md](README.md)** - Main documentation with features, roadmap, and overview
- **[WEEK_1_2_SUMMARY.md](WEEK_1_2_SUMMARY.md)** - What we built in Week 1-2
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and changes

### Architecture & Design
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design decisions
- **[VISUAL_OVERVIEW.md](VISUAL_OVERVIEW.md)** - Visual diagrams and flowcharts
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - File structure and organization

### API Reference
- **[docs/API.md](docs/API.md)** - Complete API documentation
  - Authentication endpoints
  - User management
  - API key management
  - Future endpoints (LLM, billing, usage)

## 🛠️ Development

### Setup & Configuration
- **[GET_STARTED.md](GET_STARTED.md)** - Quick setup guide
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[.env.example](.env.example)** - Environment variables template

### Code Organization
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Directory structure
- **[backend/src/modules/providers/README.md](backend/src/modules/providers/README.md)** - Provider connectors (Week 3-4)
- **[backend/src/modules/routing/README.md](backend/src/modules/routing/README.md)** - Routing engine (Week 3-4)

### Testing
- **[vitest.config.ts](vitest.config.ts)** - Test configuration
- **[backend/src/app.spec.ts](backend/src/app.spec.ts)** - Integration tests
- **[backend/src/modules/auth/auth.service.spec.ts](backend/src/modules/auth/auth.service.spec.ts)** - Unit tests

## 🐳 Deployment

### Docker
- **[docker-compose.yml](docker-compose.yml)** - Local development setup
- **[Dockerfile](Dockerfile)** - Production container
- **[.dockerignore](.dockerignore)** - Docker ignore rules

### Infrastructure
- **[infra/prometheus/prometheus.yml](infra/prometheus/prometheus.yml)** - Monitoring config
- **[.github/workflows/ci.yml](.github/workflows/ci.yml)** - CI/CD pipeline

### Scripts
- **[scripts/setup.sh](scripts/setup.sh)** - Automated setup
- **[scripts/test-api.sh](scripts/test-api.sh)** - API testing
- **[Makefile](Makefile)** - Common commands

## 📊 Database

### Schema
- **[backend/src/db/schema/](backend/src/db/schema/)** - Drizzle ORM schemas
  - [users.ts](backend/src/db/schema/users.ts) - User accounts
  - [orgs.ts](backend/src/db/schema/orgs.ts) - Organizations
  - [apiKeys.ts](backend/src/db/schema/apiKeys.ts) - API keys
  - [providers.ts](backend/src/db/schema/providers.ts) - LLM providers
  - [requests.ts](backend/src/db/schema/requests.ts) - Request logs
  - [billingEvents.ts](backend/src/db/schema/billingEvents.ts) - Billing
  - [routingPolicies.ts](backend/src/db/schema/routingPolicies.ts) - Routing

### Migrations
- **[backend/src/db/migrate.ts](backend/src/db/migrate.ts)** - Migration runner
- **[backend/src/db/seed.ts](backend/src/db/seed.ts)** - Seed data
- **[drizzle.config.ts](drizzle.config.ts)** - Drizzle configuration

## 🔧 Configuration Files

### TypeScript
- **[tsconfig.json](tsconfig.json)** - TypeScript configuration
- **[backend/src/types/fastify.d.ts](backend/src/types/fastify.d.ts)** - Type definitions

### Code Quality
- **[.eslintrc.json](.eslintrc.json)** - ESLint rules
- **[.prettierrc](.prettierrc)** - Prettier formatting
- **[.gitignore](.gitignore)** - Git ignore rules

### Package Management
- **[package.json](package.json)** - Dependencies and scripts

## 📱 By Feature

### Authentication
- API: [docs/API.md#authentication-endpoints](docs/API.md)
- Service: [backend/src/modules/auth/auth.service.ts](backend/src/modules/auth/auth.service.ts)
- Routes: [backend/src/modules/auth/auth.routes.ts](backend/src/modules/auth/auth.routes.ts)
- Tests: [backend/src/modules/auth/auth.service.spec.ts](backend/src/modules/auth/auth.service.spec.ts)

### Provider Connectors (Week 3-4)
- Overview: [backend/src/modules/providers/README.md](backend/src/modules/providers/README.md)
- Coming soon: OpenAI, Anthropic, Mock connectors

### Routing Engine (Week 3-4)
- Overview: [backend/src/modules/routing/README.md](backend/src/modules/routing/README.md)
- Coming soon: Cost, latency, fallback strategies

### Billing (Week 5-6)
- Coming soon

### Dashboard (Week 5-6)
- Coming soon

### SDKs (Week 7-8)
- Coming soon

## 🎯 By Task

### I want to...

#### Set up the project
1. [GET_STARTED.md](GET_STARTED.md) - Quick start
2. [scripts/setup.sh](scripts/setup.sh) - Run setup script
3. [docker-compose.yml](docker-compose.yml) - Start services

#### Understand the architecture
1. [ARCHITECTURE.md](ARCHITECTURE.md) - System design
2. [VISUAL_OVERVIEW.md](VISUAL_OVERVIEW.md) - Diagrams
3. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - File organization

#### Use the API
1. [docs/API.md](docs/API.md) - API reference
2. [scripts/test-api.sh](scripts/test-api.sh) - Test script
3. [backend/src/app.spec.ts](backend/src/app.spec.ts) - Example requests

#### Add a new feature
1. [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide
2. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Module structure
3. [backend/src/modules/](backend/src/modules/) - Example modules

#### Deploy the application
1. [docker-compose.yml](docker-compose.yml) - Docker setup
2. [Dockerfile](Dockerfile) - Container build
3. [.github/workflows/ci.yml](.github/workflows/ci.yml) - CI/CD

#### Troubleshoot issues
1. [GET_STARTED.md#troubleshooting](GET_STARTED.md#troubleshooting)
2. [QUICKSTART.md#troubleshooting](QUICKSTART.md#troubleshooting)
3. [README.md#support](README.md#support)

## 📅 By Week

### Week 1-2 (✅ Complete)
- [WEEK_1_2_SUMMARY.md](WEEK_1_2_SUMMARY.md) - Summary
- [README.md#week-1-2-foundation](README.md) - Overview
- All core files listed above

### Week 3-4 (🔄 Next)
- [backend/src/modules/providers/README.md](backend/src/modules/providers/README.md)
- [backend/src/modules/routing/README.md](backend/src/modules/routing/README.md)
- Coming soon: Provider connectors, routing engine

### Week 5-6 (⏳ Future)
- Coming soon: Dashboard, billing system

### Week 7-8 (⏳ Future)
- Coming soon: SDKs, documentation site

### Week 9-10 (⏳ Future)
- Coming soon: Kubernetes, enterprise features

### Week 11-12 (⏳ Future)
- Coming soon: Launch, monitoring

## 🔍 Quick Reference

### Common Commands

```bash
# Setup
npm install
npm run db:migrate
npm run db:seed

# Development
npm run dev
npm run db:studio

# Testing
npm test
npm run test:coverage

# Docker
docker-compose up -d
docker-compose logs -f backend

# Make
make help
make dev
make test
```

### Key URLs

- **API**: http://localhost:3000
- **Health**: http://localhost:3000/health
- **Drizzle Studio**: http://localhost:4983
- **Prometheus**: http://localhost:9090 (with monitoring profile)
- **Grafana**: http://localhost:3001 (with monitoring profile)

### Demo Credentials

- **Email**: demo@airouter.dev
- **Password**: demo123

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/airouter/issues)
- **Email**: support@airouter.dev
- **Discord**: Coming soon

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development setup
- Code style guide
- Commit conventions
- Pull request process

## 📄 License

[MIT License](LICENSE)

---

## Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| README.md | ✅ Complete | Week 1-2 |
| GET_STARTED.md | ✅ Complete | Week 1-2 |
| QUICKSTART.md | ✅ Complete | Week 1-2 |
| ARCHITECTURE.md | ✅ Complete | Week 1-2 |
| docs/API.md | 🔄 Partial | Week 1-2 (Auth only) |
| CONTRIBUTING.md | ✅ Complete | Week 1-2 |
| WEEK_1_2_SUMMARY.md | ✅ Complete | Week 1-2 |
| VISUAL_OVERVIEW.md | ✅ Complete | Week 1-2 |
| PROJECT_STRUCTURE.md | ✅ Complete | Week 1-2 |

---

**Need something else?** Check the [README.md](README.md) or open an issue!

