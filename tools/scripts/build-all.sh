#!/bin/bash

# Build all packages in the correct order

set -e

echo "🔨 Building MCP Sub-Registry monorepo..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build shared package first
echo "🔧 Building shared package..."
cd packages/shared && npm run build && cd ../..

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Build API package
echo "🔧 Building API package..."
cd packages/api && npm run build && cd ../..

# Build UI package
echo "🔧 Building UI package..."
cd packages/ui && npm run build && cd ../..

echo "✅ All packages built successfully!"
echo ""
echo "📁 Built assets:"
echo "   - API: packages/api/dist/"
echo "   - UI:  packages/ui/dist/" 
echo "   - Shared: packages/shared/dist/"
echo ""
echo "🚀 Ready for deployment with Docker or direct deployment"