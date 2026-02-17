#!/bin/bash

# Complete Admin API Test Suite
# تست جامع تمام Admin APIs

echo "🧪 AIRouter Admin API Tests"
echo "============================"
echo ""

BASE_URL="http://localhost:3000"
API_KEY=$(cat /tmp/test-apikey.txt 2>/dev/null)

if [ -z "$API_KEY" ]; then
    echo "❌ API Key not found. Please login first."
    exit 1
fi

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASSED=0
FAILED=0

test_api() {
    local name="$1"
    local method="$2"
    local endpoint="$3"
    local data="$4"
    local expected_code="$5"
    
    echo -n "Testing: $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" -H "Authorization: Bearer $API_KEY")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $API_KEY" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        ((PASSED++))
        echo "$body" | head -c 150 | tr -d '\n'
        echo ""
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code, expected $expected_code)"
        ((FAILED++))
        echo "$body" | head -c 200
        echo ""
    fi
    echo ""
}

echo "📊 Test 1: System Statistics"
echo "-----------------------------"
test_api "Get System Stats" "GET" "/api/v1/admin/stats" "" "200"

echo "👥 Test 2: User Management"
echo "---------------------------"
test_api "List Users" "GET" "/api/v1/admin/users?limit=10" "" "200"

echo "🏢 Test 3: Organization Management"
echo "-----------------------------------"
test_api "List Organizations" "GET" "/api/v1/admin/organizations?limit=10" "" "200"

echo "🔌 Test 4: Provider Management"
echo "--------------------------------"
test_api "List Providers" "GET" "/api/v1/admin/providers" "" "200"

echo "⚡ Test 5: Rate Limiting"
echo "-------------------------"
RATE_LIMIT_DATA='{
  "orgId": "51dfcdfd-c10b-4ca5-8a65-011a3190c724",
  "requestsPerMinute": 100,
  "requestsPerHour": 1000,
  "requestsPerDay": 10000,
  "enabled": true
}'
test_api "Set Rate Limit" "POST" "/api/v1/admin/rate-limits" "$RATE_LIMIT_DATA" "200"
test_api "Get Rate Limits" "GET" "/api/v1/admin/rate-limits" "" "200"

echo "🎯 Test 6: Routing Policies"
echo "----------------------------"
POLICY_DATA='{
  "orgId": "51dfcdfd-c10b-4ca5-8a65-011a3190c724",
  "name": "GPT-4 Only Policy",
  "description": "Route GPT-4 requests to OpenAI",
  "priority": 10,
  "conditions": [
    {
      "type": "model",
      "operator": "contains",
      "value": "gpt-4"
    }
  ],
  "actions": [
    {
      "type": "route_to",
      "params": {"provider": "openai"}
    }
  ],
  "enabled": true
}'
test_api "Create Routing Policy" "POST" "/api/v1/admin/routing-policies" "$POLICY_DATA" "201"
test_api "List Routing Policies" "GET" "/api/v1/admin/routing-policies" "" "200"

echo "📝 Test 7: Audit Logs"
echo "----------------------"
test_api "Get Audit Logs" "GET" "/api/v1/admin/audit-logs?limit=10" "" "200"
test_api "Get Audit Stats" "GET" "/api/v1/admin/audit-logs/stats" "" "200"

echo ""
echo "================================================"
echo "📊 Test Summary"
echo "================================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "Total: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All admin tests passed!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠ Some tests failed (this may be expected for non-admin users)${NC}"
    exit 1
fi

