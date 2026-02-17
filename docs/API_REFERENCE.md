# AIRouter API Reference

Complete API documentation for all AIRouter endpoints.

**Base URL:** `http://localhost:3000` (Development) | `https://api.airouter.dev` (Production)

**API Version:** `v1`

---

## Table of Contents

- [Authentication](#authentication)
- [Chat Completions](#chat-completions)
- [Models](#models)
- [Analytics](#analytics)
- [Billing](#billing)
- [Admin](#admin)
- [Health](#health)
- [Errors](#errors)

---

## Authentication

AIRouter supports two authentication methods:

### 1. JWT Token (Bearer Auth)
Used for dashboard access and managing your account.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. API Key (Bearer Auth)
Used for making AI requests and programmatic access.

```http
Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx
```

---

## Chat Completions

### Create Chat Completion

Make a chat completion request with intelligent routing.

```http
POST /api/v1/chat/completions
```

**Headers:**
```http
Content-Type: application/json
Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx
```

**Request Body:**

```typescript
{
  // Required
  "model": string,              // Model name (e.g., "gpt-3.5-turbo", "gpt-4", "claude-3-opus")
  "messages": [                 // Array of messages
    {
      "role": "system" | "user" | "assistant",
      "content": string
    }
  ],

  // Optional - Model Parameters
  "temperature": number,        // 0-2, default: 1
  "maxTokens": number,          // 1-100000, default: provider-specific
  "topP": number,               // 0-1, default: 1
  "frequencyPenalty": number,   // -2 to 2, default: 0
  "presencePenalty": number,    // -2 to 2, default: 0
  "stop": string[],             // Stop sequences
  "stream": boolean,            // Enable streaming, default: false

  // Optional - AIRouter Specific
  "routingStrategy": "cost" | "latency" | "priority" | "fallback",  // Default: "cost"
  "preferredProvider": string,  // e.g., "openai", "anthropic"
  "enableCache": boolean,       // Default: true
  "user": string                // User identifier for tracking
}
```

**Response: `200 OK`**

```json
{
  "id": "chatcmpl-8qR5J9X1Z2...",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-3.5-turbo",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help you today?"
      },
      "finishReason": "stop"
    }
  ],
  "usage": {
    "promptTokens": 10,
    "completionTokens": 9,
    "totalTokens": 19
  },
  "provider": "openai",
  "cost": 28,
  "cached": false
}
```

**Response Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 2024-01-01T00:01:00.000Z
```

**Errors:**
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Invalid API key
- `402 Payment Required` - Insufficient credits
- `429 Too Many Requests` - Rate limit exceeded
- `503 Service Unavailable` - No providers available

**Example:**

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello!"}
    ],
    "temperature": 0.7,
    "routingStrategy": "cost",
    "enableCache": true
  }'
```

---

### Streaming Chat Completions

Enable streaming for real-time responses.

```typescript
{
  "model": "gpt-3.5-turbo",
  "messages": [...],
  "stream": true
}
```

**Response: `200 OK` (Server-Sent Events)**

```
data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1677652288,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"role":"assistant","content":"Hello"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1677652288,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}

data: {"id":"chatcmpl-...","object":"chat.completion.chunk","created":1677652288,"model":"gpt-3.5-turbo","choices":[{"index":0,"delta":{},"finish_reason":"stop"}]}

data: [DONE]
```

---

### List Available Models

Get all models available through your active providers.

```http
GET /api/v1/chat/models
```

**Headers:**
```http
Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx
```

**Response: `200 OK`**

```json
{
  "models": [
    {
      "id": "gpt-4",
      "provider": "openai",
      "displayName": "GPT-4",
      "contextWindow": 8192,
      "pricing": {
        "inputTokenPrice": 30,
        "outputTokenPrice": 60,
        "currency": "USD"
      },
      "capabilities": ["chat", "vision"]
    },
    {
      "id": "gpt-3.5-turbo",
      "provider": "openai",
      "displayName": "GPT-3.5 Turbo",
      "contextWindow": 4096,
      "pricing": {
        "inputTokenPrice": 0.5,
        "outputTokenPrice": 1.5,
        "currency": "USD"
      },
      "capabilities": ["chat"]
    },
    {
      "id": "claude-3-opus",
      "provider": "anthropic",
      "displayName": "Claude 3 Opus",
      "contextWindow": 200000,
      "pricing": {
        "inputTokenPrice": 15,
        "outputTokenPrice": 75,
        "currency": "USD"
      },
      "capabilities": ["chat", "vision"]
    }
  ]
}
```

---

### Get Chat Statistics

View statistics about your chat requests.

```http
GET /api/v1/chat/statistics
```

**Headers:**
```http
Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx
```

**Response: `200 OK`**

```json
{
  "totalRequests": 1250,
  "cachedRequests": 340,
  "cacheHitRate": 27.2,
  "totalCost": 4532,
  "avgLatency": 1234,
  "providerBreakdown": {
    "openai": {
      "requests": 850,
      "successRate": 99.4,
      "avgLatency": 1150
    },
    "anthropic": {
      "requests": 400,
      "successRate": 99.8,
      "avgLatency": 1400
    }
  }
}
```

---

## Authentication Endpoints

### Register

Create a new user account and organization.

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure-password-123",
  "name": "John Doe",
  "orgName": "Acme Corporation"
}
```

**Response: `201 Created`**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "owner"
    },
    "org": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Acme Corporation",
      "slug": "acme-corporation",
      "plan": "free",
      "creditBalance": 10000
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400 Bad Request` - Invalid input
- `409 Conflict` - Email already exists

---

### Login

Authenticate with email and password.

```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure-password-123"
}
```

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "owner"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `401 Unauthorized` - Invalid credentials

---

### Get Current User

Get information about the authenticated user.

```http
GET /api/v1/auth/me
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "owner",
    "orgId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

---

### Create API Key

Generate a new API key for programmatic access.

```http
POST /api/v1/auth/keys
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "name": "Production API Key",
  "permissions": ["read", "write"],
  "expiresAt": "2025-12-31T23:59:59Z"  // Optional
}
```

**Response: `201 Created`**
```json
{
  "success": true,
  "data": {
    "apiKey": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "key": "sk-air-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      "name": "Production API Key",
      "permissions": ["read", "write"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2025-12-31T23:59:59.000Z"
    }
  }
}
```

⚠️ **Important:** The `key` value is only shown once. Store it securely!

---

### List API Keys

Get all API keys for your organization.

```http
GET /api/v1/auth/keys
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "name": "Production API Key",
        "permissions": ["read", "write"],
        "isActive": true,
        "lastUsedAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "expiresAt": null
      }
    ]
  }
}
```

---

### Revoke API Key

Deactivate an API key.

```http
DELETE /api/v1/auth/keys/:keyId
```

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response: `200 OK`**
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

## Analytics

### Get Analytics

Retrieve usage analytics for a date range.

```http
GET /api/v1/analytics?startDate=2024-01-01&endDate=2024-01-31
```

**Headers:**
```http
Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx
```

**Query Parameters:**
- `startDate` (required): ISO 8601 date string
- `endDate` (required): ISO 8601 date string
- `groupBy` (optional): `day` | `hour` - Default: `day`

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalRequests": 15420,
      "totalCost": 45230,
      "totalTokens": 3456789,
      "cacheHitRate": 28.5,
      "avgLatency": 1245
    },
    "byProvider": {
      "openai": {
        "requests": 10500,
        "cost": 32000,
        "tokens": 2500000,
        "avgLatency": 1150
      },
      "anthropic": {
        "requests": 4920,
        "cost": 13230,
        "tokens": 956789,
        "avgLatency": 1450
      }
    },
    "byModel": {
      "gpt-3.5-turbo": {
        "requests": 8000,
        "cost": 12000,
        "tokens": 1800000
      },
      "gpt-4": {
        "requests": 2500,
        "cost": 20000,
        "tokens": 700000
      }
    },
    "timeline": [
      {
        "date": "2024-01-01",
        "requests": 450,
        "cost": 1320,
        "tokens": 125000
      }
    ]
  }
}
```

---

## Billing

### Get Credits Balance

Check your organization's credit balance.

```http
GET /api/v1/billing/credits
```

**Headers:**
```http
Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx
```

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "balance": 50000,
    "currency": "USD",
    "formatted": "$500.00",
    "plan": "pro"
  }
}
```

---

### Get Usage History

View your billing and usage history.

```http
GET /api/v1/billing/usage?startDate=2024-01-01&endDate=2024-01-31
```

**Headers:**
```http
Authorization: Bearer sk-air-xxxxxxxxxxxxxxxx
```

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "total": 45230,
    "breakdown": [
      {
        "date": "2024-01-15",
        "requests": 450,
        "cost": 1320,
        "provider": "openai",
        "model": "gpt-3.5-turbo"
      }
    ]
  }
}
```

