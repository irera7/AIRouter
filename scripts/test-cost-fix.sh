#!/bin/bash

echo "🧪 Testing Cost Calculation Fix"
echo "================================"
echo ""

# Check if API key is provided
if [ -z "$1" ]; then
  echo "❌ Please provide your API key as argument"
  echo "Usage: ./test-cost-fix.sh YOUR_API_KEY"
  echo ""
  echo "Example:"
  echo "  ./test-cost-fix.sh sk-air-xxxxxxxxxxxxx"
  exit 1
fi

API_KEY=$1
API_URL="http://localhost:3000"

echo "📤 Sending test request with gpt-4o-mini..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/api/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Say hello in exactly 5 words"}
    ],
    "temperature": 0.7,
    "maxTokens": 50
  }')

echo "Response:"
echo "$RESPONSE" | jq '.'
echo ""

# Check if successful
SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Request successful!"
  echo ""
  
  # Wait a moment for database to update
  sleep 2
  
  echo "🔍 Checking database for the new request..."
  echo ""
  
  # Query the latest request from database
  docker compose exec -T postgres psql -U airouter -d airouter -c "
    SELECT 
      model, 
      input_tokens, 
      output_tokens, 
      total_tokens, 
      cost,
      ROUND((cost / 100)::numeric, 6) as cost_dollars,
      status,
      created_at 
    FROM requests 
    ORDER BY created_at DESC 
    LIMIT 1;
  "
  
  echo ""
  echo "📊 Expected result:"
  echo "  - input_tokens: ~10-15"
  echo "  - output_tokens: ~5-10"
  echo "  - cost: > 0 (e.g., 0.15 cents)"
  echo "  - cost_dollars: > 0 (e.g., $0.0015)"
  echo ""
  
  # Get the cost from database
  COST=$(docker compose exec -T postgres psql -U airouter -d airouter -t -c "SELECT cost FROM requests ORDER BY created_at DESC LIMIT 1;" | tr -d ' ')
  
  if [ "$COST" != "0.00" ] && [ "$COST" != "0" ]; then
    echo "🎉 SUCCESS! Cost calculation is working!"
    echo "   Cost: $COST cents = \$$(echo "scale=6; $COST / 100" | bc)"
  else
    echo "❌ FAILED! Cost is still 0"
    echo ""
    echo "This might mean:"
    echo "  1. Backend hasn't restarted yet with the fix"
    echo "  2. The API key doesn't exist or is invalid"
    echo "  3. There's still an issue with the cost calculation"
    echo ""
    echo "Try:"
    echo "  - Restart the backend manually"
    echo "  - Check backend logs for errors"
  fi
else
  echo "❌ Request failed!"
  echo ""
  ERROR=$(echo "$RESPONSE" | jq -r '.error')
  MESSAGE=$(echo "$RESPONSE" | jq -r '.message')
  echo "Error: $ERROR"
  echo "Message: $MESSAGE"
  echo ""
  echo "Common issues:"
  echo "  - Invalid API key"
  echo "  - Backend not running"
  echo "  - OpenAI API key not configured in .env"
fi

echo ""
echo "================================"

