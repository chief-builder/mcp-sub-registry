#!/bin/bash

# Development setup script for MCP Sub-Registry monorepo

set -e

echo "🚀 Setting up MCP Sub-Registry development environment..."

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "   Node.js: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ v1[89]\. && ! "$NODE_VERSION" =~ v2[0-9]\. ]]; then
  echo "❌ Node.js 18+ is required. Current version: $NODE_VERSION"
  exit 1
fi

# Check npm version
NPM_VERSION=$(npm --version)
echo "   npm: $NPM_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Generate TypeScript API client
echo "🔧 Generating TypeScript API client..."
if [ -f "packages/api/openapi.json" ]; then
  npm run generate:client
else
  echo "⚠️  OpenAPI spec not found. Run the API server first, then generate client."
fi

# Create .env files if they don't exist
echo "⚙️  Setting up environment files..."

if [ ! -f "packages/api/.env" ]; then
  echo "   Creating packages/api/.env..."
  cat > packages/api/.env << EOF
# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5435/mcp_registry_v2"

# Authentication
JWT_SECRET="development-jwt-secret-change-in-production"
ADMIN_SETUP_KEY="development-admin-key-change-in-production"

# Server
PORT=3010
NODE_ENV=development

# Optional CORS
# CORS_ORIGINS="http://localhost:5173"
EOF
fi

if [ ! -f "packages/ui/.env" ]; then
  echo "   Creating packages/ui/.env..."
  cat > packages/ui/.env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:3010

# Environment
NODE_ENV=development
EOF
fi

# Check if Docker is available
if command -v docker &> /dev/null; then
  echo "🐳 Docker is available for database setup"
  echo "   Run 'npm run docker:up' to start the database"
else
  echo "⚠️  Docker not found. You'll need to set up PostgreSQL manually."
fi

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Start the database: npm run docker:up"
echo "   2. Run database migrations: npm run db:migrate"
echo "   3. Start development servers: npm run dev"
echo "   4. Visit:"
echo "      - API: http://localhost:3010"
echo "      - UI:  http://localhost:5173"
echo ""
echo "🔧 Useful commands:"
echo "   npm run dev          - Start both API and UI"
echo "   npm run dev:api      - Start API only"
echo "   npm run dev:ui       - Start UI only"
echo "   npm run test         - Run all tests"
echo "   npm run lint         - Run linting"
echo "   npm run build        - Build for production"
echo "   npm run docker:up    - Start database"
echo "   npm run docker:down  - Stop database"
echo "   npm run db:studio    - Open Prisma Studio"
echo ""