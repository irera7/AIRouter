# AIRouter Best Practices

Optimize your AIRouter integration for performance, cost, and reliability.

---

## 🎯 General Best Practices

### 1. Use Appropriate Routing Strategies

Choose the right strategy for your use case:

```typescript
// ✅ Good: Cost optimization for batch processing
async function processBatchDocuments(documents) {
  for (const doc of documents) {
    await chat({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Summarize: ${doc}` }],
      routingStrategy: 'cost',  // Minimize costs
    });
  }
}

// ✅ Good: Low latency for real-time chat
async function handleUserChat(message) {
  return await chat({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: message }],
    routingStrategy: 'latency',  // Maximize speed
  });
}

// ✅ Good: Reliability for critical operations
async function criticalOperation(data) {
  return await chat({
    model: 'gpt-4',
    messages: [{ role: 'user', content: data }],
    routingStrategy: 'fallback',  // Maximum reliability
  });
}
```

---

## 💰 Cost Optimization

### 1. Enable Response Caching

```typescript
// ✅ Good: Enable caching for repeated queries
const response = await chat({
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: 'What is photosynthesis?' }],
  enableCache: true,  // Default: true
});

// Subsequent identical requests cost $0 and return instantly!
```

### 2. Use Cheaper Models When Possible

```typescript
// ❌ Bad: Using expensive model for simple task
await chat({
  model: 'gpt-4',  // $30 per 1M input tokens
  messages: [{ role: 'user', content: 'Say hello' }],
});

// ✅ Good: Use cheaper model for simple tasks
await chat({
  model: 'gpt-3.5-turbo',  // $0.50 per 1M input tokens
  messages: [{ role: 'user', content: 'Say hello' }],
});
```

### 3. Optimize Token Usage

```typescript
// ❌ Bad: Verbose system message
const systemMessage = `You are a helpful AI assistant. You should be polite,
professional, and provide detailed answers to all questions. Always think carefully
before responding and make sure your answers are accurate and well-researched...`;

// ✅ Good: Concise system message
const systemMessage = 'You are a helpful assistant.';

// ❌ Bad: Including entire conversation history
const messages = [...last100Messages, newMessage];

// ✅ Good: Keep only relevant context (last 5-10 messages)
const messages = [...last10Messages, newMessage];
```

### 4. Use Cost-Based Routing

```typescript
// ✅ Good: Let AIRouter find the cheapest provider
await chat({
  model: 'gpt-3.5-turbo',
  messages: [...],
  routingStrategy: 'cost',  // Automatically uses cheapest provider
});
```

---

## ⚡ Performance Optimization

### 1. Use Latency-Based Routing for Real-Time

```typescript
// ✅ Good: Fast responses for live chat
async function handleLiveChat(userMessage: string) {
  return await chat({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: userMessage }],
    routingStrategy: 'latency',  // Route to fastest provider
  });
}
```

### 2. Implement Request Batching

```typescript
// ❌ Bad: Sequential requests
for (const item of items) {
  await processItem(item);  // Slow!
}

// ✅ Good: Parallel requests (respecting rate limits)
const batchSize = 10;
for (let i = 0; i < items.length; i += batchSize) {
  const batch = items.slice(i, i + batchSize);
  await Promise.all(batch.map(item => processItem(item)));
}
```

### 3. Monitor Rate Limits

```typescript
// ✅ Good: Check rate limit headers
const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: JSON.stringify({...}),
});

const remaining = response.headers.get('X-RateLimit-Remaining');
const reset = response.headers.get('X-RateLimit-Reset');

