# 🔑 How to Use the API Playground

## ⚠️ Getting 401 Unauthorized Error?

This means you need to create and enter an API key first!

---

## 📝 **Step-by-Step Guide:**

### **Step 1: Create an API Key**

1. Go to: **API Keys page**
   - URL: `http://localhost:3001/dashboard/api-keys`
   - Or click "API Keys" in the sidebar

2. Click: **"Create API Key"** button

3. Enter a name (e.g., "My Test Key")

4. Click: **"Create"**

5. **IMPORTANT:** Copy the key that appears!
   - It starts with `sk-air-`
   - Example: `sk-air-xxxxxxxxxxxxxxxxxxxxx`
   - You'll NEVER see it again!

---

### **Step 2: Enter the Key in Playground**

1. Go to: **API Playground**
   - URL: `http://localhost:3001/dashboard/playground`
   - Or click "API Playground" in the sidebar

2. At the top of the page, you'll see:
   ```
   ┌─────────────────────────────────────┐
   │ AIRouter API Key                    │
   │ ┌───────────────────────┬─────┐    │
   │ │ sk-air-...            │ 👁️  │    │
   │ └───────────────────────┴─────┘    │
   └─────────────────────────────────────┘
   ```

3. **Paste your API key** into this field

4. The key will be:
   - ✅ Saved automatically to localStorage
   - ✅ Loaded on future visits
   - ✅ Used for all API requests

---

### **Step 3: Test the API**

1. Enter a message (e.g., "Hello! Tell me a fun fact about space.")

2. Select your routing strategy

3. Click: **"Send Message"**

4. ✅ Should work now!

---

## 🔍 **Why Do I Need an API Key?**

The API Playground tests the **external AI routing API** (`/api/v1/chat/completions`), which is the same endpoint external applications would use.

**Two Types of Authentication:**

| Purpose | Auth Type | Used For |
|---------|-----------|----------|
| **Dashboard** | JWT Token | Logging in, managing settings, viewing analytics |
| **AI API** | API Key | Making chat completion requests, AI service access |

**The Playground uses the AI API**, so it needs an API key!

---

## 🐛 **Troubleshooting:**

### **Still Getting 401?**

1. **Check API key format:**
   - Must start with `sk-air-`
   - Should be 40+ characters long
   - Example: `sk-air-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **Verify key exists:**
   - Go to API Keys page
   - Check if your key is listed
   - Make sure it's **active** (green status)

3. **Check browser console:**
   - Open DevTools (F12)
   - Look at Console tab
   - Check what's being sent:
     ```javascript
     API Request: {
       url: "http://localhost:3000/api/v1/chat/completions",
       method: "POST",
       hasToken: true,  // ← Should be true
       tokenPreview: "sk-air-xxxxx..."  // ← Should show key
     }
     ```

4. **Re-enter the key:**
   - Copy your API key again from API Keys page
   - Delete the old key in playground
   - Paste the new key
   - Try again

5. **Check backend logs:**
   - Look for authentication errors
   - Check if API key validation is failing

---

## 📋 **Quick Checklist:**

- [ ] I have created an API key in the API Keys page
- [ ] I have copied the full API key (starts with `sk-air-`)
- [ ] I have pasted it in the API Playground input field
- [ ] I see the green "✓ Configured" badge
- [ ] I have entered a message to send
- [ ] I clicked "Send Message"

---

## ✅ **Expected Flow:**

```
1. Create API Key → sk-air-xxxxx
   ↓
2. Copy key
   ↓
3. Go to Playground
   ↓
4. Paste key at top
   ↓
5. See "✓ Configured"
   ↓
6. Enter message
   ↓
7. Click "Send Message"
   ↓
8. ✅ Get response!
```

---

## 🎯 **Common Mistakes:**

❌ **Using JWT token instead of API key**
- JWT tokens are for dashboard auth
- API keys are for AI API access
- They are NOT interchangeable

❌ **Not creating an API key first**
- You must create a key in API Keys page
- Keys don't auto-generate

❌ **Using partial API key**
- Must copy the FULL key
- Including the `sk-air-` prefix

❌ **Key deleted but still using it**
- Check if key still exists in API Keys page
- If deleted, create a new one

---

## 🚀 **Ready to Test!**

Follow the steps above and you should be able to use the API Playground successfully!

If you're still having issues, check the backend logs for more detailed error messages.

