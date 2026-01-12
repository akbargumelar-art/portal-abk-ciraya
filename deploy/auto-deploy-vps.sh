#!/bin/bash

# ===========================================
# Deploy Portal ABK Ciraya ke VPS
# ===========================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Portal ABK Ciraya Deployment${NC}"
echo "=============================================="

# Step 1: Clone repository
echo -e "${YELLOW}📥 Cloning repository from GitHub...${NC}"
cd ~
if [ -d "portal-abk-ciraya" ]; then
    echo -e "${YELLOW}⚠️  Directory 'portal-abk-ciraya' already exists. Removing...${NC}"
    rm -rf portal-abk-ciraya
fi

git clone git@github.com:akbargumelar-art/portal-abk-ciraya.git
cd portal-abk-ciraya

echo -e "${GREEN}✅ Repository cloned successfully${NC}"

# Step 2: Backend Setup
echo ""
echo -e "${YELLOW}📦 Setting up backend...${NC}"
cd backend

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << 'EOF'
DATABASE_URL="mysql://portal_user:PasswordKuat123!@localhost:3306/portal_abk_ciraya"

PORT=3000
NODE_ENV=production

JWT_SECRET=super-secret-jwt-key-production-portal-abk-ciraya-2026-change-this
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://31.97.106.147
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Generate Prisma Client
echo -e "${YELLOW}⚙️  Generating Prisma Client...${NC}"
npx prisma generate

# Run migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy

# Seed database
echo -e "${YELLOW}🌱 Seeding database...${NC}"
npm run seed

# Build TypeScript
echo -e "${YELLOW}🔨 Building TypeScript...${NC}"
npm run build

# Create logs directory
mkdir -p logs

# Step 3: PM2 Setup
echo ""
echo -e "${YELLOW}🔧 Setting up PM2...${NC}"

# Stop existing process if any
pm2 stop portal-abk-backend 2>/dev/null || true
pm2 delete portal-abk-backend 2>/dev/null || true

# Start with PM2
echo -e "${YELLOW}▶️  Starting backend with PM2...${NC}"
pm2 start ecosystem.config.cjs

# Save PM2 configuration
pm2 save

echo ""
echo -e "${GREEN}✅ Backend deployment completed!${NC}"
echo ""
echo -e "${YELLOW}Backend is running on:${NC}"
echo "  - Local:  http://localhost:3000"
echo "  - Public: http://31.97.106.147:3000 (if firewall allows)"
echo ""

# Step 4: Frontend Build
echo -e "${YELLOW}🎨 Building frontend...${NC}"
cd ../frontend

# Install dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

# Build production
echo -e "${YELLOW}Building production bundle...${NC}"
npm run build

echo -e "${GREEN}✅ Frontend built successfully${NC}"
echo ""

# Step 5: Nginx Setup Check
echo -e "${YELLOW}📋 Nginx Configuration Check${NC}"

if [ -f /etc/nginx/sites-available/portal-abk-ciraya ]; then
    echo -e "${GREEN}✅ Nginx config already exists${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx config not found. Creating...${NC}"
    
    sudo tee /etc/nginx/sites-available/portal-abk-ciraya > /dev/null << 'EOF'
server {
    listen 80;
    server_name 31.97.106.147;

    # Frontend
    location / {
        root /root/portal-abk-ciraya/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
EOF
    
    # Enable site
    sudo ln -s /etc/nginx/sites-available/portal-abk-ciraya /etc/nginx/sites-enabled/ 2>/dev/null || true
    
    # Test and reload nginx
    sudo nginx -t && sudo systemctl reload nginx
    
    echo -e "${GREEN}✅ Nginx configured and reloaded${NC}"
fi

# Final Status
echo ""
echo "=============================================="
echo -e "${GREEN}🎉 Deployment Completed Successfully!${NC}"
echo "=============================================="
echo ""
echo -e "${YELLOW}Access your application:${NC}"
echo "  🌐 Frontend: http://31.97.106.147"
echo "  🔌 API:      http://31.97.106.147/api"
echo "  ❤️  Health:   http://31.97.106.147/health"
echo ""
echo -e "${YELLOW}Default Login:${NC}"
echo "  📧 Email:    admin@portal.com"
echo "  🔑 Password: admin123"
echo ""
echo -e "${YELLOW}Useful PM2 Commands:${NC}"
echo "  pm2 status                    - Check status"
echo "  pm2 logs portal-abk-backend   - View logs"
echo "  pm2 restart portal-abk-backend - Restart"
echo "  pm2 monit                     - Monitor"
echo ""
echo -e "${GREEN}Done! 🚀${NC}"
