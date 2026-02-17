# AIRouter Routing Strategies

Learn how AIRouter intelligently routes your requests to the best provider.

---

## Overview

AIRouter supports multiple routing strategies to optimize for different goals:

1. **Cost-Based Routing** - Minimize expenses
2. **Latency-Based Routing** - Maximize speed
3. **Priority Routing** - Use preferred providers with fallback
4. **Fallback Routing** - Automatic failover chain

---

## 1. Cost-Based Routing

**Goal:** Route to the cheapest provider that supports the requested model.

**Use Case:** Background tasks, batch processing, non-time-sensitive requests.

**Configuration:**
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "routingStrategy": "cost"
}
```

**How it Works:**

1. AIRouter identifies all providers that support the requested model
2. Calculates estimated cost based on:
   - Provider pricing (per 1M tokens)
   - Estimated input tokens
   - Expected output tokens
3. Routes to the provider with the lowest cost
4. Falls back to next cheapest if primary provider fails

**Example:**

```typescript
// Will route to the cheapest GPT-3.5-turbo provider
const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-air-xxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'Summarize this article...' }
    ],
    routingStrategy: 'cost',
  }),
});

// Response includes cost information
const data = await response.json();
console.log('Cost:', data.cost, 'cents');
console.log('Provider:', data.provider);
```

**Pricing Comparison:**

| Model | OpenAI | Alternative | Savings |
|-------|--------|-------------|---------|
| GPT-3.5 Turbo | $0.50/1M input | $0.35/1M input | 30% |
| GPT-4 | $30/1M input | $25/1M input | 17% |

---

## 2. Latency-Based Routing

**Goal:** Route to the fastest provider based on historical latency data.

**Use Case:** Real-time chat, interactive applications, live demos.

**Configuration:**
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "routingStrategy": "latency"
}
```

**How it Works:**

1. AIRouter tracks response times for each provider
2. Maintains a rolling average of the last 100 requests
3. Routes to the provider with the lowest average latency
4. Continuously updates metrics as new requests complete

**Example:**

```typescript
// Will route to the fastest provider
const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-air-xxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: 'Quick question: what time is it in Tokyo?' }
    ],
    routingStrategy: 'latency',
  }),
});
```

**Latency Metrics:**

AIRouter tracks:
- **Average Latency**: Mean response time over last 100 requests
- **P95 Latency**: 95th percentile response time
- **Success Rate**: Percentage of successful requests

View provider latency stats:
```bash
curl -X GET http://localhost:3000/api/v1/chat/statistics \
  -H "Authorization: Bearer sk-air-xxx"
```

Response:
```json
{
  "providerBreakdown": {
    "openai": {
      "avgLatency": 1150,
      "successRate": 99.4
    },
    "anthropic": {
      "avgLatency": 1450,
      "successRate": 99.8
    }
  }
}
```

---

## 3. Priority Routing

**Goal:** Use a preferred provider, with automatic fallback to alternatives if it fails.

**Use Case:** When you have specific provider requirements (features, compliance, contracts).

**Configuration:**
```json
{
  "model": "claude-3-opus",
  "messages": [...],
  "routingStrategy": "priority",
  "preferredProvider": "anthropic"
}
```

**How it Works:**

1. AIRouter first attempts the preferred provider
2. If the provider is unavailable or returns an error:
   - Automatically falls back to alternative providers
   - Tries providers in order of their priority score
3. Returns the first successful response

**Example:**

```typescript
// Prefer OpenAI, but fall back to alternatives
const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-air-xxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: 'Complex reasoning task...' }
    ],
    routingStrategy: 'priority',
    preferredProvider: 'openai',
  }),
});

// Check which provider was actually used
const data = await response.json();
console.log('Provider used:', data.provider);
// Output: "openai" if available, or fallback provider
```

**Fallback Chain Example:**

```
Request → OpenAI (preferred)
          ↓ (if fails)
          Anthropic
          ↓ (if fails)
          Alternative Provider
          ↓ (if fails)
          Error returned to client
```

---

## 4. Fallback Routing

**Goal:** Maximize availability by automatically trying multiple providers.

**Use Case:** Critical production systems requiring high uptime.

**Configuration:**
```json
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "routingStrategy": "fallback"
}
```

**How it Works:**

1. AIRouter defines a fallback chain based on:
   - Provider reliability (success rate)
   - Provider priority
   - Current health status
2. Attempts each provider in sequence until one succeeds
3. Implements circuit breaker pattern to skip failing providers

