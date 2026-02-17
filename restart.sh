#!/bin/bash

# AIRouter Restart Script
# Stops and then starts all services

set -e

# Colors
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║                 🔄 Restarting AIRouter                        ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Stop services
if [ -f "$SCRIPT_DIR/stop.sh" ]; then
    bash "$SCRIPT_DIR/stop.sh"
else
    echo "stop.sh not found!"
    exit 1
fi

echo ""
echo "Waiting 3 seconds before restart..."
sleep 3
echo ""

# Start services
if [ -f "$SCRIPT_DIR/start.sh" ]; then
    bash "$SCRIPT_DIR/start.sh"
else
    echo "start.sh not found!"
    exit 1
fi