---

## Admin

Admin endpoints require an API key with admin permissions.

### List Users

```http
GET /api/v1/admin/users
```

### List Organizations

```http
GET /api/v1/admin/orgs
```

### Get System Statistics

```http
GET /api/v1/admin/stats
```

**Response: `200 OK`**
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalOrgs": 430,
    "totalRequests": 1245678,
    "totalRevenue": 543210,
    "activeProviders": ["openai", "anthropic", "mock"]
  }
}
```

---

## Health

### Health Check

Check system health and status.

```http
GET /health
```

**Response: `200 OK`**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123456.78,
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 5,
      "message": "Database is healthy"
    },
    "redis": {
      "status": "up",
      "responseTime": 2,
      "message": "Redis is healthy"
    },
    "providers": {
      "status": "up",
      "responseTime": 1,
      "message": "2 provider(s) active",
      "details": {
        "total": 3,
        "active": 2,
        "providers": ["openai", "anthropic"]
      }
    }
  },
  "metrics": {
    "memory": {
      "used": 134217728,
      "total": 8589934592,
      "percentage": 1.56
    },
    "cpu": {
      "usage": 12.5,
      "loadAverage": [0.5, 0.7, 0.6]
    }
  }
}
```

---

## Errors

AIRouter uses conventional HTTP response codes and returns detailed error messages.