if (remaining < 10) {
  console.warn(`Only ${remaining} requests remaining until ${reset}`);
}
```

---

## 🛡️ Reliability Best Practices

### 1. Use Fallback Routing for Critical Operations

```typescript
// ✅ Good: Mission-critical requests
async function criticalPaymentProcessing(data) {
  return await chat({
    model: 'gpt-4',
    messages: [...],
    routingStrategy: 'fallback',  // Auto-failover if provider fails
  });
}
```

### 2. Implement Error Handling

```typescript
// ✅ Good: Comprehensive error handling
async function robustChatRequest(message: string) {
  try {
    const response = await chat({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
    });
    return response;
  } catch (error: any) {
    if (error.status === 429) {
      // Rate limit exceeded
      const retryAfter = error.headers?.['retry-after'] || 60;
      console.log(`Rate limited. Retry after ${retryAfter}s`);
      await sleep(retryAfter * 1000);
      return robustChatRequest(message);  // Retry
    } else if (error.status === 402) {
      // Insufficient credits
      console.error('Insufficient credits. Please add credits.');
      throw new Error('Payment required');
    } else if (error.status === 503) {
      // Service unavailable
      console.error('No providers available');
      throw new Error('Service temporarily unavailable');
    } else {
      // Other errors
      console.error('Request failed:', error.message);
      throw error;
    }
  }
}
```

### 3. Monitor System Health

```typescript
// ✅ Good: Check health before critical operations
async function ensureSystemHealthy() {
  const health = await fetch('http://localhost:3000/health');
  const data = await health.json();
  
  if (data.status !== 'healthy') {
    console.warn('System is degraded:', data);
  }
  
  if (data.checks.providers.status === 'down') {
    throw new Error('No providers available');
  }
}
```

---

## 🔐 Security Best Practices

### 1. Secure API Key Storage

```typescript
// ❌ Bad: Hardcoded API key
const apiKey = 'sk-air-1234567890';

// ✅ Good: Use environment variables
const apiKey = process.env.AIROUTER_API_KEY;

// ✅ Good: Use secret management
import { getSecret } from './secrets';
const apiKey = await getSecret('AIROUTER_API_KEY');
```

### 2. Use Appropriate Permissions

```typescript
// ✅ Good: Create separate keys for different purposes
// Read-only key for analytics
const analyticsKey = await createApiKey({
  name: 'Analytics Dashboard',
  permissions: ['read'],
});

// Full access for production app
const productionKey = await createApiKey({
  name: 'Production App',
  permissions: ['read', 'write'],
});
```

### 3. Set Expiration Dates

```typescript
// ✅ Good: Set expiration for temporary keys
const temporaryKey = await createApiKey({
  name: 'Temporary Test Key',
  permissions: ['read'],
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
});
```

### 4. Rotate Keys Regularly

```typescript
// ✅ Good: Implement key rotation
async function rotateApiKey(oldKeyId: string) {
  // Create new key
  const newKey = await createApiKey({
    name: 'Production App v2',
    permissions: ['read', 'write'],
  });
  
  // Update application configuration
  await updateConfig({ apiKey: newKey.key });
  
  // Revoke old key after grace period
  setTimeout(() => {
    revokeApiKey(oldKeyId);
  }, 24 * 60 * 60 * 1000); // 24 hours grace period
}
```

---

## 📊 Monitoring Best Practices

### 1. Track Usage and Costs

```typescript
// ✅ Good: Regular analytics checks
async function analyzeUsage() {
  const analytics = await fetch(
    'http://localhost:3000/api/v1/analytics?startDate=2024-01-01&endDate=2024-01-31',
    { headers: { 'Authorization': `Bearer ${apiKey}` } }
  );
  
  const data = await analytics.json();
  
  console.log('Total requests:', data.summary.totalRequests);
  console.log('Total cost:', `$${data.summary.totalCost / 100}`);
  console.log('Cache hit rate:', `${data.summary.cacheHitRate}%`);
  
  // Alert if cost is too high
  if (data.summary.totalCost > 10000) { // $100
    sendAlert('High AI usage detected');
  }
}
```

### 2. Monitor Provider Performance

```typescript
// ✅ Good: Track provider latency
async function monitorProviders() {
  const stats = await fetch(
    'http://localhost:3000/api/v1/chat/statistics',
    { headers: { 'Authorization': `Bearer ${apiKey}` } }
  );
  
  const data = await stats.json();
  
  for (const [provider, metrics] of Object.entries(data.providerBreakdown)) {
    console.log(`${provider}: ${metrics.avgLatency}ms (${metrics.successRate}% success)`);
    
    if (metrics.successRate < 95) {
      console.warn(`${provider} has low success rate: ${metrics.successRate}%`);
    }
  }
}
```

---

## 🎨 Code Organization

### 1. Create a Client Wrapper

```typescript
// ✅ Good: Centralized AIRouter client
import OpenAI from 'openai';

export class AIRouterClient {
  private client: OpenAI;
  
  constructor(apiKey: string) {
    this.client = new OpenAI({
      baseURL: process.env.AIROUTER_URL || 'http://localhost:3000/api/v1',
      apiKey,
    });
  }
  
