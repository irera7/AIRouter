#!/bin/bash

# AIRouter Prerequisites Installer
# This script installs all required prerequisites for AIRouter
# Requires: Ubuntu/Debian-based system with sudo access

set -e

echo "🚀 AIRouter Prerequisites Installer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running with sudo
if [ "$EUID" -eq 0 ]; then 
    echo -e "${YELLOW}⚠ Warning: Running as root${NC}"
    echo "This script will install system packages."
    echo ""
fi

echo -e "${BLUE}This script will install:${NC}"
echo "  • Node.js 20.x (via NodeSource)"
echo "  • Docker Engine"
echo "  • Docker Compose Plugin"
echo "  • Git (if not installed)"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Installation cancelled."
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Updating package list"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sudo apt update

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Installing basic tools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

sudo apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git

echo -e "${GREEN}✓${NC} Basic tools installed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Installing Node.js 20.x"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Remove old nodejs if exists
if command -v node &> /dev/null; then
    NODE_MAJOR=$(node --version | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 20 ]; then
        echo "Removing old Node.js version..."
        sudo apt remove -y nodejs npm || true
    fi
fi

# Install NodeSource repository
echo "Adding NodeSource repository..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
echo "Installing Node.js..."
sudo apt install -y nodejs

# Verify installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 4: Installing Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Docker is already installed
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} Docker is already installed"
    docker --version
    read -p "Reinstall Docker? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Skipping Docker installation"
    else
        # Add Docker's official GPG key
        sudo mkdir -p /etc/apt/keyrings
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

        # Set up the repository
        echo \
          "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

        # Install Docker Engine
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        echo -e "${GREEN}✓${NC} Docker installed"
    fi
else
    # Add Docker's official GPG key
    echo "Adding Docker GPG key..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

    # Set up the repository
    echo "Setting up Docker repository..."
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Install Docker Engine
    echo "Installing Docker Engine..."
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    echo -e "${GREEN}✓${NC} Docker installed: $(docker --version)"
fi

# Enable and start Docker
echo "Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
if ! groups $USER | grep -q docker; then
    echo "Adding $USER to docker group..."
    sudo usermod -aG docker $USER
    echo -e "${YELLOW}⚠${NC} You need to logout and login again for docker group changes to take effect"
    echo "Or run: newgrp docker"
fi

echo -e "${GREEN}✓${NC} Docker setup complete"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 5: Verifying installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Installed versions:"
echo "  Git: $(git --version)"
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"
echo "  Docker: $(docker --version)"
if docker compose version &> /dev/null; then
    echo "  Docker Compose: $(docker compose version)"
elif command -v docker-compose &> /dev/null; then
    echo "  Docker Compose: $(docker-compose --version)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Next steps:"
echo "  1. Logout and login (for docker group changes)"
echo "     Or run: newgrp docker"
echo ""
echo "  2. Navigate to project directory:"
echo "     cd /home/reza/AIRouter"
echo ""
echo "  3. Install Node.js dependencies:"
echo "     npm install"
echo ""
echo "  4. Setup environment:"
echo "     cp .env.example .env"
echo ""
echo "  5. Start Docker services:"
echo "     docker compose up -d postgres redis"
echo ""
echo "  6. Run database migrations:"
echo "     npm run db:migrate"
echo ""
echo "  7. Seed database:"
echo "     npm run db:seed"
echo ""
echo "  8. Start development server:"
echo "     npm run dev"
echo ""
echo "For more information, see:"
echo "  • README.md"
echo "  • GET_STARTED.md"
echo "  • SETUP_PREREQUISITES.md"
echo ""

