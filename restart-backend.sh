#!/bin/bash

echo "🔄 Restarting Backend to Apply o1/o3 Fix"
echo "========================================"
echo ""

# Check if backend is running
BACKEND_PID=$(ps aux | grep "tsx.*backend/src/index.ts" | grep -v grep | awk '{print $2}')

if [ ! -z "$BACKEND_PID" ]; then
  echo "📍 Found backend running (PID: $BACKEND_PID)"
  echo "🛑 Stopping backend..."
  kill $BACKEND_PID
  sleep 2
  echo "✅ Backend stopped"
else
  echo "ℹ️  Backend is not running"
fi

echo ""
echo "🚀 Starting backend..."
echo ""
echo "Please run in a separate terminal:"
echo "  cd /home/reza/AIRouter"
echo "  npm run dev"
echo ""
echo "Or press Ctrl+C in the terminal where backend is running,"
echo "then run 'npm run dev' again."
echo ""
echo "========================================"
echo ""
echo "💡 Why This Is Needed:"
echo "   The o1/o3 model fix requires restarting the backend"
echo "   to load the updated OpenAIProvider code."
echo ""
echo "✅ After Restart:"
echo "   - o1/o3 models will use max_completion_tokens"
echo "   - Regular models will use max_tokens"
echo "   - Cost optimization will work correctly"
echo ""
echo "🧪 To Test:"
echo "   1. Wait for backend to finish starting"
echo "   2. Look for 'Server listening' message"
echo "   3. Try your request again in the playground"
echo "   4. Should work without 400 error!"

