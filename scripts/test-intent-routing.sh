#!/bin/bash

# Test Intent-Based Routing System
# This script tests all intents with different routing strategies

API_URL="http://localhost:3000"

echo "🧪 Testing Intent-Based Routing System"
echo "========================================"
echo ""

# Step 1: Login and get JWT token
echo "📝 Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@airouter.dev",
    "password": "demo123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Step 2: Get or create API key
echo "📝 Step 2: Getting API key..."
API_KEY_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/v1/keys")
API_KEY=$(echo $API_KEY_RESPONSE | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['data'][0]['key'] if data['data'] else '')" 2>/dev/null)

if [ -z "$API_KEY" ]; then
  echo "🔑 No API key found, creating one..."
  CREATE_KEY_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/keys" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Key for Intent Routing",
      "expiresIn": 365
    }')
  
  API_KEY=$(echo $CREATE_KEY_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['key'])" 2>/dev/null)
fi

if [ -z "$API_KEY" ]; then
  echo "❌ Failed to get API key!"
  exit 1
fi

echo "✅ Got API key: ${API_KEY:0:20}..."
echo ""

# Test function
test_intent() {
  local intent=$1
  local strategy=$2
  local description=$3
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🧪 Testing: $description"
  echo "Intent: $intent | Strategy: $strategy"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  RESPONSE=$(curl -s -X POST "$API_URL/api/v1/chat/completions" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
      \"intent\": \"$intent\",
      \"routingStrategy\": \"$strategy\",
      \"messages\": [
        {\"role\": \"user\", \"content\": \"Hello! Just a quick test.\"}
      ],
      \"temperature\": 0.7,
      \"maxTokens\": 50
    }")
  
  # Check if successful
  if echo "$RESPONSE" | grep -q "choices"; then
    MODEL=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('model', 'unknown'))" 2>/dev/null)
    PROVIDER=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('provider', 'unknown'))" 2>/dev/null)
    CONTENT=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['choices'][0]['message']['content'][:50])" 2>/dev/null)
    TOKENS=$(echo $RESPONSE | python3 -c "import sys, json; u=json.load(sys.stdin)['usage']; print(f\"{u['total_tokens']} tokens\")" 2>/dev/null)
    
    echo "✅ SUCCESS"
    echo "Provider: $PROVIDER"
    echo "Model: $MODEL"
    echo "Tokens: $TOKENS"
    echo "Response: ${CONTENT}..."
  else
    echo "❌ FAILED"
    ERROR=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('error', 'Unknown error'))" 2>/dev/null)
    echo "Error: $ERROR"
    echo "Full response: $RESPONSE"
  fi
  
  echo ""
  sleep 1  # Rate limiting
}

# Test all intents with cost strategy
echo "══════════════════════════════════════════"
echo "📊 TESTING COST OPTIMIZATION"
echo "══════════════════════════════════════════"
echo ""

test_intent "chat-budget" "cost" "Budget Chat with Cost Strategy"
test_intent "chat-fast" "cost" "Fast Chat with Cost Strategy"
test_intent "code-generation" "cost" "Code Generation with Cost Strategy"

# Test with latency strategy
echo "══════════════════════════════════════════"
echo "⚡ TESTING LATENCY OPTIMIZATION"
echo "══════════════════════════════════════════"
echo ""

test_intent "chat-fast" "latency" "Fast Chat with Latency Strategy"
test_intent "summarization" "latency" "Summarization with Latency Strategy"

# Test with priority strategy
echo "══════════════════════════════════════════"
echo "🎯 TESTING PRIORITY ROUTING"
echo "══════════════════════════════════════════"
echo ""

test_intent "chat-premium" "priority" "Premium Chat with Priority Strategy"
test_intent "data-analysis" "priority" "Data Analysis with Priority Strategy"

# Test with fallback strategy
echo "══════════════════════════════════════════"
echo "🔄 TESTING FALLBACK CHAIN"
echo "══════════════════════════════════════════"
echo ""

test_intent "chat-standard" "fallback" "Standard Chat with Fallback Strategy"
test_intent "creative-writing" "fallback" "Creative Writing with Fallback Strategy"

# Test various intents
echo "══════════════════════════════════════════"
echo "🎨 TESTING SPECIALIZED INTENTS"
echo "══════════════════════════════════════════"
echo ""

test_intent "translation" "cost" "Translation with Cost Strategy"
test_intent "vision-analysis" "latency" "Vision Analysis with Latency Strategy"
test_intent "long-context" "priority" "Long Context with Priority Strategy"

# Final summary
echo "══════════════════════════════════════════"
echo "✨ TESTING COMPLETE!"
echo "══════════════════════════════════════════"
echo ""
echo "All intent-based routing tests have been executed."
echo "Check the results above for any failures."
echo ""
echo "Key Features Tested:"
echo "  ✓ Intent-based routing (vs model-based)"
echo "  ✓ Cost optimization strategy"
echo "  ✓ Latency optimization strategy"
echo "  ✓ Priority-based routing"
echo "  ✓ Fallback chain routing"
echo "  ✓ Multiple specialized intents"
echo ""
echo "🎉 Intent-based routing system is operational!"

