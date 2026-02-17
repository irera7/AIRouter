# ✅ نصب و راه‌اندازی AIRouter با موفقیت انجام شد!

## 🎉 خلاصه کارهای انجام شده

### 1. نصب پیش‌نیازها
- ✅ **Node.js 20.19.5** - نصب و پیکربندی شد
- ✅ **npm 10.8.2** - به همراه Node.js نصب شد
- ✅ **Docker 29.0.0** - نصب و راه‌اندازی شد
- ✅ **Docker Compose v2.40.3** - نصب شد

### 2. راه‌اندازی پروژه
- ✅ فایل `.env` ایجاد شد
- ✅ وابستگی‌های Node.js (428 پکیج) نصب شدند
- ✅ PostgreSQL container راه‌اندازی شد (پورت 5432)
- ✅ Redis container راه‌اندازی شد (پورت 6379)

### 3. دیتابیس
- ✅ Migration های دیتابیس اجرا شدند (7 جدول)
- ✅ دیتابیس با داده‌های اولیه Seed شد
- ✅ یک حساب کاربری Demo ایجاد شد

### 4. تست موفقیت‌آمیز
- ✅ سرور Development با موفقیت اجرا شد
- ✅ اتصال به PostgreSQL برقرار شد
- ✅ اتصال به Redis برقرار شد

---

## 🔑 اطلاعات دسترسی Demo

### حساب کاربری Demo
- **ایمیل:** `demo@airouter.dev`
- **رمز عبور:** `demo123`
- **API Key:** `sk-air-x-vy7KKTN86so12RmhqgnXi4HXFXd_e7`
- **اعتبار اولیه:** $1,000 (100,000 سنت)

### سرویس‌های در حال اجرا
- **API Server:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

---

## 🚀 راه‌اندازی سرور

### روش 1: اجرای مستقیم
```bash
cd /home/reza/AIRouter
npm run dev
```

### روش 2: استفاده از Makefile (اگر وجود دارد)
```bash
make dev
```

سرور در آدرس `http://localhost:3000` اجرا خواهد شد.

---

## 📝 تست API

### 1. بررسی وضعیت سرور (Health Check)
```bash
curl http://localhost:3000/health
```

**پاسخ مورد انتظار:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-11T...",
  "uptime": 1.234
}
```

### 2. ورود به سیستم (Login)
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@airouter.dev","password":"demo123"}'
```

**پاسخ شامل `token` برای درخواست‌های بعدی خواهد بود.**

### 3. ثبت‌نام کاربر جدید
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email":"your@email.com",
    "password":"yourpassword",
    "name":"Your Name",
    "orgName":"Your Organization"
  }'
```

### 4. ایجاد API Key جدید
```bash
curl -X POST http://localhost:3000/api/v1/auth/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"My Production Key",
    "permissions":["read","write"]
  }'
```

### 5. لیست API Key های موجود
```bash
curl -X GET http://localhost:3000/api/v1/auth/api-keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🗄️ مدیریت دیتابیس

### Drizzle Studio (رابط گرافیکی دیتابیس)
```bash
npm run db:studio
```
سپس به آدرس `http://localhost:4983` بروید.

### ساخت Migration جدید
```bash
# 1. تغییرات در schema را اعمال کنید (در backend/src/db/schema/)
# 2. Migration را generate کنید
npm run db:generate

# 3. Migration را اجرا کنید
npm run db:migrate
```

### Reset کردن دیتابیس
```bash
docker compose down -v
docker compose up -d postgres redis
sleep 10
npm run db:migrate
npm run db:seed
```

---

## 🐳 دستورات Docker

### مشاهده وضعیت Container ها
```bash
docker compose ps
```

### مشاهده Logs
```bash
# همه سرویس‌ها
docker compose logs -f

# فقط PostgreSQL
docker compose logs -f postgres

# فقط Redis
docker compose logs -f redis
```

### راه‌اندازی مجدد
```bash
docker compose restart postgres
docker compose restart redis
```

### توقف سرویس‌ها
```bash
docker compose down
```

### توقف و حذف کامل (شامل volumes)
```bash
docker compose down -v
```

---

## 📊 ساختار دیتابیس

پروژه شامل 7 جدول اصلی است:

1. **users** - کاربران سیستم
2. **orgs** - سازمان‌ها (multi-tenant)
3. **api_keys** - کلیدهای API
4. **providers** - ارائه‌دهندگان LLM (OpenAI, Anthropic, Mock)
5. **requests** - لاگ درخواست‌ها
6. **billing_events** - رویدادهای مالی و اعتبار
7. **routing_policies** - قوانین مسیریابی

---

## 🔧 عیب‌یابی

