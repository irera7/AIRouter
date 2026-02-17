# 🔧 Fix 503 Service Unavailable Error

## 🐛 **Problem Found:**

The health check shows:
```json
"providers": {
  "status": "up",
  "message": "3 provider(s) active",
  "details": {
    "total": 3,
    "active": 3,
    "providers": ["openai", "mock", "mistral"]
  }
}
```

But the database has **5 providers**: openai, anthropic, mistral, gemini, mock

**❌ Missing: Anthropic and Gemini are not loaded!**

---

## 🔍 **Root Cause:**

The backend started **before** we:
1. Added Gemini provider to database
2. Updated all provider model lists
3. Updated Anthropic with new models

**The backend needs to restart to load the new provider configurations!**

---

## ✅ **Solution: Restart Backend**

### **Step 1: Stop Backend**
```bash
# In the terminal where backend is running:
Press Ctrl+C
```

### **Step 2: Start Backend**
```bash
cd /home/reza/AIRouter
npm run dev
```

### **Step 3: Wait for Initialization**
Look for these logs:
```
✅ Database connected
✅ Providers initialized: 5 provider(s) loaded
   - OpenAI (24 models)
   - Anthropic (9 models)
   - Mistral (14 models)
   - Gemini (13 models)
   - Mock (2 models)
```

### **Step 4: Test Again**
1. Refresh the playground page
2. Try sending a message
3. ✅ Should work now!

---

## 🎯 **Additional Issue: Model Availability**

If you were trying to use **gpt-5**, that model may not exist yet in OpenAI's API.

### **Models That Definitely Work:**

**OpenAI:**
- ✅ `gpt-4o` (latest, best quality)
- ✅ `gpt-4o-mini` (fast, cheap, recommended)
- ✅ `gpt-4-turbo`
- ✅ `gpt-3.5-turbo`
- ❓ `gpt-5` (may not be available yet)

**Anthropic:**
- ✅ `claude-3-5-sonnet-20241022` (latest)
- ✅ `claude-3-haiku-20240307` (fast)

**Mistral:**
- ✅ `mistral-large-latest`
- ✅ `mistral-small-latest`

**Gemini:**
- ✅ `gemini-2.0-flash-exp`
- ✅ `gemini-1.5-flash`

---

## 🧪 **Testing Steps:**

### **After Restarting Backend:**

1. **Test with a known working model:**
   - Provider: **OpenAI**
   - Model: **gpt-4o-mini**
   - Message: "Hello!"
   - ✅ Should return a response

2. **Check health endpoint:**
   ```bash
   curl http://localhost:3000/health | jq '.checks.providers'
   ```
   
   **Expected:**
   ```json
   {
     "status": "up",
     "message": "5 provider(s) active",
     "details": {
       "total": 5,
       "active": 5,
       "providers": ["openai", "anthropic", "mistral", "gemini", "mock"]
     }
   }
   ```

3. **If still 503:**
   - Check backend logs for specific error
   - Try different model (gpt-4o-mini instead of gpt-5)
   - Verify API key is valid for that provider

---

## 📋 **Checklist:**

- [ ] Stop the backend (Ctrl+C)
- [ ] Start the backend (npm run dev)
- [ ] Wait for "Providers initialized" log
- [ ] Verify 5 providers are active (check health endpoint)
- [ ] Refresh playground page
- [ ] Try with gpt-4o-mini (known working model)
- [ ] Check if request succeeds

---

## 💡 **Why This Happened:**

1. We updated the database (added Gemini, updated models)
2. Backend was already running
3. Backend only loads providers **on startup**
4. Backend didn't know about new providers/models
5. When you tried to use them → **503 Service Unavailable**

**After restart:** Backend will load all 5 providers with 60 models total!

---

## 🚀 **Quick Fix Command:**

If backend is running with npm run dev, it should auto-restart when you save files.

If not, manually restart:
```bash
# In backend terminal:
# 1. Press Ctrl+C
# 2. Run:
npm run dev

# Wait for "Providers initialized" message
# Then try again!
```

---

## ✅ **Expected After Fix:**

```
POST /api/v1/chat/completions 200 OK
Response time: 850ms
Cost: $0.0015
Status: success ✅
```

**Restart the backend and try again!** 🎉

