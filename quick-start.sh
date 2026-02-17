#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        🚀 Starting AIRouter Services...                        ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Stop any existing processes
echo "1️⃣ Stopping existing processes..."
pkill -f "tsx watch backend" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Start Docker services
echo "2️⃣ Starting Docker services (PostgreSQL, Redis)..."
cd /home/reza/AIRouter
docker-compose up -d
sleep 5

# Wait for PostgreSQL
echo "3️⃣ Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "   ✅ PostgreSQL is ready!"
        break
    fi
    echo "   ⏳ Waiting... ($i/30)"
    sleep 1
done

# Start Backend
echo "4️⃣ Starting Backend..."
cd /home/reza/AIRouter/backend
npm run dev > /tmp/airouter-backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend
echo "5️⃣ Waiting for Backend..."
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo "   ✅ Backend is ready!"
        break
    fi
    echo "   ⏳ Waiting... ($i/30)"
    sleep 1
done

# Start Frontend
echo "6️⃣ Starting Frontend..."
cd /home/reza/AIRouter/frontend
npm run dev > /tmp/airouter-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend
echo "7️⃣ Waiting for Frontend..."
for i in {1..30}; do
    if curl -s http://localhost:3001 > /dev/null 2>&1; then
        echo "   ✅ Frontend is ready!"
        break
    fi
    echo "   ⏳ Waiting... ($i/30)"
    sleep 1
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║        ✅ All Services Started!                                ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Services:"
echo "   ✅ Backend:  http://localhost:3000"
echo "   ✅ Frontend: http://localhost:3001"
echo "   ✅ Swagger:  http://localhost:3000/docs"
echo "   ✅ Health:   http://localhost:3000/health"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f /tmp/airouter-backend.log"
echo "   Frontend: tail -f /tmp/airouter-frontend.log"
echo ""
echo "🚀 Open: http://localhost:3001/register"
echo ""

