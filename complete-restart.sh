#!/bin/bash

echo "════════════════════════════════════════════════════"
echo "  🔄 COMPLETE FRONTEND RESTART WITH DIAGNOSTICS"
echo "════════════════════════════════════════════════════"
echo ""

cd /home/reza/AIRouter/frontend

# Step 1: Verify environment file
echo "1️⃣  Checking .env.local file..."
if [ -f .env.local ]; then
    echo "   ✅ .env.local exists"
    echo "   📄 Contents:"
    grep "NEXT_PUBLIC_API_URL" .env.local
    API_URL=$(grep "NEXT_PUBLIC_API_URL" .env.local | cut -d'=' -f2)
    echo "   🎯 Extracted URL: $API_URL"
else
    echo "   ❌ ERROR: .env.local not found!"
    exit 1
fi

echo ""

# Step 2: Kill existing processes
echo "2️⃣  Stopping existing Next.js processes..."
pkill -f "next dev"
pkill -f "node.*next"
sleep 3
echo "   ✅ Processes stopped"

echo ""

# Step 3: Clear all caches
echo "3️⃣  Clearing all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
echo "   ✅ Caches cleared (.next, node_modules/.cache, .turbo)"

echo ""

# Step 4: Export environment variable explicitly
echo "4️⃣  Setting environment variable..."
export NEXT_PUBLIC_API_URL="$API_URL"
echo "   ✅ Exported: NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

echo ""

# Step 5: Start with logging
echo "5️⃣  Starting Next.js development server..."
echo "   📝 Logs will be saved to: /tmp/airouter-frontend-debug.log"

# Start with environment variable explicitly set
NEXT_PUBLIC_API_URL="$API_URL" npm run dev > /tmp/airouter-frontend-debug.log 2>&1 &
PID=$!

echo "   🚀 Frontend starting (PID: $PID)..."
echo ""

# Step 6: Wait for compilation
echo "6️⃣  Waiting for Next.js to compile..."
for i in {1..30}; do
    sleep 1
    if grep -q "Ready in" /tmp/airouter-frontend-debug.log 2>/dev/null; then
        echo "   ✅ Compilation complete!"
        break
    fi
    if grep -q "Error" /tmp/airouter-frontend-debug.log 2>/dev/null; then
        echo "   ❌ Error detected during compilation!"
        echo "   📄 Last 10 lines of log:"
        tail -10 /tmp/airouter-frontend-debug.log
        exit 1
    fi
    echo -n "."
done

echo ""
echo ""

# Step 7: Verify service
echo "7️⃣  Verifying frontend is running..."
sleep 2
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "   ✅ Frontend is responding on http://localhost:3001"
else
    echo "   ⚠️  Frontend not responding yet (may still be compiling)"
fi

echo ""
echo "════════════════════════════════════════════════════"
echo "  ✅ FRONTEND RESTART COMPLETE"
echo "════════════════════════════════════════════════════"
echo ""
echo "📋 IMPORTANT - WHAT TO DO NOW:"
echo ""
echo "   1. Open your browser"
echo "   2. Open DevTools (Press F12)"
echo "   3. Go to Console tab"
echo "   4. Look for these debug messages:"
echo "      🔍 Resolving API URL..."
echo "      NEXT_PUBLIC_API_URL env: http://aib.nexairalab.net"
echo "      ✅ Using NEXT_PUBLIC_API_URL: http://aib.nexairalab.net"
echo ""
echo "   5. If you see 'NEXT_PUBLIC_API_URL env: undefined', then:"
echo "      - Next.js is NOT loading the .env.local file"
echo "      - Try adding the variable to .env instead"
echo ""
echo "   6. Clear browser cache:"
echo "      - Press Ctrl+Shift+Delete"
echo "      - Select 'Cached images and files'"
echo "      - Click 'Clear data'"
echo ""
echo "   7. Go to: http://ai.nexairalab.net/login"
echo ""
echo "════════════════════════════════════════════════════"
echo ""
echo "📊 Monitor logs:"
echo "   tail -f /tmp/airouter-frontend-debug.log"
echo ""
echo "🔍 Check what API URL is being used:"
echo "   grep -i 'api.*url' /tmp/airouter-frontend-debug.log"
echo ""

