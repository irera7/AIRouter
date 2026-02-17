#!/bin/bash

# AIRouter Setup Script
# This script sets up the development environment

set -e

echo "🚀 AIRouter Setup Script"
echo "========================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker version: $(docker --version)"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker Compose version: $(docker-compose --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Copy .env.example to .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your configuration."
else
    echo "ℹ️  .env file already exists."
fi
echo ""

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis
echo ""

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U airouter &> /dev/null; do
    sleep 1
done
echo "✅ PostgreSQL is ready!"
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npm run db:migrate
echo ""

# Seed database
echo "🌱 Seeding database..."
npm run db:seed
echo ""

echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Update .env with your configuration"
echo "   2. Run 'npm run dev' to start the development server"
echo "   3. Visit http://localhost:3000/health to check if the server is running"
echo ""
echo "📖 For more information, see README.md"

