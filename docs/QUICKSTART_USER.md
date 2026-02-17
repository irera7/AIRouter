# AIRouter Quickstart Guide

Get started with AIRouter - your unified gateway to multiple AI providers with intelligent routing, caching, and cost optimization.

## What is AIRouter?

AIRouter provides a unified API that gives you access to multiple AI models (OpenAI, Anthropic, Mistral, and more) through a single endpoint, while automatically:
- **Routing** to the best provider based on cost, latency, or your preferences
- **Caching** responses to reduce costs and improve performance
- **Fallback** to alternative providers if one fails
- **Tracking** usage and costs across your organization

---

## Quick Setup

### 1. Register an Account

First, create your AIRouter account:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "your-secure-password",
    "name": "Your Name",
    "orgName": "Your Organization"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "you@example.com" },
    "org": { "id": "...", "name": "Your Organization" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Save the `token` for the next step!

---

### 2. Create an API Key

Use your JWT token to create an API key:

```bash
curl -X POST http://localhost:3000/api/v1/auth/keys \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My First API Key",
    "permissions": ["read", "write"]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "apiKey": {
      "id": "...",
      "key": "sk-air-xxxxxxxxxxxxxxxx",
      "name": "My First API Key"
    }
  }
}
```

**⚠️ Important:** Save the `key` value - it won't be shown again!

---

## Your First Request

Now you're ready to make AI requests! Here's how to use AIRouter with different methods:

### Using cURL

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "What is the meaning of life?"
      }
    ],
    "routingStrategy": "cost"
  }'
```

### Using JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-air-xxxxxxxxxxxxxxxx',
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
    routingStrategy: 'cost', // Optional: 'cost' | 'latency' | 'priority' | 'fallback'
    enableCache: true, // Optional: Enable response caching
  }),
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

### Using Python

```python
import requests

response = requests.post(
    'http://localhost:3000/api/v1/chat/completions',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-air-xxxxxxxxxxxxxxxx',
    },
    json={
        'model': 'gpt-3.5-turbo',
        'messages': [
            {
                'role': 'user',
                'content': 'What is the meaning of life?',
            },
        ],
        'routingStrategy': 'cost',
        'enableCache': True,
    }
)

data = response.json()
print(data['choices'][0]['message']['content'])
```

### Using OpenAI SDK

AIRouter is compatible with the OpenAI SDK! Just change the base URL:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:3000/api/v1',
  apiKey: 'sk-air-xxxxxxxxxxxxxxxx',
});

async function main() {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'user',
        content: 'What is the meaning of life?',
      },
    ],
  });

  console.log(completion.choices[0].message.content);
}

main();
```

**Python:**
```python
from openai import OpenAI

client = OpenAI(
    base_url='http://localhost:3000/api/v1',
    api_key='sk-air-xxxxxxxxxxxxxxxx',
)

completion = client.chat.completions.create(
    model='gpt-3.5-turbo',
    messages=[
        {
            'role': 'user',
            'content': 'What is the meaning of life?',
        },
    ],
)

print(completion.choices[0].message.content)
```

---

## Response Format

AIRouter returns responses in OpenAI-compatible format:

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-3.5-turbo",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "The meaning of life is a philosophical question..."
      },
      "finishReason": "stop"
    }
  ],
  "usage": {
    "promptTokens": 13,
    "completionTokens": 142,
    "totalTokens": 155
  },
  "provider": "openai",
  "cost": 225,
  "cached": false
}
```

**Extra Fields:**
- `provider`: Which provider handled the request (e.g., "openai", "anthropic")
- `cost`: Cost in cents (1/100 of a dollar)
- `cached`: Whether the response was served from cache

---

## Advanced Features

### 1. Smart Routing

Choose how AIRouter selects providers:

```typescript
// Cost-based routing (cheapest provider)
{
  "routingStrategy": "cost",
  "model": "gpt-3.5-turbo"
}

// Latency-based routing (fastest provider)
{
  "routingStrategy": "latency",
  "model": "gpt-3.5-turbo"
}

// Preferred provider with fallback
{
  "routingStrategy": "priority",
  "preferredProvider": "openai",
  "model": "gpt-3.5-turbo"
}

