# AIRouter Documentation

Welcome to AIRouter - Your Unified Gateway to AI Models

---

## 🚀 Getting Started

New to AIRouter? Start here:

1. **[Quickstart Guide](./QUICKSTART_USER.md)** - Get up and running in 5 minutes
   - Register an account
   - Create your first API key
   - Make your first AI request
   - Code examples in multiple languages

2. **[API Reference](./API_REFERENCE.md)** - Complete API documentation
   - All endpoints and parameters
   - Request/response formats
   - Error handling
   - Rate limits

3. **[Interactive API Docs](http://localhost:3000/docs)** - Try the API in your browser
   - Swagger/OpenAPI interface
   - Test requests directly
   - See live examples

---

## 📚 Core Concepts

### What is AIRouter?

AIRouter is an **AI API gateway and router** that provides:

✅ **Unified API** - Access multiple AI providers (OpenAI, Anthropic, Mistral) through one interface  
✅ **Intelligent Routing** - Automatically route to the best provider based on cost, speed, or reliability  
✅ **Response Caching** - Instant responses for repeated queries at $0 cost  
✅ **Automatic Fallback** - Seamless failover if a provider is unavailable  
✅ **Usage Analytics** - Track costs, performance, and usage patterns  
✅ **OpenAI Compatible** - Works with existing OpenAI SDK code  

---

## 🎯 Key Features

### [Routing Strategies](./ROUTING_STRATEGIES.md)

Choose how AIRouter selects providers:

- **Cost-Based**: Minimize expenses by routing to the cheapest provider
- **Latency-Based**: Maximize speed by routing to the fastest provider
- **Priority**: Use your preferred provider with automatic fallback
- **Fallback**: Maximum reliability with automatic provider failover

[Learn more about routing →](./ROUTING_STRATEGIES.md)

### Response Caching

Save costs and improve speed:
- Identical requests return instantly from cache
- Cached responses cost $0
- Automatic cache key generation
- Configurable cache behavior

### Provider Management

Manage multiple AI providers:
- OpenAI (GPT-3.5, GPT-4, GPT-4 Turbo)
- Anthropic (Claude 3 Opus, Sonnet, Haiku)
- Mistral AI
- Custom providers

### Analytics & Monitoring

Track your AI usage:
- Request volume and patterns
- Cost breakdown by provider and model
- Latency metrics
- Cache hit rates
- Provider success rates

---

## 📖 Documentation

### For Developers

| Document | Description |
|----------|-------------|
| [Quickstart Guide](./QUICKSTART_USER.md) | Get started in 5 minutes |
| [API Reference](./API_REFERENCE.md) | Complete API documentation |
| [Routing Strategies](./ROUTING_STRATEGIES.md) | Deep dive into routing options |
| [Authentication](./API_REFERENCE.md#authentication) | API keys and security |
| [Error Handling](./ERROR_HANDLING.md) | Handle errors gracefully |

### Advanced Topics

| Document | Description |
|----------|-------------|
| [Architecture](./ARCHITECTURE.md) | System design and components |
| [Features](./FEATURES.md) | Detailed feature documentation |
| [Best Practices](./BEST_PRACTICES.md) | Optimization tips |
| [Project Structure](./PROJECT_STRUCTURE.md) | Codebase organization |

### For Admins

| Document | Description |
|----------|-------------|
| [Installation](./INSTALLATION_COMPLETE.md) | Setup instructions |
| [Setup Prerequisites](./SETUP_PREREQUISITES.md) | Requirements and dependencies |
| [Get Started](./GET_STARTED.md) | Deployment guide |

---

## 🔧 Quick Examples

### Basic Chat Completion

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-air-your-api-key" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Hello, world!"}
    ]
  }'
```

### With OpenAI SDK (JavaScript)

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:3000/api/v1',
  apiKey: 'sk-air-your-api-key',
});

const completion = await openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'user', content: 'Hello, world!' },
  ],
});

console.log(completion.choices[0].message.content);
```

### With Cost Optimization

```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer sk-air-your-api-key" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Summarize this text..."}
    ],
    "routingStrategy": "cost",
    "enableCache": true
  }'
```

---

## 🎓 Tutorials

### Tutorial 1: Your First Integration

1. Register and get an API key
2. Make your first request
3. Handle responses and errors
4. Monitor usage

[View full tutorial →](./QUICKSTART_USER.md)

### Tutorial 2: Optimizing Costs

1. Use cost-based routing
2. Enable response caching
3. Choose the right models
4. Monitor and analyze spending

[View routing strategies →](./ROUTING_STRATEGIES.md)

### Tutorial 3: Building Production Apps

1. Implement error handling
2. Set up fallback routing
3. Monitor performance
4. Scale your integration

---

## 🔗 Useful Links

### Live Resources

