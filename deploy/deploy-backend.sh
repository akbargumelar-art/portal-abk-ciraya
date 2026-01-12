#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Portal ABK Ciraya Backend to VPS${NC}"
echo "=============================================="

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo -e "${RED}❌ Error: backend/.env file not found${NC}"
    echo -e "${YELLOW}Please create backend/.env from backend/.env.example${NC}"
    exit 1
fi

# Navigate to backend
cd backend

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Build TypeScript
echo -e "${YELLOW}🔨 Building TypeScript...${NC}"
npm run build

# Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npm run migrate:deploy

# Generate Prisma Client
echo -e "${YELLOW}⚙️  Generating Prisma Client...${NC}"
npm run prisma:generate

# Create logs directory
mkdir -p logs

# Stop existing PM2 process
echo -e "${YELLOW}🛑 Stopping existing PM2 process...${NC}"
pm2 stop portal-abk-backend 2>/dev/null || true
pm2 delete portal-abk-backend 2>/dev/null || true

# Start PM2
echo -e "${YELLOW}▶️  Starting backend with PM2...${NC}"
pm2 start ecosystem.config.cjs

# Save PM2 config
pm2 save

echo ""
echo -e "${GREEN}✅ Backend deployment completed!${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  pm2 status              - Check process status"
echo "  pm2 logs portal-abk-backend - View logs"
echo "  pm2 restart portal-abk-backend - Restart server"
echo "  pm2 monit               - Monitor resources"
