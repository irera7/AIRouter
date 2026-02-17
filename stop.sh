#!/bin/bash

# AIRouter Stop Script
# Stops all AIRouter services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                  🛑 Stopping AIRouter                         ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Kill by PIDs from file
if [ -f /tmp/airouter-backend.pid ]; then
    BACKEND_PID=$(cat /tmp/airouter-backend.pid)
    echo -e "${YELLOW}🛑 Stopping Backend (PID: $BACKEND_PID)...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    rm /tmp/airouter-backend.pid
fi

if [ -f /tmp/airouter-frontend.pid ]; then
    FRONTEND_PID=$(cat /tmp/airouter-frontend.pid)
    echo -e "${YELLOW}🛑 Stopping Frontend (PID: $FRONTEND_PID)...${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    rm /tmp/airouter-frontend.pid
fi

# Kill any remaining tsx and next processes
echo -e "${YELLOW}🧹 Cleaning up remaining processes...${NC}"
pkill -f "tsx" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Kill processes on ports
echo -e "${YELLOW}🧹 Freeing up ports...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

echo ""
echo -e "${GREEN}✅ All services stopped successfully!${NC}"
echo ""

# Optional: Stop Docker containers
read -p "$(echo -e ${YELLOW}Do you want to stop Docker containers too? [y/N]: ${NC})" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}🐳 Stopping Docker containers...${NC}"
    docker stop airouter-postgres airouter-redis 2>/dev/null || true
    echo -e "${GREEN}✅ Docker containers stopped${NC}"
else
    echo -e "${BLUE}ℹ️  Docker containers left running${NC}"
fi

echo ""
echo -e "${GREEN}Done! 👋${NC}"
echo ""