- **API Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs) (Swagger UI)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)
- **Metrics**: [http://localhost:3000/metrics](http://localhost:3000/metrics)

### Code Examples

All examples are available in:
- [JavaScript/TypeScript](./QUICKSTART_USER.md#using-javascripttypescript)
- [Python](./QUICKSTART_USER.md#using-python)
- [cURL](./QUICKSTART_USER.md#using-curl)

---

## 📊 Comparison

### AIRouter vs Direct Provider APIs

| Feature | AIRouter | Direct APIs |
|---------|----------|-------------|
| **Multiple Providers** | ✅ Unified interface | ❌ Separate integrations |
| **Automatic Fallback** | ✅ Built-in | ❌ Manual implementation |
| **Cost Optimization** | ✅ Automatic routing | ❌ Manual selection |
| **Response Caching** | ✅ Built-in | ❌ Custom implementation |
| **Analytics** | ✅ Comprehensive | ❌ Per-provider only |
| **OpenAI Compatible** | ✅ Yes | ✅ Yes (OpenAI only) |

### Similar to OpenRouter

AIRouter is inspired by [OpenRouter](https://openrouter.ai/docs) but provides:
- ✅ **Self-hosted** - Full control over your infrastructure
- ✅ **Open source** - Customize to your needs
- ✅ **No markup** - Only pay provider costs + your infrastructure
- ✅ **Custom routing** - Implement your own routing logic
- ✅ **Private deployment** - Keep data in your network

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│           Client Application            │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│           AIRouter Gateway              │
│  ┌────────────────────────────────────┐ │
│  │  Authentication & Rate Limiting    │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Request Caching                   │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Routing Engine                    │ │
│  │  • Cost-based                      │ │
│  │  • Latency-based                   │ │
│  │  • Priority                        │ │
│  │  • Fallback                        │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Analytics & Billing               │ │
│  └────────────────────────────────────┘ │
└───────────────┬─────────────────────────┘
                │
        ┌───────┼───────┐
        ▼       ▼       ▼
    ┌─────┐ ┌─────┐ ┌─────┐
    │OpenAI│ │Claude│ │Other│
    └─────┘ └─────┘ └─────┘
```

[Learn more about architecture →](./ARCHITECTURE.md)

---

## 💡 Use Cases

### 1. Cost Optimization

Automatically route to the cheapest provider:

```javascript
{
  "model": "gpt-3.5-turbo",
  "routingStrategy": "cost"  // Use cheapest provider
}
```

### 2. High Availability

Ensure requests always succeed:

```javascript
{
  "model": "gpt-4",
  "routingStrategy": "fallback"  // Auto-failover
}
```

### 3. Performance

Minimize latency for real-time apps:

```javascript
{
  "model": "gpt-3.5-turbo",
  "routingStrategy": "latency"  // Use fastest provider
}
```

### 4. Multi-Provider Strategy

Use different providers for different use cases:

```javascript
// Expensive reasoning tasks
{ model: "gpt-4", preferredProvider: "openai" }

// Simple tasks
{ model: "gpt-3.5-turbo", routingStrategy: "cost" }

// Long context
{ model: "claude-3-opus", preferredProvider: "anthropic" }
```

---

## 🔐 Security

AIRouter implements:

- ✅ **API Key Authentication** - Secure access control
- ✅ **Rate Limiting** - Prevent abuse
- ✅ **Request Validation** - Input sanitization
- ✅ **Audit Logging** - Track all activities
- ✅ **CORS Protection** - Browser security
- ✅ **Encrypted Storage** - API keys hashed with bcrypt

---

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

### Metrics (Prometheus)

```bash
curl http://localhost:3000/metrics
```

### Analytics Dashboard

```bash
curl -X GET "http://localhost:3000/api/v1/analytics?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer sk-air-your-api-key"
```

---

## 🤝 Contributing

AIRouter is open source! Contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

Need help?

- 📖 **Documentation**: You're reading it!
- 🐛 **Bug Reports**: Create a GitHub issue
- 💬 **Discussions**: GitHub Discussions
- 📧 **Email**: support@airouter.dev

---

## 📝 License

AIRouter is released under the MIT License.

---

## 🗺️ Roadmap

Upcoming features:

- [ ] More AI providers (Google, Cohere, etc.)
- [ ] Streaming support
- [ ] Webhooks
- [ ] Custom routing algorithms
- [ ] Grafana dashboards
- [ ] Multi-region deployment
- [ ] Enterprise features

---

## 🎉 Get Started Now!

1. [Quickstart Guide](./QUICKSTART_USER.md) - 5 minute setup
2. [API Reference](./API_REFERENCE.md) - Complete documentation
3. [Interactive Docs](http://localhost:3000/docs) - Try it live

**Happy building!** 🚀

