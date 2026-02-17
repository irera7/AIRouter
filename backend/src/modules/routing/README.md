# Routing Engine

This directory will contain the intelligent routing logic for selecting providers.

## Structure

```
routing/
├── strategies/
│   ├── cost.strategy.ts        # Cost-based routing
│   ├── latency.strategy.ts     # Latency-based routing
│   ├── fallback.strategy.ts    # Fallback routing
│   └── round-robin.strategy.ts # Round-robin routing
├── routing.service.ts          # Main routing logic
├── routing.routes.ts           # Routing API routes
└── routing.types.ts            # TypeScript types
```

## Coming in Week 3-4

- Cost-based routing (cheapest provider)
- Latency-based routing (fastest provider)
- Fallback routing (retry chain)
- Round-robin routing (load balancing)
- Custom routing policies
- A/B testing support

