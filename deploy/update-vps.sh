#!/bin/bash

# ===========================================
# Update Script - Pull Latest Code & Redeploy
# ===========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🔄 Updating Portal ABK Ciraya${NC}"
echo "=============================================="

cd ~/portal-abk-ciraya

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

# Update backend
echo -e "${YELLOW}📦 Updating backend...${NC}"
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# Restart PM2
echo -e "${YELLOW}♻️  Restarting backend...${NC}"
pm2 restart portal-abk-backend

# Update frontend
echo -e "${YELLOW}🎨 Updating frontend...${NC}"
cd ../frontend
npm install
npm run build

echo ""
echo -e "${GREEN}✅ Update completed!${NC}"
pm2 status
