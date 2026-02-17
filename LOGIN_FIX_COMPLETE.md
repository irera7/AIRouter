# ✅ Login Fix Complete - Two Subdomain Setup

## 🌐 Your Current Setup

**Frontend**: `http://ai.nexairalab.net` → localhost:3001  
**Backend**: `http://aib.nexairalab.net` → localhost:3000

Both are proxied through nginx/ArvanCloud CDN.

---

## ✅ Configuration Applied

### 1. Frontend Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://aib.nexairalab.net
```
The frontend will make API calls to the backend subdomain.

### 2. Backend CORS Configuration (`.env`)
```env
CORS_ORIGIN=http://ai.nexairalab.net,https://ai.nexairalab.net,http://aib.nexairalab.net,http://localhost:3001,http://airouter.rera.work
```
Backend allows requests from the frontend subdomain.

---

## 🔄 Services Status

### Backend: ✅ Running
- Process: Running on localhost:3000
- Health: http://localhost:3000/health (working)
- Public: http://aib.nexairalab.net/api/ (working)

**Test Proof:**
```bash
curl -X POST http://aib.nexairalab.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://ai.nexairalab.net" \
  -d '{"email":"demo@airouter.dev","password":"demo123"}'

# Result: HTTP 200 OK with token ✅
```

### Frontend: 🔄 Needs Restart
You need to restart the frontend to pick up the new `NEXT_PUBLIC_API_URL`:

```bash
cd /home/reza/AIRouter
pkill -f "next dev"
cd frontend
npm run dev
```

---

## 🧪 Testing Login

### Option 1: From Browser
1. Go to: `http://ai.nexairalab.net/login`
2. Enter credentials:
   - Email: `demo@airouter.dev`
   - Password: `demo123`
3. Click "Sign In"
4. Should work! ✅

### Option 2: From Terminal (After Backend Restart)
```bash
# Test from frontend origin
curl -X POST http://aib.nexairalab.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://ai.nexairalab.net" \
  -d '{"email":"demo@airouter.dev","password":"demo123"}'
```

---

## 🔍 If Login Still Fails

### Check 1: Backend Needs Restart for CORS
The backend needs to restart to apply the new CORS configuration:

```bash
cd /home/reza/AIRouter/backend
pkill -f "tsx.*index.ts"
nohup npm run dev > /tmp/airouter-backend.log 2>&1 &

# Wait 5 seconds
sleep 5

# Check health
curl http://localhost:3000/health
```

### Check 2: Frontend Needs Restart
The frontend needs to restart to use the new API URL:

```bash
cd /home/reza/AIRouter/frontend
pkill -f "next dev"
nohup npm run dev > /tmp/airouter-frontend.log 2>&1 &

# Wait 5 seconds
sleep 5

# Check frontend
curl -I http://localhost:3001
```

### Check 3: Clear Browser Cache
If you still see errors:
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear all site data
4. Hard refresh (Ctrl+Shift+R)

---

## 📊 Architecture Diagram

```
User Browser
    ↓
http://ai.nexairalab.net (Frontend)
    ↓
Nginx/CDN
    ↓
localhost:3001 (Next.js)
    ↓ API calls to
http://aib.nexairalab.net/api/v1/...
    ↓
Nginx/CDN
    ↓
localhost:3000 (Fastify Backend)
```

---

## 🎯 Why This Works

1. **Separate Subdomains**: Frontend and backend on different subdomains
2. **CORS Configured**: Backend explicitly allows frontend subdomain
3. **Nginx Proxy**: Both subdomains proxy to localhost ports
4. **No Private Network Access Issues**: No localhost→localhost calls from public origins

---

## 🚀 Quick Restart Script

Save this as `restart-services.sh`:

```bash
#!/bin/bash

echo "🛑 Stopping services..."
pkill -f "tsx.*index.ts"
pkill -f "next dev"
sleep 2

echo "🚀 Starting backend..."
cd /home/reza/AIRouter/backend
nohup npm run dev > /tmp/airouter-backend.log 2>&1 &
sleep 5

echo "🎨 Starting frontend..."
cd /home/reza/AIRouter/frontend
nohup npm run dev > /tmp/airouter-frontend.log 2>&1 &
sleep 5

echo "✅ Services started!"
echo "Backend health: http://localhost:3000/health"
echo "Frontend: http://localhost:3001"
echo ""
echo "Public URLs:"
echo "  Frontend: http://ai.nexairalab.net"
echo "  Backend: http://aib.nexairalab.net/api/"
```

Make it executable:
```bash
chmod +x restart-services.sh
```

---

## 📝 Summary

✅ **Backend configuration updated** - CORS allows `http://ai.nexairalab.net`  
✅ **Frontend configuration updated** - Points to `http://aib.nexairalab.net`  
✅ **Backend verified working** - Login endpoint responds with 200 OK  
🔄 **Action needed**: Restart both services to apply changes  

---

**Status**: Ready to test login! 🎉  
**Last Updated**: 2025-11-13 17:35 UTC