// Automatic fallback chain
{
  "routingStrategy": "fallback",
  "model": "gpt-3.5-turbo"
}
```

### 2. Response Caching

Enable caching to reduce costs and improve speed:

```typescript
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "enableCache": true  // Default: true
}
```

Cached responses are instant and cost $0!

### 3. List Available Models

Get all models supported by your active providers:

```bash
curl -X GET http://localhost:3000/api/v1/chat/models \
  -H "Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx"
```

**Response:**
```json
{
  "models": [
    {
      "id": "gpt-4",
      "provider": "openai",
      "pricing": {
        "inputTokenPrice": 30,
        "outputTokenPrice": 60
      }
    },
    {
      "id": "claude-3-opus",
      "provider": "anthropic",
      "pricing": {
        "inputTokenPrice": 15,
        "outputTokenPrice": 75
      }
    }
  ]
}
```

---

## Rate Limits

Your rate limits are returned in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T00:01:00.000Z
```

If you exceed the limit:
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many requests. Please try again after 45 seconds.",
  "limit": 100,
  "remaining": 0,
  "resetAt": "2024-01-01T00:01:00.000Z"
}
```

---

## Monitoring Usage

### Get Analytics

```bash
curl -X GET "http://localhost:3000/api/v1/analytics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx"
```

### Get Credits Balance

```bash
curl -X GET http://localhost:3000/api/v1/billing/credits \
  -H "Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 50000,
    "currency": "USD",
    "formatted": "$500.00"
  }
}
```

---

## Error Handling

AIRouter uses standard HTTP status codes:

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Check your request parameters |
| 401 | Unauthorized | Check your API key |
| 402 | Payment Required | Insufficient credits |
| 429 | Rate Limited | Wait before retrying |
| 500 | Server Error | Contact support |
| 503 | Service Unavailable | No providers available |

**Error Response:**
```json
{
  "success": false,
  "error": "Insufficient credits",
  "message": "Your organization has 0 credits remaining. Please add credits to continue."
}
```

---

## Next Steps

- 📖 [API Reference](./API_REFERENCE.md) - Complete API documentation
- 🎯 [Routing Strategies](./ROUTING_STRATEGIES.md) - Deep dive into routing options
- 💰 [Pricing & Billing](./PRICING.md) - Understand costs and billing
- 🔧 [Best Practices](./BEST_PRACTICES.md) - Optimize your integration
- 🚀 [Advanced Features](./ADVANCED_FEATURES.md) - Streaming, webhooks, and more

---

## Support

- **Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Swagger API**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **GitHub Issues**: Report bugs and request features

---

## Example: Complete Integration

Here's a complete example with error handling:

```typescript
import OpenAI from 'openai';

class AIRouterClient {
  private client: OpenAI;

  constructor(apiKey: string, baseURL: string = 'http://localhost:3000/api/v1') {
    this.client = new OpenAI({
      baseURL,
      apiKey,
    });
  }

  async chat(
    message: string,
    options: {
      model?: string;
      routingStrategy?: 'cost' | 'latency' | 'priority' | 'fallback';
      enableCache?: boolean;
    } = {}
  ) {
    try {
      const completion = await this.client.chat.completions.create({
        model: options.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        // @ts-ignore - AIRouter-specific parameters
        routingStrategy: options.routingStrategy || 'cost',
        enableCache: options.enableCache !== false,
      });

      return {
        content: completion.choices[0].message.content,
        provider: (completion as any).provider,
        cost: (completion as any).cost,
        cached: (completion as any).cached,
      };
    } catch (error: any) {
      if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (error.status === 402) {
        throw new Error('Insufficient credits. Please add credits to continue.');
      } else if (error.status === 401) {
        throw new Error('Invalid API key. Please check your credentials.');
      }
      throw error;
    }
  }
}

// Usage
const client = new AIRouterClient('sk-air-xxxxxxxxxxxxxxxx');

const response = await client.chat('Explain quantum computing in simple terms', {
  routingStrategy: 'cost',
  enableCache: true,
});

console.log('Response:', response.content);
console.log('Provider:', response.provider);
console.log('Cost:', `$${response.cost / 100}`);
console.log('Cached:', response.cached);
```

---

Ready to build? Start making requests and let AIRouter handle the complexity! 🚀

