# 🚀 AIRouter Management Scripts

این پروژه شامل 4 اسکریپت مدیریتی برای راه‌اندازی و کنترل سرویس‌ها است.

## 📜 اسکریپت‌ها

### 1. `start.sh` - راه‌اندازی کامل

**استفاده:**
```bash
./start.sh
```

**عملکرد:**
- ✅ بستن پورت‌های قبلی (3000, 3001)
- ✅ Kill کردن process های قدیمی (tsx, next dev)
- ✅ بررسی و راه‌اندازی Docker (PostgreSQL, Redis)
- ✅ انتظار برای آماده شدن Database
- ✅ راه‌اندازی Backend
- ✅ راه‌اندازی Frontend
- ✅ نمایش وضعیت و لینک‌ها

**خروجی:**
```
╔════════════════════════════════════════════════════════════════╗
║              ✅ AIRouter is now running! ✅                   ║
╚════════════════════════════════════════════════════════════════╝

📊 Services Status:
✓ PostgreSQL  - Running (Docker)
✓ Redis       - Running (Docker)
✓ Backend     - http://localhost:3000 (PID: 12345)
✓ Frontend    - http://localhost:3001 (PID: 12346)

🔗 Access URLs:
   Frontend:  http://localhost:3001
   Backend:   http://localhost:3000
```

---

### 2. `stop.sh` - توقف سرویس‌ها

**استفاده:**
```bash
./stop.sh
```

**عملکرد:**
- ✅ Stop کردن Backend و Frontend
- ✅ پاک کردن process های باقی‌مانده
- ✅ آزادسازی پورت‌ها
- ✅ (اختیاری) Stop کردن Docker containers

**پرسش:**
```
Do you want to stop Docker containers too? [y/N]:
```
- اگر `y` بزنید، PostgreSQL و Redis هم متوقف می‌شوند
- اگر `N` بزنید، فقط Backend و Frontend متوقف می‌شوند

---

### 3. `restart.sh` - راه‌اندازی مجدد

**استفاده:**
```bash
./restart.sh
```

**عملکرد:**
- ✅ اجرای `stop.sh`
- ✅ انتظار 3 ثانیه
- ✅ اجرای `start.sh`

این اسکریپت برای زمانی که تغییراتی دادید و می‌خواهید سریع restart کنید مفید است.

---

### 4. `status.sh` - وضعیت سرویس‌ها

**استفاده:**
```bash
./status.sh
```

**عملکرد:**
- ✅ بررسی وضعیت PostgreSQL
- ✅ بررسی وضعیت Redis
- ✅ بررسی وضعیت Backend
- ✅ بررسی وضعیت Frontend
- ✅ نمایش PID ها
- ✅ نمایش لینک‌ها
- ✅ بررسی log files

**خروجی:**
```
╔════════════════════════════════════════════════════════════════╗
║                  📊 AIRouter Status                           ║
╚════════════════════════════════════════════════════════════════╝

🐘 PostgreSQL:
   ✓ Running and ready

📦 Redis:
   ✓ Running and ready

🔧 Backend (port 3000):
   ✓ Running and healthy (PID: 12345)
   → http://localhost:3000

🎨 Frontend (port 3001):
   ✓ Running and ready (PID: 12346)
   → http://localhost:3001

📝 Log Files:
   Backend:  ✓ (150 lines) - tail -f /tmp/airouter-backend.log
   Frontend: ✓ (200 lines) - tail -f /tmp/airouter-frontend.log

✅ All services are running!
```

---

## 🔍 مشاهده Logs

### Backend Logs:
```bash
tail -f /tmp/airouter-backend.log
```

### Frontend Logs:
```bash
tail -f /tmp/airouter-frontend.log
```

---

## 🎯 Workflow معمولی

### شروع کار روزانه:
```bash
./start.sh
```

### بررسی وضعیت:
```bash
./status.sh
```

### مشاهده logs (در صورت خطا):
```bash
tail -f /tmp/airouter-backend.log
tail -f /tmp/airouter-frontend.log
```

### Restart بعد از تغییرات:
```bash
./restart.sh
```

### پایان کار:
```bash
./stop.sh
# و سپس 'n' برای نگه داشتن Docker containers
```

---

## 🆘 عیب‌یابی

### پورت اشغال است:
```bash
# بررسی کنید چه چیزی روی پورت در حال اجرا است:
lsof -i :3000
lsof -i :3001

# یا استفاده از stop.sh:
./stop.sh
```

### Backend start نمی‌شود:
```bash
# بررسی logs:
tail -f /tmp/airouter-backend.log

# بررسی Docker:
docker ps
docker logs airouter-postgres
```

### Frontend start نمی‌شود:
```bash
# بررسی logs:
tail -f /tmp/airouter-frontend.log

# ممکن است نیاز به نصب dependencies باشد:
cd frontend
npm install
cd ..
./restart.sh
```

### همه چیز خراب است! 😱
```bash
# Reset کامل:
./stop.sh
# پاسخ 'y' برای stop کردن Docker

# شروع مجدد:
docker compose up -d postgres redis
sleep 5
./start.sh
```

---

## 📊 Port های استفاده شده

| Service     | Port | URL                          |
|-------------|------|------------------------------|
| Frontend    | 3001 | http://localhost:3001        |
| Backend API | 3000 | http://localhost:3000        |
| PostgreSQL  | 5432 | localhost:5432 (Docker)      |
| Redis       | 6379 | localhost:6379 (Docker)      |
| Prometheus  | 9090 | http://localhost:9090        |
| Grafana     | 3001 | http://localhost:3001        |

---

## 🔐 Login Credentials

```
Email:    demo@airouter.dev
Password: demo123
```

---

## 💡 Tips

1. **همیشه از `start.sh` استفاده کنید** - این اسکریپت مطمئن می‌شود که همه چیز به درستی راه‌اندازی شده.

2. **`status.sh` را برای debug استفاده کنید** - سریع‌ترین راه برای دیدن وضعیت سیستم.

3. **Logs را چک کنید** - اگر مشکلی پیش آمد، اول logs را ببینید.

4. **Docker را نگه دارید** - معمولاً نیازی نیست Docker containers را stop کنید.

5. **`restart.sh` برای development** - بعد از تغییرات کد، از این استفاده کنید.

---

**ساخته شده برای AIRouter با ❤️**