**Example:**

```typescript
// Maximum reliability - will try multiple providers
const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-air-xxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'user', content: 'Mission-critical request' }
    ],
    routingStrategy: 'fallback',
  }),
});
```

**Circuit Breaker:**

AIRouter implements a circuit breaker to prevent cascading failures:

- **Closed**: Normal operation, requests flow through
- **Open**: Provider is failing, skip it temporarily
- **Half-Open**: Test if provider has recovered

```
Normal → 5 consecutive failures → Circuit OPEN (skip for 60s)
                                      ↓
                                  After 60s → Try one request
                                      ↓
                              Success → Circuit CLOSED
                              Failure → Circuit stays OPEN
```

---

## Caching

All routing strategies benefit from AIRouter's intelligent caching.

**How it Works:**

1. AIRouter generates a cache key from:
   - Model name
   - Messages content
   - Temperature and other parameters
2. Checks cache before routing
3. If cache hit: Returns instantly with `cached: true`
4. If cache miss: Routes request and caches response

**Cache Benefits:**

- **Instant Responses**: 0ms latency for cached requests
- **Zero Cost**: Cached responses don't consume credits
- **Automatic**: No configuration needed

**Example:**

```typescript
// First request - goes to provider
const response1 = await makeRequest({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'What is 2+2?' }],
  enableCache: true,  // default
});
// provider: "openai", cost: 15, cached: false, latency: 1200ms

// Second identical request - served from cache
const response2 = await makeRequest({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'What is 2+2?' }],
  enableCache: true,
});
// provider: "openai", cost: 0, cached: true, latency: 5ms
```

**Disable Caching:**

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "enableCache": false
}
```

---

## Choosing the Right Strategy

| Strategy | Best For | Pros | Cons |
|----------|----------|------|------|
| **Cost** | Batch processing, background tasks | Lowest cost | May be slower |
| **Latency** | Real-time chat, interactive apps | Fastest response | May cost more |
| **Priority** | Specific provider requirements | Control + fallback | Limited to available providers |
| **Fallback** | Mission-critical systems | Maximum reliability | May use fallback providers |

---

## Advanced: Custom Routing Logic

For advanced use cases, you can combine strategies:

```typescript
// Use latency routing, but prefer Anthropic
const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk-air-xxx',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-3-opus',
    messages: [...],
    routingStrategy: 'priority',
    preferredProvider: 'anthropic',
    // Will fall back to latency-based routing if Anthropic unavailable
  }),
});
```

---

## Monitoring Routing Decisions

View routing decisions in your analytics:

```bash
curl -X GET "http://localhost:3000/api/v1/analytics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer sk-air-xxx"
```

Response includes:
- Which providers handled requests
- Success rates per provider
- Cost breakdown by provider
- Latency metrics

---

## Provider Health Monitoring

Check provider status:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "checks": {
    "providers": {
      "status": "up",
      "details": {
        "total": 3,
        "active": 2,
        "providers": ["openai", "anthropic"]
      }
    }
  }
}
```

---

## Best Practices

### 1. Use Cost Routing for Batch Jobs

```typescript
// Processing 1000s of documents
for (const document of documents) {
  await processWithAIRouter(document, { 
    routingStrategy: 'cost' 
  });
}
```

### 2. Use Latency Routing for User-Facing Features

```typescript
// Live chat interface
const response = await chat({
  message: userInput,
  routingStrategy: 'latency',
});
```

### 3. Use Priority Routing for Compliance

```typescript
// Must use specific provider for data residency
const response = await chat({
  message: euUserInput,
  routingStrategy: 'priority',
  preferredProvider: 'anthropic-eu',  // EU-hosted provider
});
```

### 4. Use Fallback Routing for Critical Systems

```typescript
// Payment processing, user authentication
const response = await criticalOperation({
  data: sensitiveData,
  routingStrategy: 'fallback',  // Maximum reliability
});
```

---

## Next Steps

- 📖 [API Reference](./API_REFERENCE.md) - Complete endpoint documentation
- 💰 [Pricing Guide](./PRICING.md) - Understand costs
- 🔧 [Best Practices](./BEST_PRACTICES.md) - Optimization tips
- 📊 [Analytics](./ANALYTICS.md) - Monitor your usage

---

## Questions?

For more information about routing strategies, check:
- Interactive API docs: http://localhost:3000/docs
- Health check: http://localhost:3000/health
- Your analytics dashboard

