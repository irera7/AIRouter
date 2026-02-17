Test the API keys manually by running these commands:

1. Test Anthropic:
```bash
curl -s https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: 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" \
  -H "anthropic-version: 2023-06-01" \
  -d '{"model": "claude-3-haiku-20240307", "max_tokens": 10, "messages": [{"role": "user", "content": "Say test"}]}'
```

2. Test Mistral:
```bash
curl -s https://api.mistral.ai/v1/models \
  -H "Authorization: Bearer xcVU5xqJH4UlvN6o7O1vjUrZyywmboR4"
```

3. Test OpenAI:
```bash
curl -s https://api.openai.com/v1/models \
  -H "Authorization: Bearer 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"
```

Or run the Node.js test:
```bash
cd /home/reza/AIRouter
node test-api-direct.mjs
```

