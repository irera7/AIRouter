#!/bin/bash

echo "🔍 Diagnosing 503 Service Unavailable Error"
echo "=========================================="
echo ""

# Check if backend is running
echo "1️⃣ Checking if backend is running..."
BACKEND_HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null)
if [ $? -eq 0 ]; then
  echo "✅ Backend is running"
  echo "   Response: $BACKEND_HEALTH"
else
  echo "❌ Backend is NOT running or not responding"
  echo "   Please start the backend with: npm run dev"
  exit 1
fi
echo ""

# Check providers in database
echo "2️⃣ Checking providers in database..."
docker compose exec -T postgres psql -U airouter -d airouter -c "
  SELECT 
    name, 
    display_name,
    is_active,
    jsonb_array_length(config->'supportedModels') as model_count,
    base_url
  FROM providers 
  WHERE is_active = true
  ORDER BY priority DESC;
"
echo ""

# Check if API keys are set in environment
echo "3️⃣ Checking API keys in .env..."
if grep -q "OPENAI_API_KEY=sk-" .env 2>/dev/null; then
  echo "✅ OPENAI_API_KEY is set"
else
  echo "⚠️  OPENAI_API_KEY is not set or empty"
fi

if grep -q "ANTHROPIC_API_KEY=sk-" .env 2>/dev/null; then
  echo "✅ ANTHROPIC_API_KEY is set"
else
  echo "⚠️  ANTHROPIC_API_KEY is not set or empty"
fi

if grep -q "MISTRAL_API_KEY=" .env 2>/dev/null && ! grep -q "MISTRAL_API_KEY=your-" .env 2>/dev/null; then
  echo "✅ MISTRAL_API_KEY is set"
else
  echo "⚠️  MISTRAL_API_KEY is not set or using placeholder"
fi

if grep -q "GEMINI_API_KEY=" .env 2>/dev/null && ! grep -q "GEMINI_API_KEY=your-" .env 2>/dev/null; then
  echo "✅ GEMINI_API_KEY is set"
else
  echo "⚠️  GEMINI_API_KEY is not set or using placeholder"
fi
echo ""

# Common causes of 503
echo "4️⃣ Common Causes of 503 Error:"
echo "   a) Backend hasn't restarted after database changes"
echo "   b) Model name doesn't exist in provider's actual API"
echo "   c) Provider API is down or rate limited"
echo "   d) Invalid API key for the provider"
echo "   e) Provider initialization failed"
echo ""

# Solutions
echo "💡 Recommended Solutions:"
echo ""
echo "   Option 1: Restart Backend"
echo "   -------------------------"
echo "   The backend needs to reload provider configs from database."
echo "   - Stop the backend (Ctrl+C)"
echo "   - Start again: npm run dev"
echo ""
echo "   Option 2: Check Backend Logs"
echo "   ----------------------------"
echo "   Look for errors like:"
echo "   - 'Provider initialization failed'"
echo "   - 'Invalid API key'"
echo "   - 'Model not found'"
echo "   - 'Rate limit exceeded'"
echo ""
echo "   Option 3: Test with Working Model"
echo "   ----------------------------------"
echo "   Try a model that definitely exists:"
echo "   - OpenAI: gpt-4o-mini (fast, cheap, always available)"
echo "   - Anthropic: claude-3-haiku-20240307"
echo "   - Mistral: mistral-small-latest"
echo "   - Gemini: gemini-1.5-flash"
echo ""
echo "   Option 4: Verify Model Exists"
echo "   -----------------------------"
echo "   Some models may not be publicly available yet:"
echo "   - gpt-5: May not exist yet (use gpt-4o instead)"
echo "   - o3-mini: May be preview only"
echo ""

echo "=========================================="
echo ""
echo "🎯 Quick Test:"
echo "Try this model in the playground:"
echo "  Provider: OpenAI"
echo "  Model: gpt-4o-mini"
echo "  (This model definitely exists and works)"