### سرور start نمی‌شود
```bash
# بررسی وضعیت Docker
docker compose ps

# راه‌اندازی مجدد سرویس‌ها
docker compose restart postgres redis

# بررسی logs
docker compose logs postgres redis
```

### خطای اتصال به PostgreSQL
```bash
# بررسی اینکه PostgreSQL در حال اجراست
docker compose ps postgres

# بررسی logs
docker compose logs postgres

# راه‌اندازی مجدد
docker compose restart postgres
```

### خطای اتصال به Redis
```bash
# بررسی وضعیت Redis
docker compose ps redis

# راه‌اندازی مجدد
docker compose restart redis
```

### Port 3000 در حال استفاده است
```bash
# پیدا کردن پروسس
sudo lsof -i :3000

# از بین بردن پروسس
sudo kill -9 <PID>
```

---

## 📚 مسیر پروژه (Roadmap)

### ✅ Week 1-2: پایه‌گذاری (تکمیل شده)
- ✅ راه‌اندازی پروژه و Docker
- ✅ احراز هویت و مدیریت API Key
- ✅ Schema دیتابیس
- ✅ تست‌های اولیه

### 🔄 Week 3-4: اتصال به ارائه‌دهندگان (بعدی)
- [ ] اتصال به OpenAI API
- [ ] اتصال به Anthropic API
- [ ] Mock Provider برای تست
- [ ] موتور مسیریابی (cost-based, latency-based)
- [ ] Cache کردن پاسخ‌ها با Redis

### 📋 Week 5-6: داشبورد و صورتحساب
- [ ] داشبورد React
- [ ] آنالیز مصرف
- [ ] سیستم صورتحساب
- [ ] مدیریت اعتبار

### 🔧 Week 7-8: SDK و مستندات
- [ ] SDK Node.js
- [ ] SDK Python
- [ ] مستندات API (Docusaurus)
- [ ] Webhook Support

### 🏢 Week 9-10: قابلیت‌های Enterprise
- [ ] Deployment روی Kubernetes
- [ ] پشتیبانی چند منطقه‌ای
- [ ] قوانین مسیریابی پیشرفته
- [ ] برنامه Pilot

### 🚀 Week 11-12: راه‌اندازی Production
- [ ] Monitoring در Production
- [ ] بهینه‌سازی Performance
- [ ] بررسی امنیتی
- [ ] راه‌اندازی عمومی

---

## 🛠️ دستورات مفید

### بررسی پیش‌نیازها
```bash
./scripts/check-prerequisites.sh
```

### نصب خودکار پیش‌نیازها
```bash
sudo ./scripts/install-prerequisites.sh
```

### اجرای تست‌ها
```bash
npm test
```

### بررسی کیفیت کد
```bash
# Linting
npm run lint

# Formatting
npm run format
```

---

## 📖 مستندات بیشتر

- **[README.md](README.md)** - نمای کلی پروژه
- **[GET_STARTED.md](GET_STARTED.md)** - راهنمای شروع سریع
- **[SETUP_PREREQUISITES.md](SETUP_PREREQUISITES.md)** - راهنمای نصب پیش‌نیازها (فارسی)
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - معماری سیستم
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - راهنمای مشارکت

---

## 🎯 مرحله بعدی: Week 3-4

برای شروع مرحله بعدی (اتصال به ارائه‌دهندگان LLM):

1. **دریافت API Key ها**
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/

2. **اضافه کردن به .env**
   ```bash
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **پیاده‌سازی Provider Connectors**
   - مطالعه `backend/src/modules/providers/`
   - پیاده‌سازی interface های provider

4. **تست Integration**
   - نوشتن تست‌ها برای هر provider
   - تست end-to-end

---

## 💡 نکات مهم

1. **امنیت:**
   - هرگز API Key های واقعی را commit نکنید
   - JWT_SECRET را در production تغییر دهید
   - از HTTPS در production استفاده کنید

2. **Performance:**
   - از Redis برای cache استفاده کنید
   - Connection pooling برای PostgreSQL
   - Rate limiting برای API

3. **Monitoring:**
   - Log های مهم را دنبال کنید
   - Prometheus metrics را راه‌اندازی کنید
   - Alert ها را پیکربندی کنید

---

## 🆘 پشتیبانی

در صورت بروز مشکل:

1. ابتدا این فایل و مستندات را بررسی کنید
2. لاگ‌های Docker و سرور را چک کنید
3. از اسکریپت `check-prerequisites.sh` استفاده کنید
4. Issues در GitHub را بررسی کنید

---

**تبریک! پروژه AIRouter شما آماده توسعه است! 🚀**

برای شروع کار:
```bash
cd /home/reza/AIRouter
npm run dev
```

سپس به `http://localhost:3000/health` بروید تا وضعیت سرور را بررسی کنید.

