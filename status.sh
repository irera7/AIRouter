#!/bin/bash

# AIRouter Status Script
# Shows status of all services

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
║                  📊 AIRouter Status                           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"
echo ""

# Check PostgreSQL
echo -e "${BLUE}🐘 PostgreSQL:${NC}"
if docker ps | grep -q "airouter-postgres"; then
    if docker exec airouter-postgres pg_isready -U airouter >/dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Running and ready${NC}"
    else
        echo -e "   ${YELLOW}⚠ Running but not ready${NC}"
    fi
else
    echo -e "   ${RED}✗ Not running${NC}"
fi

# Check Redis
echo -e "${BLUE}📦 Redis:${NC}"
if docker ps | grep -q "airouter-redis"; then
    if docker exec airouter-redis redis-cli ping >/dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Running and ready${NC}"
    else
        echo -e "   ${YELLOW}⚠ Running but not ready${NC}"
    fi
else
    echo -e "   ${RED}✗ Not running${NC}"
fi

# Check Backend
echo -e "${BLUE}🔧 Backend (port 3000):${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    BACKEND_PID=$(lsof -ti:3000)
    if curl -s http://localhost:3000/health >/dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Running and healthy${NC} (PID: $BACKEND_PID)"
        echo -e "   ${BLUE}→ http://localhost:3000${NC}"
    else
        echo -e "   ${YELLOW}⚠ Running but not responding${NC} (PID: $BACKEND_PID)"
    fi
else
    echo -e "   ${RED}✗ Not running${NC}"
fi

# Check Frontend
echo -e "${BLUE}🎨 Frontend (port 3001):${NC}"
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    FRONTEND_PID=$(lsof -ti:3001)
    if curl -s http://localhost:3001 >/dev/null 2>&1; then
        echo -e "   ${GREEN}✓ Running and ready${NC} (PID: $FRONTEND_PID)"
        echo -e "   ${BLUE}→ http://localhost:3001${NC}"
    else
        echo -e "   ${YELLOW}⚠ Running but not responding${NC} (PID: $FRONTEND_PID)"
    fi
else
    echo -e "   ${RED}✗ Not running${NC}"
fi

echo ""

# Check if log files exist
echo -e "${BLUE}📝 Log Files:${NC}"
if [ -f /tmp/airouter-backend.log ]; then
    BACKEND_LINES=$(wc -l < /tmp/airouter-backend.log)
    echo -e "   Backend:  ${GREEN}✓${NC} ($BACKEND_LINES lines) - tail -f /tmp/airouter-backend.log"
else
    echo -e "   Backend:  ${YELLOW}No log file${NC}"
fi

if [ -f /tmp/airouter-frontend.log ]; then
    FRONTEND_LINES=$(wc -l < /tmp/airouter-frontend.log)
    echo -e "   Frontend: ${GREEN}✓${NC} ($FRONTEND_LINES lines) - tail -f /tmp/airouter-frontend.log"
else
    echo -e "   Frontend: ${YELLOW}No log file${NC}"
fi

echo ""

# Overall status
BACKEND_OK=$(curl -s http://localhost:3000/health >/dev/null 2>&1 && echo "1" || echo "0")
FRONTEND_OK=$(curl -s http://localhost:3001 >/dev/null 2>&1 && echo "1" || echo "0")
POSTGRES_OK=$(docker ps | grep -q "airouter-postgres" && echo "1" || echo "0")
REDIS_OK=$(docker ps | grep -q "airouter-redis" && echo "1" || echo "0")

if [ "$BACKEND_OK" = "1" ] && [ "$FRONTEND_OK" = "1" ] && [ "$POSTGRES_OK" = "1" ] && [ "$REDIS_OK" = "1" ]; then
    echo -e "${GREEN}✅ All services are running!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services are not running. Use './start.sh' to start them.${NC}"
fi

echo ""

