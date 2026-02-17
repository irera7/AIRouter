# Provider Connectors

This directory will contain provider-specific connectors for different LLM providers.

## Structure

```
providers/
├── connectors/
│   ├── base.connector.ts       # Base interface
│   ├── openai.connector.ts     # OpenAI implementation
│   ├── anthropic.connector.ts  # Anthropic implementation
│   └── mock.connector.ts       # Mock for testing
├── provider.service.ts         # Provider management
├── provider.routes.ts          # Provider API routes
└── provider.types.ts           # TypeScript types
```

## Coming in Week 3-4

- OpenAI connector (GPT-4, GPT-3.5)
- Anthropic connector (Claude 3)
- Mock connector for testing
- Provider health checks
- Token counting
- Cost calculation

