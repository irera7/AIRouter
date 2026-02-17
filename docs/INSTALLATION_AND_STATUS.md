# 🚀 AIRouter - وضعیت نصب و راه‌اندازی

**تاریخ:** 11 نوامبر 2025  
**نسخه:** 0.1.0  
**وضعیت:** ✅ عملیاتی (Week 3-4 تکمیل شده)

---

## 📊 وضعیت فعلی سیستم

### ✅ سرور در حال اجرا
```
🟢 Server: http://localhost:3000
🟢 Health: http://localhost:3000/health
🟢 API: http://localhost:3000/api/v1/*
🟢 Database: PostgreSQL (running on port 5432)
🟢 Cache: Redis (running on port 6379)
```

### ✅ Providers فعال
- **Mock Provider**: فعال و آماده (برای testing)
- **OpenAI**: غیرفعال (نیاز به API key)
- **Anthropic**: غیرفعال (نیاز به API key)

---

## 🎯 قابلیت‌های پیاده‌سازی شده

### Week 1-2 ✅
- [x] Fastify server setup
- [x] PostgreSQL + Drizzle ORM
- [x] Redis integration
- [x] JWT authentication
- [x] API key management
- [x] Database schema & migrations
- [x] Seed data

### Week 3-4 ✅
- [x] Provider integration (OpenAI, Anthropic, Mock)
- [x] Routing engine (4 strategies)
- [x] Redis caching layer
- [x] Request logging system
- [x] Usage tracking & billing
- [x] Chat completions API
- [x] Unit & integration tests
- [x] Documentation

---

## 🧪 نتایج تست‌های موفق

```bash
✅ Health Check - PASSED
✅ Authentication & Login - PASSED
✅ API Key Creation - PASSED
✅ Chat Completion (Mock Provider) - PASSED
✅ Response Caching - PASSED
   • First request: cached=false
   • Second request: cached=true ✓
✅ Routing Strategies - PASSED
   • Cost-based routing ✓
   • Latency-based routing ✓
   • Priority-based routing ✓
✅ List Available Models - PASSED
✅ System Statistics - PASSED

📊 Total: 8/8 Tests Passed 🎉
```

---

## 🔑 دسترسی به سیستم

### Test Credentials
```
Email: demo@airouter.dev
Password: demo123
```

### دریافت API Key

1. **Login:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@airouter.dev","password":"demo123"}'
```

2. **Create API Key:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"name":"My API Key","permissions":["read","write"]}'
```

---

## 💬 استفاده از Chat Completions API

### Example Request

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer {YOUR_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-gpt-4",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "سلام! چطوری؟"}
    ],
    "temperature": 0.7,
    "maxTokens": 150,
    "routingStrategy": "cost",
    "enableCache": true
  }'
```

### Response Example

```json
{
  "id": "mock-abc123",
  "object": "chat.completion",
  "created": 1699000000,
  "model": "mock-gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "سلام! خوبم ممنون! شما چطور هستید؟"
      },
      "finishReason": "stop"
    }
  ],
  "usage": {
    "promptTokens": 15,
    "completionTokens": 12,
    "totalTokens": 27
  },
  "provider": "mock",
  "cached": false
}
```

---

## 🎮 دستورات مهم

### راه‌اندازی سرور
```bash
cd /home/reza/AIRouter

# شروع services (database + redis)
docker-compose up -d

# اجرای سرور development
npm run dev

# اجرای سرور production
npm run build
npm start
```

### Database Management
```bash
# اجرای migrations
npm run db:push

# Seed کردن database
npm run db:seed

# Generate migration files
npm run db:generate

# استودیو Drizzle (UI برای database)
npm run db:studio
```

### Testing
```bash
# اجرای تمام تست‌ها
./run-tests.sh

# Unit tests
npm test

# Build check
npm run build
```

### مدیریت Docker
```bash
# شروع services
docker-compose up -d

# توقف services
docker-compose down

# مشاهده logs
docker-compose logs -f

# پاک کردن volumes
docker-compose down -v
```

---

## 📁 ساختار پروژه

```
/home/reza/AIRouter/
├── backend/
│   └── src/
│       ├── modules/
│       │   ├── auth/         # Authentication & API keys
│       │   ├── providers/    # LLM provider connectors
│       │   ├── routing/      # Routing engine
│       │   └── chat/         # Chat completions service
│       ├── db/
│       │   └── schema/       # Database schemas
│       ├── plugins/          # Fastify plugins
│       ├── utils/            # Utilities (cache, logger, etc)
│       ├── app.ts           # Fastify app
│       └── index.ts         # Entry point
├── docker-compose.yml       # Docker services
├── drizzle.config.ts       # Drizzle ORM config
├── package.json            # Dependencies & scripts
├── .env                    # Environment variables
└── run-tests.sh           # Test script
```

---

## 🔧 Environment Variables

فایل `.env` حاوی متغیرهای زیر است:

```bash
# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Database
DATABASE_URL=postgresql://airouter:airouter123@localhost:5432/airouter

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# LLM Providers (اختیاری - برای فعال کردن providers واقعی)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

---

## 🎯 Routing Strategies

AIRouter از 4 استراتژی routing پشتیبانی می‌کند:

### 1. Cost-Based Routing
انتخاب ارزان‌ترین provider
```json
{
  "routingStrategy": "cost"
}
```

### 2. Latency-Based Routing
انتخاب سریع‌ترین provider
```json
{
  "routingStrategy": "latency"
}
```

