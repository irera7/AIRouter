#!/bin/bash

# AIRouter Startup Script
# Starts both backend and frontend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ports
BACKEND_PORT=3000
FRONTEND_PORT=3001

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                    🚀 AIRouter Startup                        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}⚠️  Killing existing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 1
    fi
}

# Function to check if port is free
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    else
        return 0
    fi
}

# Kill tsx processes
echo -e "${YELLOW}🧹 Cleaning up old processes...${NC}"
pkill -f "tsx" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Kill processes on specific ports
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# Verify ports are free
echo -e "${BLUE}🔍 Verifying ports are available...${NC}"
for port in $BACKEND_PORT $FRONTEND_PORT; do
    if check_port $port; then
        echo -e "${GREEN}✓ Port $port is available${NC}"
    else
        echo -e "${RED}✗ Port $port is still busy, trying force kill...${NC}"
        kill_port $port
        sleep 1
        if check_port $port; then
            echo -e "${GREEN}✓ Port $port is now available${NC}"
        else
            echo -e "${RED}✗ Failed to free port $port. Please check manually.${NC}"
            exit 1
        fi
    fi
done

# Check if Docker services are running
echo -e "${BLUE}🐳 Checking Docker services...${NC}"
if ! docker ps | grep -q "airouter-postgres"; then
    echo -e "${YELLOW}⚠️  PostgreSQL not running, starting...${NC}"
    docker start airouter-postgres 2>/dev/null || docker compose up -d postgres
    sleep 3
fi

if ! docker ps | grep -q "airouter-redis"; then
    echo -e "${YELLOW}⚠️  Redis not running, starting...${NC}"
    docker start airouter-redis 2>/dev/null || docker compose up -d redis
    sleep 2
fi

# Wait for database to be ready
echo -e "${BLUE}⏳ Waiting for database to be ready...${NC}"
max_attempts=30
attempt=0
while ! docker exec airouter-postgres pg_isready -U airouter >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo -e "${RED}✗ Database failed to start${NC}"
        exit 1
    fi
    echo -e "${YELLOW}   Waiting for PostgreSQL... ($attempt/$max_attempts)${NC}"
    sleep 1
done
echo -e "${GREEN}✓ PostgreSQL is ready${NC}"

# Wait for Redis to be ready
echo -e "${BLUE}⏳ Waiting for Redis to be ready...${NC}"
max_attempts=10
attempt=0
while ! docker exec airouter-redis redis-cli ping >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo -e "${RED}✗ Redis failed to start${NC}"
        exit 1
    fi
    echo -e "${YELLOW}   Waiting for Redis... ($attempt/$max_attempts)${NC}"
    sleep 1
done
echo -e "${GREEN}✓ Redis is ready${NC}"

# Start Backend
echo -e "${BLUE}🚀 Starting Backend (port $BACKEND_PORT)...${NC}"
cd "$(dirname "$0")"
npm run dev > /tmp/airouter-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo -e "${BLUE}⏳ Waiting for backend to be ready...${NC}"
max_attempts=30
attempt=0
while ! curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo -e "${RED}✗ Backend failed to start. Check logs: tail -f /tmp/airouter-backend.log${NC}"
        exit 1
    fi
    echo -e "${YELLOW}   Waiting for backend... ($attempt/$max_attempts)${NC}"
    sleep 1
done
echo -e "${GREEN}✓ Backend is ready${NC}"

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend (port $FRONTEND_PORT)...${NC}"
cd frontend
npm run dev > /tmp/airouter-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to be ready
echo -e "${BLUE}⏳ Waiting for frontend to be ready...${NC}"
max_attempts=30
attempt=0
while ! curl -s http://localhost:$FRONTEND_PORT >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ $attempt -ge $max_attempts ]; then
        echo -e "${RED}✗ Frontend failed to start. Check logs: tail -f /tmp/airouter-frontend.log${NC}"
        exit 1
    fi
    echo -e "${YELLOW}   Waiting for frontend... ($attempt/$max_attempts)${NC}"
    sleep 1
done
echo -e "${GREEN}✓ Frontend is ready${NC}"

# Display status
echo ""
echo -e "${GREEN}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║              ✅ AIRouter is now running! ✅                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${BLUE}📊 Services Status:${NC}"
echo -e "${GREEN}✓ PostgreSQL${NC}  - Running (Docker)"
echo -e "${GREEN}✓ Redis${NC}       - Running (Docker)"
echo -e "${GREEN}✓ Backend${NC}     - http://localhost:$BACKEND_PORT (PID: $BACKEND_PID)"
echo -e "${GREEN}✓ Frontend${NC}    - http://localhost:$FRONTEND_PORT (PID: $FRONTEND_PID)"
echo ""

echo -e "${BLUE}🔗 Access URLs:${NC}"
echo -e "   Frontend:  ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "   Backend:   ${GREEN}http://localhost:$BACKEND_PORT${NC}"
echo -e "   API Docs:  ${GREEN}http://localhost:$BACKEND_PORT/health${NC}"
echo ""

echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   Backend:   tail -f /tmp/airouter-backend.log"
echo -e "   Frontend:  tail -f /tmp/airouter-frontend.log"
echo ""

echo -e "${BLUE}🔑 Login Credentials:${NC}"
echo -e "   Email:     ${YELLOW}demo@airouter.dev${NC}"
echo -e "   Password:  ${YELLOW}demo123${NC}"
echo ""

echo -e "${YELLOW}💡 Press Ctrl+C to stop all services${NC}"
echo ""

# Save PIDs to file for stop script
echo "$BACKEND_PID" > /tmp/airouter-backend.pid
echo "$FRONTEND_PID" > /tmp/airouter-frontend.pid

# Wait for Ctrl+C
trap "echo ''; echo -e '${YELLOW}🛑 Shutting down...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM

# Keep script running
wait

