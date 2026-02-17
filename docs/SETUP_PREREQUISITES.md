# راهنمای نصب پیش‌نیازهای AIRouter

این راهنما شما را قدم‌به‌قدم برای نصب و راه‌اندازی پیش‌نیازهای پروژه AIRouter همراهی می‌کند.

## 📋 پیش‌نیازها

### 1. Node.js (نسخه 20 یا بالاتر)

**وضعیت فعلی:** Node.js v12.22.9 نصب شده (نیاز به ارتقا دارد)

**روش نصب با NVM (پیشنهادی):**

```bash
# نصب NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# بارگذاری NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# نصب Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# بررسی نصب
node --version  # باید v20.x.x نشان دهد
npm --version
```

**روش نصب با apt (جایگزین):**

```bash
# حذف نسخه قدیمی
sudo apt remove nodejs npm

# نصب NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# نصب Node.js
sudo apt install -y nodejs

# بررسی نصب
node --version
npm --version
```

### 2. Docker & Docker Compose

**وضعیت فعلی:** نصب نشده

**روش نصب:**

```bash
# به‌روزرسانی پکیج‌ها
sudo apt update

# نصب پیش‌نیازهای Docker
sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# اضافه کردن GPG key رسمی Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# تنظیم repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# نصب Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# اضافه کردن کاربر به گروه docker (برای اجرا بدون sudo)
sudo usermod -aG docker $USER

# فعال‌سازی Docker
sudo systemctl enable docker
sudo systemctl start docker

# بررسی نصب
docker --version
docker compose version
```

**نکته مهم:** پس از اضافه شدن به گروه docker، باید logout و login کنید یا دستور زیر را اجرا کنید:

```bash
newgrp docker
```

### 3. Git

**بررسی نصب:**

```bash
git --version
```

اگر نصب نیست:

```bash
sudo apt install -y git
```

## 🚀 راه‌اندازی پروژه AIRouter

پس از نصب تمام پیش‌نیازها، مراحل زیر را دنبال کنید:

### مرحله 1: بررسی نصب پیش‌نیازها

```bash
cd /home/reza/AIRouter
./scripts/check-prerequisites.sh
```

### مرحله 2: نصب وابستگی‌های Node.js

```bash
npm install
```

### مرحله 3: ساخت فایل .env

```bash
# فایل .env از قبل ساخته شده است
cat .env
```

### مرحله 4: راه‌اندازی PostgreSQL و Redis با Docker

```bash
# راه‌اندازی سرویس‌ها
docker compose up -d postgres redis

# بررسی وضعیت سرویس‌ها
docker compose ps

# بررسی لاگ‌ها
docker compose logs postgres
docker compose logs redis
```

### مرحله 5: اجرای Migration های دیتابیس

```bash
# ساخت migrations
npm run db:generate

# اجرای migrations
npm run db:migrate
```

### مرحله 6: Seed کردن دیتابیس

```bash
npm run db:seed
```

این دستور یک حساب کاربری دمو و API key ایجاد می‌کند:
- **ایمیل:** demo@airouter.dev
- **رمز عبور:** demo123

### مرحله 7: راه‌اندازی سرور Development

```bash
npm run dev
```

سرور در آدرس `http://localhost:3000` اجرا می‌شود.

### مرحله 8: تست API

```bash
# بررسی Health
curl http://localhost:3000/health

# لاگین
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@airouter.dev","password":"demo123"}'
```

## 🔧 ابزارهای توسعه

### Drizzle Studio (مدیریت دیتابیس)

```bash
npm run db:studio
```

در مرورگر به آدرس `http://localhost:4983` بروید.

### مشاهده لاگ‌ها

```bash
# لاگ‌های Docker
docker compose logs -f backend
docker compose logs -f postgres
docker compose logs -f redis

# یا تماشای همه لاگ‌ها
docker compose logs -f
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

## 🐛 عیب‌یابی

### مشکل: Port 3000 در حال استفاده است

```bash
# یافتن پروسس
sudo lsof -i :3000

# از بین بردن پروسس
sudo kill -9 <PID>
```

### مشکل: خطای اتصال به PostgreSQL

```bash
# بررسی وضعیت
docker compose ps postgres

# راه‌اندازی مجدد
docker compose restart postgres

# بررسی لاگ‌ها
docker compose logs postgres
```

### مشکل: خطای اتصال به Redis

```bash
# بررسی وضعیت
docker compose ps redis

# راه‌اندازی مجدد
docker compose restart redis
```

### مشکل: خطای Migration

```bash
# Reset کامل دیتابیس
docker compose down -v
docker compose up -d postgres redis
sleep 10
npm run db:migrate
npm run db:seed
```

## 📊 ساختار پروژه

پروژه شامل بخش‌های زیر است:

```
AIRouter/
├── backend/
│   └── src/
│       ├── db/
│       │   ├── schema/          # Schema های Drizzle ORM
│       │   ├── migrations/      # فایل‌های migration
│       │   ├── migrate.ts       # اسکریپت migration
│       │   └── seed.ts          # اسکریپت seed
│       ├── modules/
│       │   ├── auth/            # ماژول احراز هویت
│       │   ├── providers/       # ماژول ارائه‌دهندگان LLM
│       │   └── routing/         # ماژول مسیریابی
│       ├── plugins/             # پلاگین‌های Fastify
│       ├── utils/               # ابزارهای کمکی
│       ├── app.ts               # تنظیمات Fastify
│       └── index.ts             # Entry point
├── docker-compose.yml           # تنظیمات Docker
├── .env                         # متغیرهای محیطی
└── package.json                 # وابستگی‌ها
```

## 🎯 مراحل بعدی (Week 3-4)

پس از راه‌اندازی موفقیت‌آمیز:

1. ✅ **Week 1-2 (فعلی):** پایه‌گذاری، احراز هویت، دیتابیس
2. 🔄 **Week 3-4:** اتصال به ارائه‌دهندگان (OpenAI, Anthropic, Mock)
3. 📋 **Week 5-6:** داشبورد و سیستم صورتحساب
4. 🔧 **Week 7-8:** SDK های Node.js و Python
5. 🏢 **Week 9-10:** قابلیت‌های Enterprise
6. 🚀 **Week 11-12:** راه‌اندازی Production

## 📚 منابع مفید

- [مستندات Fastify](https://fastify.dev/)
- [مستندات Drizzle ORM](https://orm.drizzle.team/)
- [مستندات Docker](https://docs.docker.com/)
- [OpenRouter.ai](https://openrouter.ai/) (الهام‌گیری)

## 🆘 پشتیبانی

در صورت بروز مشکل:
1. ابتدا فایل‌های `README.md` و `GET_STARTED.md` را بخوانید
2. لاگ‌های Docker را بررسی کنید: `docker compose logs`
3. فایل `.env` را با `.env.example` مقایسه کنید
4. از دستور `npm run db:studio` برای بررسی دیتابیس استفاده کنید

---

**نکته:** این پروژه در حال توسعه است و بر اساس roadmap 12 هفته‌ای پیش می‌رود. 
هفته‌های 1-2 شامل راه‌اندازی اولیه و احراز هویت است که الان تکمیل شده است.

