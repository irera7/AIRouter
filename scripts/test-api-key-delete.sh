#!/bin/bash

# Test API Key Delete Functionality

API_URL="http://localhost:3000"

echo "🧪 Testing API Key Delete Functionality"
echo "========================================"
echo ""

# Step 1: Login
echo "1️⃣ Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@airouter.dev",
    "password": "demo123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "$LOGIN_RESPONSE" | jq '.'
  exit 1
fi

echo "✅ Logged in successfully"
echo ""

# Step 2: List existing API keys
echo "2️⃣ Listing existing API keys..."
LIST_RESPONSE=$(curl -s -X GET "$API_URL/api/v1/auth/api-keys" \
  -H "Authorization: Bearer $TOKEN")

echo "$LIST_RESPONSE" | jq '.'
echo ""

EXISTING_COUNT=$(echo $LIST_RESPONSE | jq '.data | length')
echo "📊 Found $EXISTING_COUNT existing API key(s)"
echo ""

# Step 3: Create a test API key
echo "3️⃣ Creating a test API key..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/api/v1/auth/api-keys" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Delete Key"
  }')

echo "$CREATE_RESPONSE" | jq '.'
echo ""

KEY_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id')

if [ "$KEY_ID" == "null" ] || [ -z "$KEY_ID" ]; then
  echo "❌ Failed to create API key!"
  exit 1
fi

echo "✅ Created test API key with ID: $KEY_ID"
echo ""

# Step 4: Verify key exists
echo "4️⃣ Verifying key was created..."
LIST_RESPONSE=$(curl -s -X GET "$API_URL/api/v1/auth/api-keys" \
  -H "Authorization: Bearer $TOKEN")

NEW_COUNT=$(echo $LIST_RESPONSE | jq '.data | length')
echo "📊 Now have $NEW_COUNT API key(s)"

if [ "$NEW_COUNT" -le "$EXISTING_COUNT" ]; then
  echo "❌ Key count didn't increase!"
  exit 1
fi

echo "✅ Key exists in list"
echo ""

# Step 5: Delete the test API key
echo "5️⃣ Deleting the test API key..."
DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/api/v1/auth/api-keys/$KEY_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$DELETE_RESPONSE" | jq '.'
echo ""

DELETE_SUCCESS=$(echo $DELETE_RESPONSE | jq -r '.success')

if [ "$DELETE_SUCCESS" != "true" ]; then
  echo "❌ Delete request failed!"
  exit 1
fi

echo "✅ Delete request successful"
echo ""

# Step 6: Verify key was deleted
echo "6️⃣ Verifying key was deleted..."
FINAL_RESPONSE=$(curl -s -X GET "$API_URL/api/v1/auth/api-keys" \
  -H "Authorization: Bearer $TOKEN")

FINAL_COUNT=$(echo $FINAL_RESPONSE | jq '.data | length')
echo "📊 Now have $FINAL_COUNT API key(s)"

if [ "$FINAL_COUNT" -ne "$EXISTING_COUNT" ]; then
  echo "❌ Key count didn't return to original!"
  echo "Expected: $EXISTING_COUNT, Got: $FINAL_COUNT"
  exit 1
fi

echo "✅ Key successfully deleted from database"
echo ""

echo "🎉 All tests passed!"
echo "========================================"
echo ""
echo "Summary:"
echo "  - ✅ Login works"
echo "  - ✅ List API keys works"
echo "  - ✅ Create API key works"
echo "  - ✅ Delete API key works"
echo "  - ✅ Key removed from list after delete"
echo ""
echo "🚀 API Key delete functionality is working correctly!"

