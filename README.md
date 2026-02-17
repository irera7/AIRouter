# 🚀 AIRouter - AI API Marketplace & Router

**AIRouter** is a production-ready AI API marketplace and intelligent router platform that allows developers to seamlessly switch between multiple LLM providers (OpenAI, Anthropic, etc.) with smart routing, analytics, and cost optimization.

## ✨ Features

### Core Features
- 🔐 **JWT Authentication** - Secure user authentication
- 🔑 **API Key Management** - Create, manage, and monitor API keys
- 🤖 **Multi-Provider Support** - OpenAI, Anthropic, and Mock providers
- 🎯 **Smart Routing** - Cost-based, latency-based, priority-based routing
- ⚡ **Redis Caching** - Response caching for improved performance
- 📊 **Advanced Analytics** - Usage metrics, trends, cost breakdown
- 💰 **Billing System** - Credit-based billing with transaction tracking
- 🚨 **Alerting System** - Threshold-based alerts (cost, usage, errors)
- 📈 **Real-time Metrics** - SSE for live dashboard updates
- 👥 **Admin Panel** - User, organization, and provider management

### Production Features
- 🏥 **Health Checks** - Comprehensive, readiness, and liveness probes
- 📡 **Prometheus Metrics** - HTTP, LLM, cache, DB, and business metrics
- 📊 **Grafana Dashboards** - Pre-configured monitoring dashboards
- 🐳 **Docker Ready** - Multi-stage builds, optimized images
- 🔧 **Rate Limiting** - Per-user/org rate limits
- 📝 **Audit Logging** - Track all admin actions
- 🎨 **Modern Frontend** - Next.js 14 with TypeScript & Tailwind CSS

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  Login │ Dashboard │ API Keys │ Analytics │ Admin Panel     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  Backend API (Fastify)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │     Chat     │  │  Analytics   │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Admin     │  │   Routing    │  │    Alert     │      │
│  │   Service    │  │   Engine     │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐  ┌──────▼──────┐  ┌───────▼────────┐
│   PostgreSQL   │  │    Redis    │  │  LLM Providers │
│   (Database)   │  │   (Cache)   │  │  OpenAI, etc.  │
└────────────────┘  └─────────────┘  └────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd AIRouter
```

2. **Install dependencies:**
```bash
npm install
cd frontend && npm install && cd ..
```

3. **Setup environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start all services:**
```bash
./start.sh
```

That's it! The script will:
- ✅ Stop any running services on ports 3000/3001
- ✅ Start Docker containers (PostgreSQL, Redis)
- ✅ Run database migrations
- ✅ Start Backend API (port 3000)
- ✅ Start Frontend (port 3001)

### Management Scripts

```bash
# Start everything
./start.sh

# Check status
./status.sh

# Restart services
./restart.sh

# Stop services
./stop.sh
```

See [SCRIPTS.md](SCRIPTS.md) for detailed documentation.

## 🔗 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | User interface |
| **Backend API** | http://localhost:3000 | REST API |
| **Health Check** | http://localhost:3000/health | System health |
| **Metrics** | http://localhost:3000/metrics | Prometheus metrics |

## 🔐 Default Credentials

```
Email:    demo@airouter.dev
Password: demo123
```

## 📚 API Documentation

### Authentication
```bash
# Register
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure123"
}

# Login
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "secure123"
}
```

### Chat Completions
```bash
# Send chat completion request
POST /api/v1/chat/completions
Headers: X-API-Key: your-api-key
{
  "messages": [
    {
      "role": "user",
      "content": "Hello!"
    }
  ],
  "model": "gpt-4",
  "strategy": "cost-optimized"
}
```

### Analytics
```bash
# Get analytics summary
GET /api/v1/analytics/summary

# Get detailed metrics
GET /api/v1/analytics/metrics?timeRange=7d

# Get provider statistics
GET /api/v1/analytics/providers

# Export data
GET /api/v1/analytics/export?format=csv&timeRange=30d
```

### Admin APIs
```bash
# Get all users (requires admin)
GET /api/v1/admin/users

# Get system statistics
GET /api/v1/admin/stats

