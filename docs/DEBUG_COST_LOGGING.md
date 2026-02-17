# 🔍 Debug Logging Added

## 📝 **What I Added:**

Added debug logging in `requestLogger.ts` to see exactly what value is being passed to the database:

```typescript
logger.info({
  cost: data.cost,
  costType: typeof data.cost,
  inputTokens: data.inputTokens,
  outputTokens: data.outputTokens,
}, 'Logging request with cost');
```

---

## 🚀 **Restart Backend & Test:**

### **1. Restart:**
```bash
cd /home/reza/AIRouter
# Stop current backend (Ctrl+C)
npm run dev
```

### **2. Test with Mistral:**
1. Open API Playground
2. Select Mistral provider
3. Send a message

### **3. Check Backend Logs:**

Look for these log lines in the backend console:
```
Logging request with cost: {
  cost: ???,           ← What value?
  costType: ???,       ← What type?
  inputTokens: ???,
  outputTokens: ???
}
```

---

## 🔍 **What We're Looking For:**

### **Expected (Correct):**
```json
{
  "cost": 0.05,
  "costType": "number",
  "inputTokens": 100,
  "outputTokens": 50
}
```

### **Possible Issues:**

**Issue 1: Wrong Type**
```json
{
  "cost": "0.05",       ← String instead of number!
  "costType": "string"
}
```

**Issue 2: Undefined**
```json
{
  "cost": undefined,    ← Missing value!
  "costType": "undefined"
}
```

**Issue 3: NaN**
```json
{
  "cost": NaN,          ← Invalid calculation!
  "costType": "number"
}
```

---

## 📊 **Next Steps:**

### **After you restart and test, tell me:**

1. ✅ Did the request succeed or fail?
2. 📝 What does the log show for `cost` and `costType`?
3. 📝 What are the `inputTokens` and `outputTokens` values?

Then I can pinpoint exactly what's wrong!

---

## 💡 **Possible Root Causes:**

Based on the error `invalid input syntax for type integer: "-0.05"`:

1. **Drizzle ORM might be casting to integer** despite schema saying numeric
2. **Cost calculation might return string** instead of number
3. **Token values might be undefined** causing NaN in calculation

The debug logs will tell us which one!

---

**Restart, test with Mistral, and share the log output!** 🔍

