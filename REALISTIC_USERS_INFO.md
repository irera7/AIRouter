# 🎭 Realistic Test Users - AIRouter

این فایل اطلاعات کاربران واقعی که برای تست ایجاد شدن رو نشون میده. این کاربران تاریخچه استفاده کامل با لاگ‌های واقعی دارن.

## 🌟 خلاصه کاربران

| Organization | Users | API Keys | Total Requests | Cost | Balance | Pattern |
|--------------|-------|----------|----------------|------|---------|---------|
| TechCorp AI Division | 3 | 4 | ~8,500 | $1,394 | -$394 ⚠️ | Enterprise |
| StartupAI Labs | 2 | 3 | ~2,900 | $353 | $147 | Heavy |
| DataInsights Co | 1 | 2 | ~600 | $34 | $266 | Medium |
| Freelance Solutions | 1 | 1 | ~70 | $2 | $98 | Light |
| TrialCorp Evaluation | 1 | 1 | ~30 | $1 | $49 | Trial |

---

## 📋 لیست کامل کاربران

### 1️⃣ TechCorp AI Division (Enterprise)
**الگوی استفاده:** Heavy enterprise usage با 8,500+ درخواست در 30 روز

#### کاربران:
```
📧 sarah.johnson@techcorp.ai
   نقش: Owner
   رمز عبور: demo123

📧 mike.chen@techcorp.ai
   نقش: Admin
   رمز عبور: demo123

📧 emily.davis@techcorp.ai
   نقش: User
   رمز عبور: demo123
```

#### API Keys:
- Production API
- Development API
- Testing API
- Mobile App Backend

#### آمار استفاده:
- **تعداد درخواست‌ها:** 8,518
- **موفق:** 8,409 (98.5%)
- **خطا:** 109 (1.5%)
- **هزینه کل:** $1,394.27
- **موجودی:** -$394.27 ⚠️ (منفی شده!)

**الگوی زمانی:** ساعات اوج کاری (9AM-5PM) با 20-40 درخواست در ساعت

---

### 2️⃣ StartupAI Labs (Heavy User)
**الگوی استفاده:** Heavy usage از استارتاپ AI

#### کاربران:
```
📧 alex@startupalabs.io
   نقش: Owner
   رمز عبور: demo123

📧 jessica@startupalabs.io
   نقش: Admin
   رمز عبور: demo123
```

#### API Keys:
- Main Production Key
- Staging Environment
- Local Development

#### آمار استفاده:
- **تعداد درخواست‌ها:** 2,948
- **موفق:** 2,888 (98%)
- **خطا:** 60 (2%)
- **هزینه کل:** $353.30
- **موجودی:** $146.70

**الگوی زمانی:** 50-150 درخواست در روز، تمام طول روز

---

### 3️⃣ DataInsights Co (Medium User)
**الگوی استفاده:** Moderate usage برای آنالیز داده

#### کاربران:
```
📧 david@datainsights.com
   نقش: Owner
   رمز عبور: demo123
```

#### API Keys:
- Analytics Dashboard
- Report Generator

#### آمار استفاده:
- **تعداد درخواست‌ها:** 593
- **موفق:** 589 (99.3%)
- **خطا:** 4 (0.7%)
- **هزینه کل:** $34.34
- **موجودی:** $265.66

**الگوی زمانی:** 10-30 درخواست در روز

---

### 4️⃣ Freelance Solutions (Light User)
**الگوی استفاده:** Light usage از developer مستقل

#### کاربران:
```
📧 jordan@freelance.dev
   نقش: Owner
   رمز عبور: demo123
```

#### API Keys:
- Personal Projects

#### آمار استفاده:
- **تعداد درخواست‌ها:** 71
- **موفق:** 71 (100%)
- **خطا:** 0 (0%)
- **هزینه کل:** $1.95
- **موجودی:** $98.05

**الگوی زمانی:** 2-5 درخواست در روز، فقط 70% از روزها

---

### 5️⃣ TrialCorp Evaluation (Trial User)
**الگوی استفاده:** Trial phase، فقط 7 روز اخیر

#### کاربران:
```
📧 morgan.lee@trialcorp.com
   نقش: Owner
   رمز عبور: demo123
```

#### API Keys:
- Evaluation Key

#### آمار استفاده:
- **تعداد درخواست‌ها:** 32
- **موفق:** 32 (100%)
- **خطا:** 0 (0%)
- **هزینه کل:** $0.62
- **موجودی:** $49.38

**الگوی زمانی:** 1-8 درخواست در روز، فقط در 7 روز اخیر

---

## 🔑 نکات مهم

### رمز عبور همه کاربران
```
demo123
```

### مدل‌های استفاده شده
- **Enterprise:** GPT-4o, GPT-4 Turbo, Claude 3.5 Sonnet, Claude Opus
- **Heavy:** GPT-4o, GPT-4o-mini, GPT-3.5 Turbo, Claude Haiku
- **Medium:** GPT-4o-mini, GPT-3.5 Turbo, Claude Haiku
- **Light:** GPT-3.5 Turbo, GPT-4o-mini
- **Trial:** GPT-3.5 Turbo, GPT-4o-mini

### ویژگی‌های داده‌های تولید شده
- ✅ تاریخچه 30 روز استفاده (برای enterprise, heavy, medium)
- ✅ تاریخچه 7 روز (برای trial)
- ✅ الگوهای زمانی واقعی (peak hours vs off-peak)
- ✅ نرخ خطای واقعی (1-2%)
- ✅ توکن‌های ورودی/خروجی واقعی
- ✅ زمان تاخیر (latency) واقعی
- ✅ هزینه‌های محاسبه شده براساس pricing واقعی
- ✅ billing events و تغییرات موجودی

---

## 🎯 موارد استفاده برای تست

### 1. Dashboard
- لاگین با هر کدام از کاربران
- مشاهده analytics با داده‌های واقعی
- مقایسه الگوهای استفاده مختلف

### 2. Admin Panel
- لاگین با sarah.johnson@techcorp.ai (Owner)
- مشاهده لیست همه کاربران و سازمان‌ها
- بررسی system stats کامل

### 3. Billing
- بررسی موجودی‌های مختلف
- مشاهده billing history
- تست warn برای TechCorp (موجودی منفی!)

### 4. Analytics
- مقایسه usage patterns
- بررسی error rates
- آنالیز latency در طول زمان
- مشاهده most-used models

### 5. API Testing
همه API keys ذخیره شده در لاگ اجرای seed:
```bash
tail -100 ~/.npm/_logs/*-debug.log | grep "sk-air-"
```

---

## 🔄 اجرای مجدد Seed

اگر خواستید دوباره داده‌ها رو بسازید:

```bash
# پاک کردن database
npm run db:migrate

# اجرای seed اصلی (providers)
npm run db:seed

# اجرای seed کاربران واقعی
npm run db:seed-realistic
```

---

## 📊 آمار کلی

- **کل کاربران:** 8
- **کل سازمان‌ها:** 5
- **کل API Keys:** 11
- **کل درخواست‌ها:** ~12,200
- **کل هزینه:** ~$1,784
- **کل توکن‌ها:** ~42M tokens
- **میانگین latency:** ~1,883ms
- **نرخ خطا:** ~1.66%

---

## 🎨 نمونه داشبورد

با لاگین به هر کدام از این اکانت‌ها میتونی:
- 📈 نمودارهای usage در طول زمان
- 💰 tracking هزینه و موجودی
- 📋 جدول detailed logs
- ⚡ performance metrics
- 🔍 فیلتر و جستجو در لاگ‌ها

**همه چیز آماده برای دمو و تست است! 🚀**

