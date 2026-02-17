#!/bin/bash

# Test Anthropic API Key
echo "🔍 Testing Anthropic API Key..."
ANTHROPIC_KEY="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"

response=$(curl -s -w "\n%{http_code}" https://api.anthropic.com/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: $ANTHROPIC_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "claude-3-haiku-20240307",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Say test"}]
  }')

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo "✅ Anthropic API key is WORKING!"
    echo "   Response: $(echo $body | grep -o '"text":"[^"]*' | cut -d'"' -f4)"
else
    echo "❌ Anthropic API key FAILED"
    echo "   HTTP Status: $http_code"
    echo "   Error: $body"
fi

echo ""
echo "🔍 Testing Mistral API Key..."
MISTRAL_KEY="xcVU5xqJH4UlvN6o7O1vjUrZyywmboR4"

response=$(curl -s -w "\n%{http_code}" https://api.mistral.ai/v1/models \
  -H "Authorization: Bearer $MISTRAL_KEY")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo "✅ Mistral API key is WORKING!"
    model_count=$(echo $body | grep -o '"id"' | wc -l)
    echo "   Available models: $model_count"
else
    echo "❌ Mistral API key FAILED"
    echo "   HTTP Status: $http_code"
    echo "   Error: $body"
fi

echo ""
echo "🔍 Testing OpenAI API Key..."
OPENAI_KEY="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"

response=$(curl -s -w "\n%{http_code}" https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_KEY")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" -eq 200 ]; then
    echo "✅ OpenAI API key is WORKING!"
    model_count=$(echo $body | grep -o '"id"' | wc -l)
    echo "   Available models: $model_count"
else
    echo "❌ OpenAI API key FAILED"
    echo "   HTTP Status: $http_code"
    echo "   Error: $(echo $body | head -c 200)"
fi