### Error Response Format

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Invalid or missing authentication |
| 402 | Payment Required | Insufficient credits |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Common Errors

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid model specified",
  "details": {
    "model": "Model 'gpt-5' is not supported"
  }
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired API key"
}
```

#### 402 Payment Required
```json
{
  "success": false,
  "error": "Insufficient credits",
  "message": "Your organization has 0 credits remaining. Please add credits to continue.",
  "balance": 0
}
```

#### 429 Too Many Requests
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

#### 503 Service Unavailable
```json
{
  "success": false,
  "error": "Service unavailable",
  "message": "No providers available for the requested model"
}
```

---

## Rate Limits

Rate limits are applied per API key and are returned in response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T00:01:00.000Z
```

When a rate limit is exceeded, the response includes a `Retry-After` header:

```http
Retry-After: 45
```

---

## SDKs and Libraries

AIRouter is compatible with:

- ✅ OpenAI SDK (JavaScript, Python)
- ✅ LangChain
- ✅ Any OpenAI-compatible library

Simply change the `baseURL` to point to AIRouter!

---

## Need Help?

- 📖 [Quickstart Guide](./QUICKSTART_USER.md)
- 🎯 [Routing Strategies](./ROUTING_STRATEGIES.md)
- 💰 [Pricing Guide](./PRICING.md)
- 🔧 [Best Practices](./BEST_PRACTICES.md)
- 📊 [Interactive API Docs](http://localhost:3000/docs) (Swagger UI)

