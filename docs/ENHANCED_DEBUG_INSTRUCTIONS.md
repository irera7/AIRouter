# 🔍 Enhanced Debug Logging Added

## 📝 **What Was Added:**

### **1. Cost Calculation Logging** (`ChatService.ts`)
Shows the cost right after it's calculated:
```
Cost calculated successfully: {
  provider: "mistral",
  model: "mistral-large-latest",
  promptTokens: 100,
  completionTokens: 50,
  calculatedCost: -0.16,
  costType: "number"
}
```

### **2. Pre-Insert Logging** (`requestLogger.ts`)
Shows exactly what's being sent to the database:
```
🔍 About to insert request into database: {
  cost: -0.16,
  costType: "number",
  costValue: "-0.16",
  inputTokens: 100,
  outputTokens: 50,
  providerId: "...",
  model: "mistral-large-latest"
}
```

### **3. Enhanced Error Logging** (`requestLogger.ts`)
Shows detailed database error:
```
❌ Failed to log request - DATABASE INSERT ERROR: {
  errorMessage: "invalid input syntax for type integer: \"-0.16\"",
  errorStack: "..."
}
```

---

## 🚀 **Please Do This:**

### **1. Kill the backend process completely:**
```bash
# Find and kill all node/tsx processes
pkill -f "tsx.*backend"
```

### **2. Start fresh:**
```bash
cd /home/reza/AIRouter
npm run dev
```

### **3. Test with Mistral:**
1. Wait for "Server listening on port 3000"
2. Open API Playground
3. Select Mistral provider + model
4. Send a message

### **4. Look at Backend Console:**

You should see **THREE** log messages:

**Log 1 - Cost Calculated:**
```
Cost calculated successfully
```

**Log 2 - About to Insert:**
```
🔍 About to insert request into database
```

**Log 3 - Either Success or Error:**
```
Request logged (success)
OR
❌ Failed to log request - DATABASE INSERT ERROR
```

---

## 📋 **Share With Me:**

**Copy and paste the ENTIRE log output** from your backend console that shows:

1. The "Cost calculated successfully" message
2. The "🔍 About to insert" message  
3. The error message

This will tell me:
- ✅ What cost value is calculated
- ✅ What cost value reaches the database
- ✅ The exact database error

---

## 💡 **What I'm Expecting:**

If the error says `"invalid input syntax for type integer"`, it means:
- The database column is still somehow being treated as integer
- OR Drizzle is casting the value incorrectly
- OR There's a cached connection pool

The logs will tell us which one!

---

**Kill backend, restart fresh, test, and share the complete log output!** 🔍

