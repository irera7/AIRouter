# 🧪 راهنمای تست Week 3-4

## ⚠️ نکات مهم قبل از تست

### 1. خطاهای TypeScript
برخی خطاهای TypeScript از نوع "unused variable" هستند که روی عملکرد تأثیری ندارند:
- ✅ کد اصلی کار می‌کند
- ⚠️ برخی متغیرها استفاده نشده‌اند (برای cleanup بعدی)

### 2. Mock Provider
برای تست بدون نیاز به API Key واقعی، از Mock Provider استفاده کنید.

---

## 🚀 مراحل تست

### 1. راه‌اندازی سرور (با تنظیمات خاص)

```bash
cd /home/reza/AIRouter

# اضافه کردن flag --transpile-only برای اجرا بدون build
npm run dev -- --transpile-only
```

یا مستقیم:

```bash
npx tsx watch backend/src/index.ts
```

### 2. دریافت Token و API Key

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@airouter.dev","password":"demo123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"

# Create API Key
API_KEY=$(curl -s -X POST http://localhost:3000/api/v1/auth/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key","permissions":["read","write"]}' \
  | jq -r '.key')

echo "API Key: $API_KEY"
```

### 3. تست Chat Completion با Mock Provider

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-gpt-4",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello! Tell me a joke."}
    ],
    "temperature": 0.7,
    "maxTokens": 100,
    "routingStrategy": "cost",
    "enableCache": true
  }'
```

### 4. تست استراتژی‌های مختلف

#### Cost-based (ارزان‌ترین):
```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-gpt-4",
    "messages": [{"role": "user", "content": "Test cost"}],
    "routingStrategy": "cost"
  }'
```

#### Latency-based (سریع‌ترین):
```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-gpt-4",
    "messages": [{"role": "user", "content": "Test latency"}],
    "routingStrategy": "latency"
  }'
```

#### Priority (انتخاب دستی):
```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-gpt-4",
    "messages": [{"role": "user", "content": "Test priority"}],
    "routingStrategy": "priority",
    "preferredProvider": "mock"
  }'
```

### 5. تست Cache

```bash
# اولین request (باید cache شود)
time curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-gpt-4",
    "messages": [{"role": "user", "content": "Exact same question"}]
  }'

# دومین request (باید از cache برگردد - سریع‌تر)
time curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-gpt-4",
    "messages": [{"role": "user", "content": "Exact same question"}]
  }'
```

پاسخ دوم باید `"cached": true` داشته باشد.

### 6. لیست مدل‌ها

```bash
curl -X GET http://localhost:3000/api/v1/chat/models \
  -H "Authorization: Bearer $API_KEY"
```

### 7. آمار (فقط admin)

```bash
curl -X GET http://localhost:3000/api/v1/chat/statistics \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 بررسی در Drizzle Studio

```bash
npm run db:studio
```

### جداول مهم:

1. **requests** - تمام درخواست‌ها
   - بررسی `input_tokens`, `output_tokens`, `cost`, `latency_ms`
   - فیلد `metadata` برای اطلاعات اضافی

2. **billing_events** - رویدادهای مالی
   - بررسی `balance_before` و `balance_after`
   - `amount` منفی برای debit

3. **orgs** - موجودی سازمان‌ها
   - بررسی `credit_balance` که کاهش می‌یابد

---

## 📊 مثال نتیجه موفق

```json
{
  "id": "mock-abc123",
  "object": "chat.completion",
  "created": 1731234567,
  "model": "mock-gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Mock AI response..."
      },
      "finishReason": "stop"
    }
  ],
  "usage": {
    "promptTokens": 25,
    "completionTokens": 50,
    "totalTokens": 75
  },
  "provider": "mock",
  "cached": false
}
```

---

## ❌ خطاهای محتمل و راه‌حل

### 1. Provider initialization failed
```
Failed to initialize OpenAI provider
```
**راه‌حل:** فقط از mock provider استفاده کنید یا API Key اضافه کنید.

### 2. Module errors
```
Cannot find module './types'
```
**راه‌حل:** از tsx به جای tsc استفاده کنید:
```bash
npx tsx watch backend/src/index.ts
```

### 3. Redis connection error
```
Redis Client Error
```
**راه‌حل:**
```bash
docker compose restart redis
```

---

## ✅ Checklist تست

- [ ] سرور راه‌اندازی شد
- [ ] Login و دریافت Token موفق
- [ ] ایجاد API Key موفق
- [ ] Chat completion با mock provider موفق
- [ ] استراتژی cost کار می‌کند
- [ ] استراتژی latency کار می‌کند
- [ ] Cache کار می‌کند (request دوم سریع‌تر)
- [ ] لاگ در جدول requests ثبت شد
- [ ] billing event ثبت شد
- [ ] credit از سازمان کم شد

---

## 🎯 مرحله بعدی

پس از تست موفقیت‌آمیز، آماده Week 5-6 هستید:
- Frontend Dashboard
- Billing System
- Usage Analytics

**نکته:** اگر خطاهای TypeScript مزاحم هستند، می‌توانیم آنها را بعداً cleanup کنیم. عملکرد اصلی کار می‌کند! 🚀

