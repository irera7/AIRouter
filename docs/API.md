# AIRouter API Reference

Base URL: `http://localhost:3000/api/v1`

## Authentication

AIRouter supports two authentication methods:

1. **JWT Tokens** - For dashboard and user management
2. **API Keys** - For programmatic access to LLM endpoints

## Endpoints

### Health Check

Check if the API is running.

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

---

## Authentication Endpoints

### Register User

Create a new user account and organization.

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "orgName": "My Organization"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "owner"
    },
    "org": {
      "id": "uuid",
      "name": "My Organization",
      "slug": "my-organization"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400` - Validation error
- `409` - Email already exists

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
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "owner"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400` - Validation error
- `401` - Invalid credentials

---

### Get Current User

Get information about the authenticated user.

```http
GET /api/v1/auth/me
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "orgId": "uuid",
    "role": "owner"
  }
}
```

**Errors:**
- `401` - Unauthorized (invalid or missing token)

---

### Create API Key

Generate a new API key for programmatic access.

```http
POST /api/v1/auth/api-keys
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Production API Key",
  "permissions": ["read", "write"],
  "expiresAt": "2025-12-31T23:59:59Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Production API Key",
    "key": "sk-air-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "permissions": ["read", "write"],
    "expiresAt": "2025-12-31T23:59:59Z",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Save this key! It will not be shown again."
}
```

**Errors:**
- `400` - Validation error
- `401` - Unauthorized

---

### List API Keys

Get all API keys for your organization.

```http
GET /api/v1/auth/api-keys
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Production API Key",
      "key": "sk-air-xxxx...",
      "permissions": ["read", "write"],
      "isActive": true,
      "lastUsedAt": "2024-01-01T00:00:00Z",
      "expiresAt": "2025-12-31T23:59:59Z",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Errors:**
- `401` - Unauthorized

---

### Revoke API Key

Deactivate an API key.

```http
DELETE /api/v1/auth/api-keys/:keyId
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

**Errors:**
- `401` - Unauthorized
- `404` - API key not found

---

## LLM Endpoints (Coming in Week 3-4)

### Chat Completions

Send a chat completion request to an LLM provider.

```http
POST /api/v1/chat/completions
Authorization: Bearer <api-key>
```

**Request Body:**
```json
{
  "model": "gpt-4",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": false
}
```

**Response:** `200 OK`
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm doing well, thank you for asking. How can I help you today?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 15,
    "total_tokens": 35
  },
  "x-airouter": {
    "provider": "openai",
    "latency_ms": 1234,
    "cost_cents": 5,
    "cached": false
  }
}
```

---

### Embeddings

Generate embeddings for text.

```http
POST /api/v1/embeddings
Authorization: Bearer <api-key>
```

**Request Body:**
```json
{
  "model": "text-embedding-ada-002",
  "input": "The quick brown fox jumps over the lazy dog"
}
```

**Response:** `200 OK`
```json
{
  "object": "list",
  "data": [
    {
      "object": "embedding",
      "embedding": [0.123, -0.456, ...],
      "index": 0
    }
  ],
  "model": "text-embedding-ada-002",
  "usage": {
    "prompt_tokens": 10,
    "total_tokens": 10
  }
}
```

---

## Provider Endpoints (Coming in Week 3-4)

### List Providers

Get all available LLM providers.

```http
GET /api/v1/providers
Authorization: Bearer <api-key>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "openai",
      "displayName": "OpenAI",
      "isActive": true,
      "supportedModels": ["gpt-4", "gpt-3.5-turbo"],
      "pricing": {
        "inputTokenPrice": 30,
        "outputTokenPrice": 60,
        "currency": "USD"
      }
    }
  ]
}
```

---

## Usage Endpoints (Coming in Week 5-6)

### Get Usage Statistics

Get usage statistics for your organization.

```http
GET /api/v1/usage
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `startDate` - Start date (ISO 8601)
- `endDate` - End date (ISO 8601)
- `groupBy` - Group by: `day`, `week`, `month`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalRequests": 1000,
    "totalTokens": 50000,
    "totalCost": 1500,
    "byProvider": {
      "openai": {
        "requests": 600,
        "tokens": 30000,
        "cost": 900
      },
      "anthropic": {
        "requests": 400,
        "tokens": 20000,
        "cost": 600
      }
    },
    "byModel": {
      "gpt-4": {
        "requests": 400,
        "tokens": 20000,
        "cost": 800
      }
    }
  }
}
```

---

## Billing Endpoints (Coming in Week 5-6)

### Get Balance

Get current credit balance.

```http
GET /api/v1/billing/balance
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "balance": 10000,
    "currency": "USD",
    "formatted": "$100.00"
  }
}
```

---

### Add Credits

Add credits to your account.

```http
POST /api/v1/billing/credits
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "amount": 5000,
  "paymentMethod": "stripe",
  "paymentId": "pi_xxx"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "balanceBefore": 10000,
    "balanceAfter": 15000,
    "amount": 5000
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error Type",
  "message": "Human-readable error message",
  "details": {}
}
```

### Common Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid or missing credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Rate Limiting

Rate limits are applied per API key:

- Default: 100 requests per minute
- Headers returned:
  - `X-RateLimit-Limit` - Total allowed requests
  - `X-RateLimit-Remaining` - Remaining requests
  - `X-RateLimit-Reset` - Reset timestamp

---

## SDKs (Coming in Week 7-8)

### Node.js

```javascript
import { AIRouter } from '@airouter/sdk';

const client = new AIRouter({
  apiKey: 'sk-air-xxxxx',
});

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### Python

```python
from airouter import AIRouter

client = AIRouter(api_key='sk-air-xxxxx')

response = client.chat.completions.create(
    model='gpt-4',
    messages=[{'role': 'user', 'content': 'Hello!'}]
)
```

---

## Webhooks (Coming in Week 7-8)

Configure webhooks to receive real-time notifications:

- `request.completed` - Request completed
- `request.failed` - Request failed
- `billing.low_balance` - Balance below threshold
- `billing.credit_added` - Credits added

---

For more information, see the [full documentation](../README.md).