### 3. Priority-Based Routing
استفاده از provider مشخص با fallback
```json
{
  "routingStrategy": "priority",
  "preferredProvider": "openai"
}
```

### 4. Fallback Strategy
تلاش با providers به ترتیب
```json
{
  "routingStrategy": "fallback"
}
```

---

## 💾 Caching

سیستم caching خودکار با Redis:

- **TTL**: 1 ساعت
- **Cache Key**: MD5 hash از request parameters
- **Enable/Disable**: پارامتر `enableCache` در request

```json
{
  "model": "gpt-4",
  "messages": [...],
  "enableCache": true
}
```

مزایا:
- ⚡ پاسخ فوری برای request‌های تکراری
- 💰 صرفه‌جویی در هزینه API
- 📊 کاهش load بر روی providers

---

## 📊 Monitoring & Statistics

### System Statistics
```bash
GET /api/v1/chat/statistics
Authorization: Bearer {api_key}
```

**Response:**
```json
{
  "providers": {
    "totalProviders": 1,
    "activeProviders": 1,
    "providers": [
      {
        "name": "mock",
        "displayName": "Mock Provider",
        "isActive": true,
        "supportedModels": ["mock-gpt-4", "mock-claude-3"],
        "metrics": {
          "totalRequests": 5,
          "successfulRequests": 5,
          "failedRequests": 0,
          "averageLatency": 100.8
        }
      }
    ]
  },
  "routing": { ... }
}
```

### Available Models
```bash
GET /api/v1/chat/models
Authorization: Bearer {api_key}
```

---

## 🔒 Security Features

- ✅ API Key authentication
- ✅ JWT token validation
- ✅ bcrypt password hashing
- ✅ Zod input validation
- ✅ SQL injection protection (Drizzle ORM)
- ✅ CORS support
- ✅ Rate limiting ready

---

## 📚 مستندات

### فایل‌های مستندات موجود:
- `README.md` - Overview پروژه
- `GET_STARTED.md` - راهنمای شروع
- `SETUP_PREREQUISITES.md` - نصب پیش‌نیازها
- `WEEK_3_4_COMPLETE.md` - گزارش تکمیل Week 3-4
- `INSTALLATION_AND_STATUS.md` - این فایل

### Scripts مفید:
- `scripts/check-prerequisites.sh` - چک کردن پیش‌نیازها
- `scripts/install-prerequisites.sh` - نصب خودکار
- `run-tests.sh` - تست کامل سیستم

---

## 🐛 Troubleshooting

### سرور راه نمی‌افتد
```bash
# چک کردن port 3000
lsof -i :3000

# kill کردن process قبلی
pkill -f "tsx watch"

# restart کردن
npm run dev
```

### Database connection error
```bash
# چک کردن PostgreSQL
docker-compose ps

# restart کردن services
docker-compose restart postgres

# مشاهده logs
docker-compose logs postgres
```

### Redis connection error
```bash
# چک کردن Redis
docker-compose ps

# restart کردن
docker-compose restart redis

# test connection
redis-cli ping
```

---

## 🚀 مراحل بعدی (Week 5-6)

طبق roadmap پروژه، مرحله بعدی شامل:

### Week 5-6: Usage Tracking & Analytics Dashboard
- [ ] Real-time usage dashboard
- [ ] Advanced analytics
- [ ] Cost breakdown by user/organization
- [ ] Usage alerts & notifications
- [ ] Export usage reports
- [ ] Visualization charts

---

## ✅ چک‌لیست وضعیت

- [x] ✅ Node.js 20+ نصب شد
- [x] ✅ Docker & Docker Compose نصب شد
- [x] ✅ Dependencies نصب شد
- [x] ✅ Database راه‌اندازی شد
- [x] ✅ Redis راه‌اندازی شد
- [x] ✅ Migrations اجرا شد
- [x] ✅ Seed data اضافه شد
- [x] ✅ Server در حال اجرا است
- [x] ✅ Authentication کار می‌کند
- [x] ✅ Chat completions کار می‌کند
- [x] ✅ Caching کار می‌کند
- [x] ✅ Routing strategies کار می‌کند
- [x] ✅ تمام تست‌ها موفق هستند

---

## 📞 Status Summary

```
🎯 Project: AIRouter MVP
📅 Date: 11 نوامبر 2025
🏗️ Phase: Week 3-4 (Completed)
✅ Status: Operational
🧪 Tests: 8/8 Passed
🚀 Server: Running on http://localhost:3000
💾 Database: PostgreSQL (Connected)
🔴 Cache: Redis (Connected)
```

---

## 🎉 نتیجه‌گیری

سیستم AIRouter با موفقیت راه‌اندازی شد و تمامی قابلیت‌های Week 3-4 پیاده‌سازی و تست شدند:

✅ **Provider Integration** - اتصال به LLM providers  
✅ **Routing Engine** - 4 استراتژی هوشمند  
✅ **Caching Layer** - کش کردن با Redis  
✅ **Request Logging** - ثبت تمام requests  
✅ **Usage Tracking** - پیگیری استفاده و هزینه  
✅ **Chat API** - endpoint کامل `/api/v1/chat/completions`  
✅ **Testing** - تست‌های جامع  
✅ **Documentation** - مستندات کامل  

**سیستم آماده برای ادامه توسعه (Week 5-6) است!** 🚀

---

**Last Updated:** 11 نوامبر 2025  
**Maintained by:** AIRouter Development Team

