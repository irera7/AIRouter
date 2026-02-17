#!/bin/bash

# AIRouter Prerequisites Checker
# This script checks if all required prerequisites are installed

echo "🔍 Checking AIRouter Prerequisites..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_OK=true

# Function to check command
check_command() {
    local cmd=$1
    local name=$2
    local required_version=$3
    local current_version=$4
    
    if command -v $cmd &> /dev/null; then
        echo -e "${GREEN}✓${NC} $name is installed"
        if [ ! -z "$current_version" ]; then
            echo "  Version: $current_version"
            if [ ! -z "$required_version" ]; then
                echo "  Required: $required_version"
            fi
        fi
        return 0
    else
        echo -e "${RED}✗${NC} $name is NOT installed"
        if [ ! -z "$required_version" ]; then
            echo "  Required: $required_version"
        fi
        ALL_OK=false
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "System Tools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_command "git" "Git" "any" "$(git --version 2>/dev/null)"
check_command "curl" "cURL" "any" "$(curl --version 2>/dev/null | head -n1)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Node.js Environment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

NODE_VERSION=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    check_command "node" "Node.js" "v20.x or higher" "$NODE_VERSION"
    
    if [ "$NODE_MAJOR" -lt 20 ]; then
        echo -e "  ${YELLOW}⚠${NC} Warning: Node.js version is less than 20"
        echo "  Please upgrade to Node.js 20 or higher"
        echo "  Installation guide: https://nodejs.org/ or use nvm"
        ALL_OK=false
    fi
else
    check_command "node" "Node.js" "v20.x or higher" ""
fi

check_command "npm" "npm" "any" "$(npm --version 2>/dev/null)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_command "docker" "Docker" "20.x or higher" "$(docker --version 2>/dev/null)"

if command -v docker &> /dev/null; then
    # Check if docker daemon is running
    if docker ps &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker daemon is running"
    else
        echo -e "${YELLOW}⚠${NC} Docker is installed but daemon is not running"
        echo "  Start with: sudo systemctl start docker"
        ALL_OK=false
    fi
    
    # Check if user is in docker group
    if groups | grep -q docker; then
        echo -e "${GREEN}✓${NC} User is in docker group"
    else
        echo -e "${YELLOW}⚠${NC} User is not in docker group"
        echo "  Add with: sudo usermod -aG docker \$USER"
        echo "  Then logout and login again"
    fi
fi

# Check for docker compose
if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose is installed (Plugin)"
    echo "  Version: $(docker compose version)"
elif command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✓${NC} Docker Compose is installed (Standalone)"
    echo "  Version: $(docker-compose --version)"
else
    echo -e "${RED}✗${NC} Docker Compose is NOT installed"
    ALL_OK=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Project Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check important files
FILES=(
    "package.json"
    "docker-compose.yml"
    ".env"
    "backend/src/index.ts"
    "backend/src/app.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
    else
        echo -e "${RED}✗${NC} $file is missing"
        ALL_OK=false
    fi
done

# Check node_modules
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
    MODULE_COUNT=$(ls -1 node_modules | wc -l)
    echo "  Installed packages: ~$MODULE_COUNT"
else
    echo -e "${YELLOW}⚠${NC} node_modules not found"
    echo "  Run: npm install"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Environment Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check important env vars
    ENV_VARS=("DATABASE_URL" "REDIS_URL" "JWT_SECRET" "PORT")
    
    for var in "${ENV_VARS[@]}"; do
        if grep -q "^$var=" .env; then
            echo -e "${GREEN}✓${NC} $var is set"
        else
            echo -e "${YELLOW}⚠${NC} $var is not set in .env"
        fi
    done
else
    echo -e "${RED}✗${NC} .env file is missing"
    echo "  Create from: cp .env.example .env"
    ALL_OK=false
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Docker Services Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v docker &> /dev/null && docker ps &> /dev/null; then
    POSTGRES_RUNNING=$(docker ps --filter "name=airouter-postgres" --filter "status=running" -q)
    REDIS_RUNNING=$(docker ps --filter "name=airouter-redis" --filter "status=running" -q)
    
    if [ ! -z "$POSTGRES_RUNNING" ]; then
        echo -e "${GREEN}✓${NC} PostgreSQL container is running"
    else
        echo -e "${YELLOW}⚠${NC} PostgreSQL container is not running"
        echo "  Start with: docker compose up -d postgres"
    fi
    
    if [ ! -z "$REDIS_RUNNING" ]; then
        echo -e "${GREEN}✓${NC} Redis container is running"
    else
        echo -e "${YELLOW}⚠${NC} Redis container is not running"
        echo "  Start with: docker compose up -d redis"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✓ All prerequisites are installed!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. docker compose up -d postgres redis"
    echo "  2. npm run db:migrate"
    echo "  3. npm run db:seed"
    echo "  4. npm run dev"
    exit 0
else
    echo -e "${RED}✗ Some prerequisites are missing${NC}"
    echo ""
    echo "Please install the missing components:"
    echo "  - See SETUP_PREREQUISITES.md for detailed instructions"
    echo "  - Or run: ./scripts/install-prerequisites.sh (requires sudo)"
    exit 1
fi

