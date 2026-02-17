#!/bin/bash

echo "🔧 Fixing Frontend API URL Issue..."
echo ""

# Step 1: Stop frontend
echo "1️⃣ Stopping frontend..."
pkill -f "next dev"
sleep 2

# Step 2: Clear cache
echo "2️⃣ Clearing Next.js cache..."
cd /home/reza/AIRouter/frontend
rm -rf .next
rm -rf node_modules/.cache
echo "   ✅ Cache cleared"

# Step 3: Verify environment variable
echo ""
echo "3️⃣ Checking environment variable..."
if grep -q "NEXT_PUBLIC_API_URL=http://aib.nexairalab.net" .env.local; then
    echo "   ✅ NEXT_PUBLIC_API_URL is correctly set to: http://aib.nexairalab.net"
else
    echo "   ⚠️  WARNING: Environment variable might not be correct!"
    echo "   Current value:"
    grep "NEXT_PUBLIC_API_URL" .env.local || echo "   NOT FOUND!"
fi

# Step 4: Start frontend
echo ""
echo "4️⃣ Starting frontend with fresh build..."
cd /home/reza/AIRouter/frontend
npm run dev > /tmp/airouter-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend starting (PID: $FRONTEND_PID)..."

# Step 5: Wait and check
echo ""
echo "5️⃣ Waiting for frontend to compile..."
for i in {1..15}; do
    echo -n "."
    sleep 1
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo ""
        echo "   ✅ Frontend is ready!"
        break
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Frontend restarted successfully!"
echo ""
echo "📋 Next Steps:"
echo "   1. Clear your browser cache (IMPORTANT!)"
echo "   2. Close ALL tabs with ai.nexairalab.net"
echo "   3. Open a NEW tab"
echo "   4. Go to: http://ai.nexairalab.net/login"
echo "   5. Check DevTools Network tab - API calls should go to:"
echo "      http://aib.nexairalab.net/api/v1/auth/login"
echo ""
echo "📊 Check logs:"
echo "   tail -f /tmp/airouter-frontend.log"
echo ""
echo "🔍 Verify frontend is running:"
echo "   curl -I http://localhost:3001"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