  async chat(
    message: string,
    options: {
      model?: string;
      routingStrategy?: string;
      systemMessage?: string;
    } = {}
  ) {
    const messages = [
      ...(options.systemMessage 
        ? [{ role: 'system' as const, content: options.systemMessage }]
        : []
      ),
      { role: 'user' as const, content: message },
    ];
    
    return await this.client.chat.completions.create({
      model: options.model || 'gpt-3.5-turbo',
      messages,
      // @ts-ignore
      routingStrategy: options.routingStrategy || 'cost',
    });
  }
}

// Usage
const ai = new AIRouterClient(process.env.AIROUTER_API_KEY!);
const response = await ai.chat('Hello!', { routingStrategy: 'latency' });
```

### 2. Use Dependency Injection

```typescript
// ✅ Good: Injectable AI service
export interface IAIService {
  chat(message: string): Promise<string>;
}

export class AIRouterService implements IAIService {
  constructor(private client: AIRouterClient) {}
  
  async chat(message: string): Promise<string> {
    const response = await this.client.chat(message);
    return response.choices[0].message.content;
  }
}

// Easy to mock for testing
class MockAIService implements IAIService {
  async chat(message: string): Promise<string> {
    return 'Mock response';
  }
}
```

---

## 🧪 Testing Best Practices

### 1. Mock AIRouter in Tests

```typescript
// ✅ Good: Mock for unit tests
import { jest } from '@jest/globals';

jest.mock('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Test response' } }],
        }),
      },
    },
  })),
}));
```

### 2. Test Error Handling

```typescript
// ✅ Good: Test error scenarios
test('handles rate limiting', async () => {
  const mockClient = createMockClient();
  mockClient.mockRateLimit();
  
  await expect(
    makeRequest(mockClient)
  ).rejects.toThrow('Rate limit exceeded');
});
```

---

## 📱 Production Deployment

### 1. Use Environment Variables

```bash
# .env.production
AIROUTER_URL=https://api.airouter.your-domain.com
AIROUTER_API_KEY=sk-air-production-key
NODE_ENV=production
```

### 2. Implement Health Checks

```typescript
// ✅ Good: Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await fetch('http://localhost:3000/health');
    const data = await health.json();
    
    if (data.status === 'healthy') {
      res.status(200).json({ status: 'ok' });
    } else {
      res.status(503).json({ status: 'degraded', details: data });
    }
  } catch (error) {
    res.status(503).json({ status: 'error', error: error.message });
  }
});
```

### 3. Set Up Monitoring

```typescript
// ✅ Good: Prometheus metrics
import { Counter, Histogram } from 'prom-client';

const aiRequests = new Counter({
  name: 'ai_requests_total',
  help: 'Total AI requests',
  labelNames: ['provider', 'model', 'status'],
});

const aiLatency = new Histogram({
  name: 'ai_request_duration_seconds',
  help: 'AI request latency',
  labelNames: ['provider', 'model'],
});
```

---

## 🔍 Debugging Tips

### 1. Enable Verbose Logging

```typescript
// ✅ Good: Log requests for debugging
const response = await chat({
  model: 'gpt-3.5-turbo',
  messages: [...],
  user: 'user-123',  // Track specific users
});

console.log('Request details:', {
  provider: response.provider,
  cost: response.cost,
  cached: response.cached,
  latency: response.latency,
});
```

### 2. Check System Health

```bash
# Quick health check
curl http://localhost:3000/health | jq .

# Check specific provider status
curl http://localhost:3000/health | jq '.checks.providers'
```

---

## 📚 Additional Resources

- [API Reference](./API_REFERENCE.md)
- [Routing Strategies](./ROUTING_STRATEGIES.md)
- [Architecture](./ARCHITECTURE.md)
- [Quickstart Guide](./QUICKSTART_USER.md)

---

## 🎯 Quick Checklist

- [ ] Use appropriate routing strategy for your use case
- [ ] Enable response caching
- [ ] Choose cost-effective models
- [ ] Implement comprehensive error handling
- [ ] Monitor rate limits and usage
- [ ] Secure API keys properly
- [ ] Set up health checks
- [ ] Track costs and performance
- [ ] Test error scenarios
- [ ] Implement proper logging

---

Happy building with AIRouter! 🚀

