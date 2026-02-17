# 🔧 Error Handling Guide

این مستند نحوه مدیریت خطاها در AIRouter را توضیح می‌دهد.

## 📋 HTTP Status Codes

### ✅ Success Codes (2xx)

| Code | Status | Usage |
|------|--------|-------|
| 200 | OK | درخواست موفق |
| 201 | Created | ایجاد موفق (مثلاً ثبت‌نام) |
| 204 | No Content | حذف موفق |

### ⚠️ Client Error Codes (4xx)

| Code | Status | Usage | Example |
|------|--------|-------|---------|
| 400 | Bad Request | خطای Validation | فرمت ایمیل اشتباه |
| 401 | Unauthorized | پسورد اشتباه | Wrong password |
| 403 | Forbidden | عدم دسترسی | Not admin |
| 404 | Not Found | کاربر/منبع یافت نشد | User not found |
| 409 | Conflict | تداخل (مثلاً ایمیل تکراری) | Email exists |

### ❌ Server Error Codes (5xx)

| Code | Status | Usage |
|------|--------|-------|
| 500 | Internal Server Error | خطای سرور |

---

## 🔐 Authentication Errors

### Login Endpoint (`POST /api/v1/auth/login`)

#### ❌ User Not Found (404)
```json
{
  "success": false,
  "error": "User not found",
  "message": "No account found with email: user@example.com. Please register first."
}
```

**Frontend Message:**
> "Account not found. Please check your email or register first."

---

#### ❌ Invalid Password (401)
```json
{
  "success": false,
  "error": "Invalid password",
  "message": "The password you entered is incorrect."
}
```

**Frontend Message:**
> "Incorrect password. Please try again."

---

#### ❌ Validation Error (400)
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid email or password format",
  "details": [
    {
      "path": ["email"],
      "message": "Invalid email"
    }
  ]
}
```

**Frontend Message:**
> "Login failed. Please try again."

---

#### ✅ Success (200)
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "owner"
    },
    "token": "eyJhbGc..."
  }
}
```

---

## 📝 Registration Errors

### Register Endpoint (`POST /api/v1/auth/register`)

#### ❌ User Already Exists (409)
```json
{
  "success": false,
  "error": "User already exists",
  "message": "An account with email user@example.com already exists. Please login instead."
}
```

**Frontend Message:**
> "This email is already registered. Please login instead."

---

#### ❌ Validation Error (400)
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Please check your input and try again",
  "details": [
    {
      "path": ["password"],
      "message": "String must contain at least 8 character(s)"
    }
  ]
}
```

**Frontend Message:**
> "Please check your input and try again."

---

#### ✅ Success (201)
```json
{
  "success": true,
  "message": "Account created successfully!",
  "data": {
    "user": { ... },
    "org": { ... },
    "token": "eyJhbGc..."
  }
}
```

**Frontend Message:**
> "✅ Account created successfully! You can now login."

---

## 🛠️ Frontend Error Handling

### Login Page

```typescript
try {
  const response = await apiClient.login(email, password)
  
  if (response.success) {
    router.push('/dashboard')
  } else {
    setError(response.message || response.error || 'Login failed')
  }
} catch (err: any) {
  let errorMsg = 'Login failed. Please try again.'
  
  if (err.status === 404) {
    errorMsg = 'Account not found. Please check your email or register first.'
  } else if (err.status === 401) {
    errorMsg = 'Incorrect password. Please try again.'
  } else if (err.message) {
    errorMsg = err.message
  }
  
  setError(errorMsg)
}
```

### Register Page

```typescript
try {
  const response = await apiClient.register(data)
  
  if (response.success) {
    alert('✅ Account created successfully! You can now login.')
    router.push('/login')
  } else {
    setError(response.message || response.error || 'Registration failed')
  }
} catch (err: any) {
  let errorMsg = 'Registration failed. Please try again.'
  
  if (err.status === 409) {
    errorMsg = 'This email is already registered. Please login instead.'
  } else if (err.status === 400) {
    errorMsg = err.message || 'Please check your input and try again.'
  } else if (err.message) {
    errorMsg = err.message
  }
  
  setError(errorMsg)
}
```

---

## 🔍 Debugging

### Backend Logs

Backend logs تمام خطاها را با جزئیات ثبت می‌کند:

```bash
# مشاهده logs
tail -f /tmp/airouter-backend.log

