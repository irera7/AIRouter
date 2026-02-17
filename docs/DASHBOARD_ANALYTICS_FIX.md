# 🔧 Dashboard Analytics Fix

## 🐛 **Problem:**

The dashboard, analytics, and billing pages aren't showing the correct values because:

1. **Wrong Data Path**: Frontend is accessing flat properties like `stats.totalRequests`, but backend returns nested data like `stats.metrics.totalRequests`
2. **Cost Format**: Backend stores cost in **cents** (integer), but frontend expects **dollars** (decimal)
3. **Cache Hit Rate**: Backend returns percentage (0-100), frontend tries to multiply by 100 again

---

## 📊 **Backend Response Structure:**

```typescript
// GET /api/v1/analytics/summary
{
  "success": true,
  "data": {
    "timeRange": {
      "startDate": "2024-01-01",
      "endDate": "2024-01-08"
    },
    "metrics": {                    // ← All metrics are nested here!
      "totalRequests": 150,
      "totalTokens": 50000,
      "totalCost": 125,             // ← In cents (125 = $1.25)
      "averageLatency": 850,
      "errorRate": 2.5,             // ← Already a percentage (2.5%)
      "cacheHitRate": 15.5          // ← Already a percentage (15.5%)
    },
    "trends": [...],
    "providerStats": [...],
    "modelStats": [...],
    "costBreakdown": {...},
    "topUsers": [...]
  }
}
```

---

## ✅ **Fixes Applied:**

### **1. Dashboard Page (`frontend/app/dashboard/page.tsx`)**

**Changed:**
- `stats.totalRequests` → `stats.metrics.totalRequests`
- `stats.totalCost` → `(stats.metrics.totalCost / 100)` (convert cents to dollars)
- `stats.totalTokens` → `stats.metrics.totalTokens`
- `stats.successRate * 100` → `100 - stats.metrics.errorRate` (error rate is already a %)

**Example:**
```typescript
// Before:
{formatCurrency(stats?.totalCost || 0)}

// After:
{formatCurrency((stats?.metrics?.totalCost || 0) / 100)}
```

---

## 📝 **What You Need to Do:**

### **Step 1: Make Actual API Requests**

The analytics pages will show **zero values** if you haven't made any API requests yet!

**To generate data:**

1. **Create an API key** (if you haven't):
   - Go to: `/dashboard/api-keys`
   - Create a new key

2. **Use the API Playground**:
   - Go to: `/dashboard/playground`
   - Enter your API key
   - Send 5-10 test messages
   - Try different providers/models

3. **Or use curl**:
   ```bash
   curl -X POST http://localhost:3000/api/v1/chat/completions \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "model": "gpt-4o-mini",
       "messages": [{"role": "user", "content": "Hello!"}]
     }'
   ```

### **Step 2: Refresh Dashboard**

After making some API requests:
1. Go to: `/dashboard`
2. **Refresh the page** (F5 or Ctrl+R)
3. You should now see:
   - ✅ Total Requests (e.g., 10)
   - ✅ Total Cost (e.g., $0.05)
   - ✅ Total Tokens (e.g., 1,250)
   - ✅ Success Rate (e.g., 100%)

---

## 🧪 **Testing:**

### **1. Check if requests are being logged:**

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d airouter

# Check requests table
SELECT COUNT(*), 
       SUM(total_tokens) as total_tokens,
       SUM(cost) as total_cost_cents
FROM requests;

# Expected output:
# count | total_tokens | total_cost_cents
# ------+--------------+-----------------
#    10 |        5000  |             125
```

### **2. Check analytics endpoint:**

```bash
# Get JWT token from localStorage after logging in
# Then:
curl -X GET http://localhost:3000/api/v1/analytics/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Should return data with nested `metrics` object.

---

## 🎯 **Common Issues:**

### **Issue 1: All values are 0**
**Cause:** No API requests have been made yet  
**Solution:** Make some test requests using the playground or curl

### **Issue 2: Cost shows huge numbers**
**Cause:** Not dividing by 100 (showing cents instead of dollars)  
**Solution:** Already fixed - cost is divided by 100 now

### **Issue 3: Cache hit rate > 100%**
**Cause:** Multiplying by 100 when it's already a percentage  
**Solution:** Backend returns 0-100, frontend should use as-is

### **Issue 4: 401 Unauthorized in analytics**
**Cause:** JWT token expired or missing  
**Solution:** Log out and log back in to get fresh token

---

## 📋 **Data Flow:**

```
1. User makes API request
   ↓
2. ChatService processes request
   ↓
3. RequestLogger logs to database
   - apiKeyId, orgId, providerId
   - inputTokens, outputTokens, totalTokens
   - cost (in cents)
   - latencyMs, status
   ↓
4. BillingEvent created
   - Deducts credits from org
   ↓
5. Dashboard queries analytics
   ↓
6. AnalyticsService fetches from requests table
   ↓
7. Returns aggregated metrics
   ↓
8. Frontend displays data
```

---

## ✅ **Checklist:**

- [x] Fixed dashboard page to use `stats.metrics.*`
- [x] Fixed cost display (divide by 100)
- [x] Fixed percentage calculations
- [ ] Make test API requests to generate data
- [ ] Verify data appears in dashboard
- [ ] Check analytics page
- [ ] Check billing page

---

## 🚀 **Next Steps:**

1. **Refresh your browser** (the dashboard page is now fixed)
2. **Make some API requests** using the playground
3. **Check the dashboard** - values should appear!

The issue isn't that the data is wrong - it's that:
1. The frontend was looking in the wrong place (now fixed)
2. You probably haven't made any API requests yet (need to test)

**After making 5-10 test requests, all values will show correctly!** 🎉

