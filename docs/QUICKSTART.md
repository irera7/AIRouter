# AIRouter Quick Start Guide

Get AIRouter up and running in 5 minutes!

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd AIRouter
```

### 2. Run Setup Script

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

This will:
- Install dependencies
- Create `.env` file
- Start PostgreSQL and Redis
- Run database migrations
- Seed initial data

### 3. Start the Server

```bash
npm run dev
```

The server will start at http://localhost:3000

## Verify Installation

### Check Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 1.234
}
```

### Run API Tests

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

This will test all authentication endpoints and create a test API key.

## Your First API Request

### 1. Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "yourpassword",
    "name": "Your Name",
    "orgName": "Your Organization"
  }'
```

Save the `token` from the response.

### 2. Create an API Key

```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My First API Key",
    "permissions": ["read", "write"]
  }'
```

Save the `key` from the response (starts with `sk-air-`).

### 3. Use Your API Key

```bash
# Coming in Week 3-4: Chat completions endpoint
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer sk-air-YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## Demo Credentials

The seed script creates a demo account:

- **Email**: demo@airouter.dev
- **Password**: demo123

Login to get a JWT token:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@airouter.dev",
    "password": "demo123"
  }'
```

## Database Management

### View Database in Drizzle Studio

```bash
npm run db:studio
```

Opens at http://localhost:4983

### Create New Migration

```bash
# 1. Modify schema in backend/src/db/schema/
# 2. Generate migration
npm run db:generate

# 3. Review migration in backend/src/db/migrations/
# 4. Run migration
npm run db:migrate
```

### Reset Database

```bash
docker-compose down -v
docker-compose up -d postgres redis
npm run db:migrate
npm run db:seed
```

## Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Clean everything (including volumes)
docker-compose down -v
```

## Development Workflow

### 1. Start Services

```bash
make dev
# or
npm run dev
```

### 2. Make Changes

Edit files in `backend/src/`

The server will automatically reload (using tsx watch).

### 3. Run Tests

```bash
npm test
```

### 4. Check Linting

```bash
npm run lint
```

### 5. Format Code

```bash
npm run format
```

## Monitoring (Optional)

Start with monitoring enabled:

```bash
docker-compose --profile monitoring up -d
```

Access:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Redis Connection Error

```bash
# Check if Redis is running
docker-compose ps

# Restart Redis
docker-compose restart redis

# Check logs
docker-compose logs redis
```

### Migration Errors

```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
sleep 5

# Run migrations
npm run db:migrate
```

## Next Steps

1. **Week 3-4**: Implement provider connectors
   - OpenAI integration
   - Anthropic integration
   - Mock provider for testing

2. **Week 5-6**: Build dashboard
   - React frontend
   - Usage analytics
   - Billing management

3. **Week 7-8**: Create SDKs
   - Node.js SDK
   - Python SDK
   - API documentation

## Resources

- [Full Documentation](README.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Contributing Guide](CONTRIBUTING.md)
- [API Reference](docs/api.md) (coming soon)

## Support

- GitHub Issues: [Report bugs](https://github.com/yourusername/airouter/issues)
- Email: support@airouter.dev
- Discord: [Join our community](https://discord.gg/airouter) (coming soon)

---

Happy coding! 🚀