# فیلتر کردن خطاها
tail -f /tmp/airouter-backend.log | grep -i "error"
```

### Frontend Console Logs

Frontend تمام API calls را در console log می‌کند:

```javascript
console.log('API Request:', { url, method, body })
console.log('API Response:', { status, ok })
console.log('API Data:', data)
console.error('API Error:', error)
```

**نحوه استفاده:**
1. مرورگر را باز کنید
2. Developer Tools → Console
3. درخواست را ارسال کنید
4. خطاها را مشاهده کنید

---

## 📊 Error Response Format

تمام خطاها با این فرمت استاندارد برگردانده می‌شوند:

```typescript
interface ErrorResponse {
  success: false
  error: string           // نوع خطا (کوتاه)
  message: string         // پیام کامل برای کاربر
  details?: any[]         // جزئیات اضافی (اختیاری)
}
```

### مثال:

```json
{
  "success": false,
  "error": "User not found",
  "message": "No account found with email: test@example.com. Please register first."
}
```

---

## 🎯 Best Practices

### Backend

1. ✅ همیشه `success: false` برگردانید
2. ✅ `error` برای نوع خطا و `message` برای توضیح کامل
3. ✅ Status code مناسب استفاده کنید
4. ✅ خطاها را log کنید
5. ✅ اطلاعات حساس را expose نکنید

```typescript
// ✅ Good
return reply.code(404).send({
  success: false,
  error: 'User not found',
  message: 'No account found with this email. Please register first.'
})

// ❌ Bad
return reply.code(404).send({
  error: 'Not found'
})
```

### Frontend

1. ✅ از status code برای تشخیص نوع خطا استفاده کنید
2. ✅ پیام‌های کاربرپسند نمایش دهید
3. ✅ خطاها را در console log کنید
4. ✅ Loading state را مدیریت کنید

```typescript
// ✅ Good
if (err.status === 404) {
  setError('Account not found. Please register first.')
}

// ❌ Bad
setError('Error')
```

---

## 🧪 Testing Errors

### با cURL:

```bash
# Test user not found
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"notfound@example.com","password":"demo123"}'

# Expected: 404

# Test wrong password
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@airouter.dev","password":"wrongpass"}'

# Expected: 401

# Test duplicate email
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@airouter.dev","password":"test1234","name":"Test","orgName":"Test Org"}'

# Expected: 409
```

---

## 📝 مثال‌های کامل

### سناریو 1: کاربر ایمیل اشتباه وارد می‌کند

1. کاربر `wrong@example.com` را وارد می‌کند
2. Backend بررسی می‌کند → کاربر یافت نشد
3. Backend برمی‌گرداند: `404 User not found`
4. Frontend نمایش می‌دهد: "Account not found. Please check your email or register first."

### سناریو 2: کاربر پسورد اشتباه وارد می‌کند

1. کاربر ایمیل صحیح اما پسورد اشتباه وارد می‌کند
2. Backend کاربر را پیدا می‌کند ✅
3. Backend پسورد را بررسی می‌کند → مطابقت ندارد ❌
4. Backend برمی‌گرداند: `401 Invalid password`
5. Frontend نمایش می‌دهد: "Incorrect password. Please try again."

### سناریو 3: کاربر می‌خواهد با ایمیل تکراری ثبت‌نام کند

1. کاربر ایمیلی که قبلاً ثبت شده را وارد می‌کند
2. Backend بررسی می‌کند → ایمیل موجود است
3. Backend برمی‌گرداند: `409 User already exists`
4. Frontend نمایش می‌دهد: "This email is already registered. Please login instead."

---

**Made with ❤️ for better debugging!**

