# 🚀 Get Started with AIRouter

Welcome to AIRouter! This guide will get you up and running in minutes.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 20+** - [Download](https://nodejs.org/)
- ✅ **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- ✅ **Git** - [Download](https://git-scm.com/)

## 🎯 Quick Start (5 Minutes)

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd AIRouter
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Setup Environment

```bash
# Copy environment template
cp .env.example .env

# The default values work for local development
# No changes needed for now!
```

### Step 4: Start Services

**Option A: Using Docker Compose (Recommended)**

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Wait a few seconds for services to be ready
# Then run migrations
npm run db:migrate

# Seed the database with demo data
npm run db:seed
```

**Option B: Using Make**

```bash
make dev
```

### Step 5: Start the Server

```bash
npm run dev
```

You should see:

```
🚀 AIRouter server is running on http://0.0.0.0:3000
📚 Health check: http://0.0.0.0:3000/health
```

### Step 6: Test the API

Open a new terminal and run:

```bash
# On Windows PowerShell
curl http://localhost:3000/health

# Or visit in your browser
# http://localhost:3000/health
```

You should see:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 1.234
}
```

## 🎉 Success! What's Next?

### Try the Demo Account

The seed script created a demo account:

- **Email**: demo@airouter.dev
- **Password**: demo123

### Login via API

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@airouter.dev\",\"password\":\"demo123\"}"
```

Save the `token` from the response!

### Create Your Own Account

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"you@example.com\",\"password\":\"yourpassword\",\"name\":\"Your Name\",\"orgName\":\"Your Org\"}"
```

### Create an API Key

```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"My First Key\",\"permissions\":[\"read\",\"write\"]}"
```

**Important**: Save the API key! It starts with `sk-air-` and won't be shown again.

## 🔧 Development Tools

### Drizzle Studio (Database GUI)

View and edit your database:

```bash
npm run db:studio
```

Opens at: http://localhost:4983

### View Logs

```bash
# Docker logs
docker-compose logs -f backend

# Or if running locally, logs appear in terminal
```

### Run Tests

```bash
npm test
```

### Check Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

## 📚 Learn More

### Essential Documentation

1. **[README.md](README.md)** - Complete overview
2. **[QUICKSTART.md](QUICKSTART.md)** - Detailed quick start
3. **[docs/API.md](docs/API.md)** - API reference
4. **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture

### Key Concepts

#### 1. Organizations (Multi-Tenant)

Every user belongs to an organization. Organizations have:
- Credit balance (for API usage)
- Multiple users
- Multiple API keys
- Usage tracking

#### 2. API Keys

Two types of authentication:
- **JWT Tokens**: For dashboard/user management
- **API Keys**: For programmatic access (starts with `sk-air-`)

#### 3. Credits

- Stored in cents (100 cents = $1)
- Deducted per API request
- Demo account starts with $1,000 credits

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
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
```

### Migration Errors

```bash
# Reset database
docker-compose down -v
docker-compose up -d postgres redis
sleep 5
npm run db:migrate
npm run db:seed
```

### "Module not found" Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 🎓 Next Steps

### Week 3-4: Add LLM Providers

Coming soon:
- OpenAI integration
- Anthropic integration
- Smart routing engine
- Response caching

### Week 5-6: Build Dashboard

Coming soon:
- React dashboard
- Usage analytics
- Billing management
- API key management UI

### Week 7-8: Create SDKs

Coming soon:
- Node.js SDK
- Python SDK
- API documentation site

## 💡 Pro Tips

### Use Make Commands

```bash
make help           # See all available commands
make dev            # Start development
make test           # Run tests
make logs           # View logs
make clean          # Clean everything
```

### Environment Variables

Key variables in `.env`:

```bash
PORT=3000                    # Server port
DATABASE_URL=postgresql://...  # Database connection
REDIS_URL=redis://...         # Redis connection
JWT_SECRET=...               # JWT signing key (change in production!)
API_KEY_PREFIX=sk-air        # API key prefix
```

### Database Migrations

```bash
# 1. Edit schema in backend/src/db/schema/
# 2. Generate migration
npm run db:generate

# 3. Review in backend/src/db/migrations/
# 4. Apply migration
npm run db:migrate
```

## 🆘 Need Help?

- **Documentation**: Check [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/airouter/issues)
- **Email**: support@airouter.dev
- **Discord**: Coming soon!

## ✅ Checklist

Before you start developing:

- [ ] Node.js 20+ installed
- [ ] Docker Desktop running
- [ ] Dependencies installed (`npm install`)
- [ ] Services running (`docker-compose up -d`)
- [ ] Migrations applied (`npm run db:migrate`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] Server running (`npm run dev`)
- [ ] Health check passes (http://localhost:3000/health)
- [ ] Tests pass (`npm test`)

## 🎊 You're All Set!

You now have a fully functional AIRouter instance running locally.

**What you can do:**
- ✅ Create users and organizations
- ✅ Generate API keys
- ✅ Authenticate requests
- ✅ Track usage and billing
- ✅ View data in Drizzle Studio

**Coming next (Week 3-4):**
- 🔄 Connect to OpenAI and Anthropic
- 🔄 Route requests intelligently
- 🔄 Cache responses
- 🔄 Track costs and usage

---

Happy coding! 🚀

If you found this helpful, please ⭐ star the repository!

