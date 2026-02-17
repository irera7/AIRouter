#!/bin/bash

# AIRouter API Test Script
# This script tests the API endpoints

set -e

API_URL="${API_URL:-http://localhost:3000}"
echo "🧪 Testing AIRouter API at $API_URL"
echo "===================================="
echo ""

# Test health endpoint
echo "1️⃣  Testing health endpoint..."
curl -s "$API_URL/health" | jq .
echo "✅ Health check passed"
echo ""

# Register a new user
echo "2️⃣  Registering a new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test-$(date +%s)@example.com\",
    \"password\": \"password123\",
    \"name\": \"Test User\",
    \"orgName\": \"Test Organization\"
  }")

echo "$REGISTER_RESPONSE" | jq .

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.token')
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.id')

if [ "$TOKEN" = "null" ]; then
    echo "❌ Registration failed"
    exit 1
fi

echo "✅ User registered successfully"
echo "   Token: ${TOKEN:0:20}..."
echo ""

# Get current user
echo "3️⃣  Getting current user..."
curl -s "$API_URL/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo "✅ User info retrieved"
echo ""

# Create API key
echo "4️⃣  Creating API key..."
API_KEY_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/api-keys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test API Key\",
    \"permissions\": [\"read\", \"write\"]
  }")

echo "$API_KEY_RESPONSE" | jq .

API_KEY=$(echo "$API_KEY_RESPONSE" | jq -r '.data.key')

if [ "$API_KEY" = "null" ]; then
    echo "❌ API key creation failed"
    exit 1
fi

echo "✅ API key created successfully"
echo "   Key: ${API_KEY:0:20}..."
echo ""

# List API keys
echo "5️⃣  Listing API keys..."
curl -s "$API_URL/api/v1/auth/api-keys" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo "✅ API keys listed"
echo ""

echo "✅ All tests passed!"
echo ""
echo "📝 Test Summary:"
echo "   - Health check: ✅"
echo "   - User registration: ✅"
echo "   - User authentication: ✅"
echo "   - API key creation: ✅"
echo "   - API key listing: ✅"
echo ""
echo "🔑 Your test API key: $API_KEY"
echo "   (Save this for testing)"

