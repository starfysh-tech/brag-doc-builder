#!/bin/bash

# Brag Doc Builder - Setup Script
# This script sets up the development environment and builds the production version

set -e  # Exit on error

echo "================================================"
echo "  Brag Doc Builder - Setup Script"
echo "  Powered by Starfysh"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}Warning: Node.js version is $NODE_VERSION. Version 18 or higher is recommended.${NC}"
fi

echo -e "${GREEN}✓ Node.js found: $(node -v)${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm found: $(npm -v)${NC}"
echo ""

# Install dependencies
echo "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

echo ""

# Build for production
echo "Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Production build completed successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo ""
echo "================================================"
echo -e "${GREEN}  Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Development mode (with hot reload):"
echo "   npm run dev"
echo "   Then visit: http://localhost:3000"
echo ""
echo "2. Preview production build:"
echo "   npm run preview"
echo ""
echo "3. Deploy to server:"
echo "   - Upload the 'dist' folder to your web server"
echo "   - Point your web server to serve files from 'dist'"
echo "   - See DEPLOYMENT.md for detailed deployment instructions"
echo ""
