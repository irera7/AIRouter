# 🚨 URGENT: Frontend Not Picking Up New API URL

## The Problem

The error shows:
```
POST http://nexairalab.net:3000/api/v1/auth/login net::ERR_NAME_NOT_RESOLVED
```

But your `.env.local` has the correct value:
```
NEXT_PUBLIC_API_URL=http://aib.nexairalab.net
```

**Why?** Next.js has cached the old environment variable value!

---

## ✅ SOLUTION (Follow These Steps)

### Step 1: Stop All Services

Open a terminal and run:

```bash
cd /home/reza/AIRouter
pkill -f tsx
pkill -f next
sleep 3
```

### Step 2: Clear Next.js Cache

```bash
cd /home/reza/AIRouter/frontend
rm -rf .next
rm -rf node_modules/.cache
```

### Step 3: Verify Environment Variable

```bash
cat /home/reza/AIRouter/frontend/.env.local
```

You should see:
```
NEXT_PUBLIC_API_URL=http://aib.nexairalab.net
```

✅ If correct, proceed to Step 4  
❌ If wrong, fix it first

### Step 4: Start Backend

```bash
cd /home/reza/AIRouter/backend
npm run dev > /tmp/airouter-backend.log 2>&1 &

# Wait 5 seconds
sleep 5

# Verify it's running
curl http://localhost:3000/health
```

You should see JSON with `"status":"healthy"` ✅

### Step 5: Start Frontend (Fresh Build)

```bash
cd /home/reza/AIRouter/frontend
npm run dev > /tmp/airouter-frontend.log 2>&1 &

# Wait 10 seconds for Next.js to compile
sleep 10

# Verify it's running
curl -I http://localhost:3001
```

You should see `HTTP/1.1 200 OK` ✅

### Step 6: Clear Browser Cache

**IMPORTANT**: You MUST clear your browser cache!

1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear site data** / **Clear storage**
4. Close all browser tabs with `ai.nexairalab.net`
5. Open a new tab

### Step 7: Test Login

1. Go to: `http://ai.nexairalab.net/login`
2. Open DevTools Console (F12 → Console tab)
3. Enter credentials:
   - Email: `demo@airouter.dev`
   - Password: `demo123`
4. Click "Sign In"

**Look in the Console**: You should see the API call going to `http://aib.nexairalab.net/api/v1/auth/login` (NOT `http://nexairalab.net:3000`)

---

## 🔍 If Still Not Working

### Check 1: Frontend Environment Variable

Open browser DevTools Console and type:

```javascript
fetch('/_next/static/chunks/pages/_app.js').then(r => r.text()).then(t => {
  console.log('API URL in code:', t.match(/nexairalab\.net[^"']*/g))
})
```

This will show you what API URL is actually compiled into the frontend code.

### Check 2: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try to login
4. Look for the `login` request
5. Check the **Request URL**

It SHOULD be: `http://aib.nexairalab.net/api/v1/auth/login`  
NOT: `http://nexairalab.net:3000/api/v1/auth/login`

### Check 3: Frontend Logs

```bash
tail -f /tmp/airouter-frontend.log
```

Look for any errors or warnings about environment variables.

---

## 🎯 Expected Behavior After Fix

**Before Fix (Current):**
```
❌ Frontend tries: http://nexairalab.net:3000/api/v1/auth/login
❌ Result: ERR_NAME_NOT_RESOLVED (domain doesn't resolve)
```

**After Fix:**
```
✅ Frontend tries: http://aib.nexairalab.net/api/v1/auth/login
✅ Result: 200 OK with token (login successful)
```

---

## 📋 Quick Checklist

- [ ] Stopped all services (pkill tsx & next)
- [ ] Deleted .next folder
- [ ] Verified .env.local has correct URL
- [ ] Started backend (listening on 3000)
- [ ] Started frontend (listening on 3001)
- [ ] Cleared browser cache completely
- [ ] Closed all tabs and opened fresh
- [ ] Tested login

---

## 🆘 Alternative: Use start.sh Script

If manual steps don't work, try the automated script:

```bash
cd /home/reza/AIRouter

# Stop everything
pkill -f tsx
pkill -f next
sleep 3

# Clear cache
rm -rf frontend/.next
rm -rf frontend/node_modules/.cache

# Start with script
./start.sh
```

Then wait 30 seconds and test login.

---

## 💡 Why This Happened

Next.js compiles environment variables **at build time**. When you change `.env.local`, the running server doesn't automatically reload these variables. You need to:

1. Stop the server
2. Clear the cache (`.next` folder)
3. Restart the server

This forces Next.js to recompile with the new environment variable.

---

**Last Updated**: 2025-11-13 17:40 UTC  
**Status**: Awaiting manual fix + restart