# Manage providers
GET /api/v1/admin/providers
POST /api/v1/admin/providers
PUT /api/v1/admin/providers/:id
```

See full API documentation at `/docs` (when running).

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and authentication
- **orgs** - Organizations with credit balances
- **api_keys** - API key management
- **requests** - Request logs with metrics
- **billing_events** - Credit transactions
- **providers** - LLM provider configurations
- **routing_policies** - Custom routing rules

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 20+ with TypeScript
- **Framework:** Fastify (high-performance)
- **ORM:** Drizzle ORM
- **Database:** PostgreSQL
- **Cache:** Redis
- **Validation:** Zod
- **Authentication:** JWT (jsonwebtoken)
- **Monitoring:** Prometheus, Grafana

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Charts:** Recharts
- **State:** Zustand
- **Data Fetching:** React Query

### DevOps
- **Containerization:** Docker, Docker Compose
- **Monitoring:** Prometheus, Grafana
- **Health Checks:** Liveness, Readiness probes
- **Load Testing:** Custom Node.js script

## 📁 Project Structure

```
AIRouter/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Authentication
│   │   │   ├── chat/          # Chat completions
│   │   │   ├── analytics/     # Analytics & reporting
│   │   │   ├── admin/         # Admin panel
│   │   │   ├── health/        # Health checks
│   │   │   ├── providers/     # LLM providers
│   │   │   └── routing/       # Routing engine
│   │   ├── db/
│   │   │   └── schema/        # Database schemas
│   │   ├── plugins/           # Fastify plugins
│   │   └── utils/             # Utilities
│   └── dist/                  # Compiled JavaScript
├── frontend/
│   ├── app/                   # Next.js pages
│   │   ├── login/
│   │   ├── register/
│   │   └── dashboard/
│   ├── components/            # React components
│   └── lib/                   # Utilities & API client
├── infra/
│   ├── grafana/              # Grafana dashboards
│   └── prometheus/           # Prometheus config
├── scripts/                  # Utility scripts
├── start.sh                  # Start all services
├── stop.sh                   # Stop all services
├── restart.sh                # Restart services
├── status.sh                 # Check status
└── docker-compose.yml        # Docker setup
```

## 🧪 Testing

### Run Backend Tests
```bash
npm test
```

### Load Testing
```bash
node scripts/load-test.js --users 10 --duration 30
```

## 📊 Monitoring

### Prometheus Metrics
Access at: http://localhost:9090

Available metrics:
- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request latency
- `llm_requests_total` - LLM API calls
- `llm_tokens_total` - Token usage
- `cache_hits_total` / `cache_misses_total` - Cache performance

### Grafana Dashboards
Access at: http://localhost:3001

Pre-configured dashboards:
- AIRouter Overview
- Request Analytics
- System Health
- Provider Performance

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://airouter:password@localhost:5432/airouter

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-change-in-production

# Server
PORT=3000
NODE_ENV=development

# LLM Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Provider Configuration
Configure providers in `backend/src/modules/providers/ProviderManager.ts`

### Routing Strategies
- **cost-optimized** - Choose cheapest provider
- **latency-optimized** - Choose fastest provider
- **priority** - Use provider priority order
- **fallback** - Try providers sequentially

## 🚀 Deployment

### Docker Production Build
```bash
docker build -t airouter-backend -f Dockerfile.backend .
docker build -t airouter-frontend -f Dockerfile.frontend ./frontend
```

### Docker Compose
```bash
docker compose -f docker-compose.prod.yml up -d
```

## 📝 Development

### Scripts
```bash
# Development
npm run dev              # Start backend dev server
npm run build            # Build backend
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database

# Frontend
cd frontend
npm run dev              # Start frontend dev server
npm run build            # Build for production
npm run start            # Start production server
```

### Code Style
- **Linting:** ESLint
- **Formatting:** Prettier (recommended)
- **Type Checking:** TypeScript strict mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

Developed with ❤️ by the AIRouter team

## 📞 Support

- Documentation: See `/docs` folder
- Issues: GitHub Issues
- Email: support@airouter.dev

## 🎉 Acknowledgments

- Fastify team for the excellent framework
- Drizzle team for the ORM
- Next.js team for the frontend framework
- All open-source contributors

---

**Made with ⚡ by AIRouter**
