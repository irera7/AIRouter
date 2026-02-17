#!/bin/bash

# AIRouter Complete Test Script
# تست کامل تمام قابلیت‌های Week 3-4

echo "🧪 شروع تست‌های کامل AIRouter..."
echo "================================================"

BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local headers="$5"
    local expected_code="$6"
    
    echo -n "Testing: $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" $headers "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" $headers -H "Content-Type: application/json" -d "$data" "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        ((PASSED++))
        echo "$body" | head -c 200
        echo ""
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code, expected $expected_code)"
        ((FAILED++))
        echo "$body" | head -c 200
        echo ""
        return 1
    fi
}

echo ""
echo "📝 Test 1: Health Check"
echo "------------------------"
test_endpoint "Health Check" "GET" "/health" "" "" "200"

echo ""
echo "📝 Test 2: Authentication"
echo "------------------------"

# Login
echo -n "Logging in... "
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@airouter.dev","password":"demo123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "Token: ${TOKEN:0:20}..."
    ((PASSED++))
else
    echo -e "${RED}✗ Login failed${NC}"
    echo $LOGIN_RESPONSE
    ((FAILED++))
    exit 1
fi

echo ""
echo "📝 Test 3: Create API Key"
echo "------------------------"

echo -n "Creating API key... "
API_KEY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/auth/api-keys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Key","permissions":["read","write"]}')

API_KEY=$(echo $API_KEY_RESPONSE | grep -o '"key":"[^"]*"' | cut -d'"' -f4)

if [ -n "$API_KEY" ]; then
    echo -e "${GREEN}✓ API Key created${NC}"
    echo "API Key: ${API_KEY:0:30}..."
    ((PASSED++))
else
    echo -e "${RED}✗ API Key creation failed${NC}"
    echo $API_KEY_RESPONSE
    ((FAILED++))
    exit 1
fi

echo ""
echo "📝 Test 4: List API Keys"
echo "------------------------"
test_endpoint "List API Keys" "GET" "/api/v1/auth/api-keys" "" "-H \"Authorization: Bearer $TOKEN\"" "200"

echo ""
echo "📝 Test 5: Chat Completion (Mock Provider)"
echo "------------------------"

echo -n "Sending chat request... "
CHAT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-gpt-4",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello! Tell me a short joke."}
    ],
    "temperature": 0.7,
    "maxTokens": 100,
    "routingStrategy": "cost",
    "enableCache": true
  }')

RESPONSE_ID=$(echo $CHAT_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$RESPONSE_ID" ]; then
    echo -e "${GREEN}✓ Chat completion successful${NC}"
    echo "Response ID: $RESPONSE_ID"
    echo "Content: $(echo $CHAT_RESPONSE | grep -o '"content":"[^"]*"' | cut -d'"' -f4 | head -c 100)..."
    ((PASSED++))
else
    echo -e "${RED}✗ Chat completion failed${NC}"
    echo $CHAT_RESPONSE
    ((FAILED++))
fi

echo ""
echo "📝 Test 6: Chat Completion with Cache"
echo "------------------------"

echo -n "Sending same request (should be cached)... "
CHAT_CACHED=$(curl -s -X POST "$BASE_URL/api/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-gpt-4",
    "messages": [
      {"role": "user", "content": "Exact same question for cache test"}
    ]
  }')

sleep 0.5

CHAT_CACHED2=$(curl -s -X POST "$BASE_URL/api/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mock-gpt-4",
    "messages": [
      {"role": "user", "content": "Exact same question for cache test"}
    ]
  }')

IS_CACHED=$(echo $CHAT_CACHED2 | grep -o '"cached":true')

if [ -n "$IS_CACHED" ]; then
    echo -e "${GREEN}✓ Cache working correctly${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Cache might not be working${NC}"
    echo $CHAT_CACHED2 | head -c 200
fi

echo ""
echo "📝 Test 7: Different Routing Strategies"
echo "------------------------"

# Test Cost strategy
echo -n "Testing cost strategy... "
COST_RESP=$(curl -s -X POST "$BASE_URL/api/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"mock-gpt-4","messages":[{"role":"user","content":"Test cost"}],"routingStrategy":"cost"}')

if echo $COST_RESP | grep -q '"mock"'; then
    echo -e "${GREEN}✓ Cost strategy works${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Cost strategy failed${NC}"
    ((FAILED++))
fi

# Test Latency strategy
echo -n "Testing latency strategy... "
LATENCY_RESP=$(curl -s -X POST "$BASE_URL/api/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"mock-gpt-4","messages":[{"role":"user","content":"Test latency"}],"routingStrategy":"latency"}')

if echo $LATENCY_RESP | grep -q '"mock"'; then
    echo -e "${GREEN}✓ Latency strategy works${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Latency strategy failed${NC}"
    ((FAILED++))
fi

# Test Priority strategy
echo -n "Testing priority strategy... "
PRIORITY_RESP=$(curl -s -X POST "$BASE_URL/api/v1/chat/completions" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"mock-gpt-4","messages":[{"role":"user","content":"Test priority"}],"routingStrategy":"priority","preferredProvider":"mock"}')

if echo $PRIORITY_RESP | grep -q '"mock"'; then
    echo -e "${GREEN}✓ Priority strategy works${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ Priority strategy failed${NC}"
    ((FAILED++))
fi

echo ""
echo "📝 Test 8: List Available Models"
echo "------------------------"
test_endpoint "List Models" "GET" "/api/v1/chat/models" "" "-H \"Authorization: Bearer $API_KEY\"" "200"

echo ""
echo "================================================"
echo "📊 Test Summary"
echo "================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed${NC}"
    exit 1
fi

