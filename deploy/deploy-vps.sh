#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Portal ABK Ciraya — VPS Deployment Script
# Target: /var/www/portal
# ═══════════════════════════════════════════════════════════════
set -e

# ── Konfigurasi ──────────────────────────────────────────────
APP_DIR="/var/www/portal"
REPO_URL="https://github.com/akbargumelar-art/portal-abk-ciraya.git"
BRANCH="main"
NGINX_CONF="/etc/nginx/sites-available/portal-abk"
NGINX_LINK="/etc/nginx/sites-enabled/portal-abk"

# ── Warna output ─────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()   { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Portal ABK Ciraya — VPS Deployment"
echo "  Target: $APP_DIR"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── Step 1: Cek port yang sedang dipakai ─────────────────────
info "Step 1: Scan port yang sedang dipakai..."
echo ""
echo "┌──────────────────────────────────────────────────────┐"
echo "│  PORT  │  SERVICE         │  STATUS                  │"
echo "├──────────────────────────────────────────────────────┤"

# Cek port-port umum
for port in 80 443 3000 3001 4000 5000 5173 8000 8080 8443 9000; do
    service=$(ss -tlnp 2>/dev/null | grep ":${port} " | awk '{print $NF}' | head -1)
    if [ -n "$service" ]; then
        printf "│  %-5s │  %-16s │  ${RED}TERPAKAI${NC}                 │\n" "$port" "$service"
    else
        printf "│  %-5s │  %-16s │  ${GREEN}KOSONG${NC}                   │\n" "$port" "-"
    fi
done

echo "└──────────────────────────────────────────────────────┘"
echo ""

# Tampilkan semua port yang listening
info "Semua port yang aktif listening:"
ss -tlnp 2>/dev/null | grep LISTEN | awk '{print "  → " $4 " (" $NF ")"}' | sort -t: -k2 -n | head -20
echo ""

# ── Step 2: Cek Nginx ────────────────────────────────────────
info "Step 2: Cek Nginx..."
if command -v nginx &>/dev/null; then
    ok "Nginx terinstall: $(nginx -v 2>&1)"
else
    warn "Nginx belum terinstall. Menginstall..."
    sudo apt update && sudo apt install -y nginx
    ok "Nginx terinstall."
fi

# Cek site Nginx yang sudah ada
info "Nginx sites yang aktif:"
ls -1 /etc/nginx/sites-enabled/ 2>/dev/null | while read site; do
    port=$(grep -oP 'listen\s+\K\d+' "/etc/nginx/sites-enabled/$site" 2>/dev/null | head -1)
    domain=$(grep -oP 'server_name\s+\K[^;]+' "/etc/nginx/sites-enabled/$site" 2>/dev/null | head -1)
    echo "  → $site (port: ${port:-?}, domain: ${domain:-?})"
done
echo ""

# ── Step 3: Cek Node.js ──────────────────────────────────────
info "Step 3: Cek Node.js..."
if command -v node &>/dev/null; then
    NODE_VER=$(node -v)
    ok "Node.js $NODE_VER terinstall."

    # Cek minimum version (butuh Node 18+)
    NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR" -lt 18 ]; then
        warn "Node.js versi $NODE_VER terlalu lama. Butuh minimal v18."
        warn "Install Node.js 20 LTS:"
        echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
        echo "  sudo apt install -y nodejs"
        exit 1
    fi
else
    err "Node.js belum terinstall!"
    echo "  Install dulu:"
    echo "  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "  sudo apt install -y nodejs"
    exit 1
fi

# ── Step 4: Clone atau Pull ──────────────────────────────────
info "Step 4: Setup repository di $APP_DIR..."
if [ -d "$APP_DIR/.git" ]; then
    ok "Repo sudah ada. Pull update..."
    cd "$APP_DIR"
    git fetch origin
    git reset --hard "origin/$BRANCH"
    ok "Pull selesai."
else
    if [ -d "$APP_DIR" ]; then
        warn "Folder $APP_DIR sudah ada tapi bukan git repo. Backup..."
        sudo mv "$APP_DIR" "${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
    fi
    info "Clone repository..."
    sudo mkdir -p "$(dirname $APP_DIR)"
    sudo git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
    git checkout "$BRANCH"
    ok "Clone selesai."
fi

# Set ownership
sudo chown -R "$USER:$USER" "$APP_DIR"

# ── Step 5: Install dependencies & Build ─────────────────────
info "Step 5: Install dependencies..."
cd "$APP_DIR"
npm ci --production=false 2>/dev/null || npm install
ok "Dependencies terinstall."

info "Step 6: Build production..."
npm run build
ok "Build selesai. Output di $APP_DIR/dist/"

# Verifikasi build
if [ ! -f "$APP_DIR/dist/index.html" ]; then
    err "Build gagal! File dist/index.html tidak ditemukan."
    exit 1
fi

DIST_SIZE=$(du -sh "$APP_DIR/dist/" | cut -f1)
ok "Ukuran dist: $DIST_SIZE"

# ── Step 7: Setup Nginx ──────────────────────────────────────
info "Step 7: Setup Nginx config..."

# Deteksi domain/IP — user bisa ganti nanti
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

sudo tee "$NGINX_CONF" > /dev/null << 'NGINX_EOF'
# ═══════════════════════════════════════════════════════
# Portal ABK Ciraya — Nginx Configuration
# Static SPA served from /var/www/portal/dist
# ═══════════════════════════════════════════════════════

server {
    listen 80;
    # Ganti dengan domain kamu, atau biarkan _ untuk catch-all
    server_name _;

    root /var/www/portal/dist;
    index index.html;

    # ── SPA Routing ──
    # Semua route diarahkan ke index.html (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── Static Asset Caching ──
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ── Security Headers ──
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # ── Gzip Compression ──
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml;

    # ── Logging ──
    access_log /var/log/nginx/portal-abk-access.log;
    error_log  /var/log/nginx/portal-abk-error.log;
}
NGINX_EOF

ok "Nginx config ditulis ke $NGINX_CONF"

# Enable site
if [ ! -L "$NGINX_LINK" ]; then
    sudo ln -sf "$NGINX_CONF" "$NGINX_LINK"
    ok "Site diaktifkan."
fi

# Test & reload
info "Test Nginx config..."
if sudo nginx -t 2>&1; then
    ok "Nginx config valid."
    sudo systemctl reload nginx
    ok "Nginx di-reload."
else
    err "Nginx config error! Cek manual: sudo nginx -t"
    exit 1
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ DEPLOY BERHASIL!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  📁 Lokasi app  : $APP_DIR"
echo "  📦 Build output: $APP_DIR/dist/"
echo "  🌐 Akses via   : http://$SERVER_IP"
echo "  📋 Nginx config: $NGINX_CONF"
echo "  📊 Nginx log   : /var/log/nginx/portal-abk-*.log"
echo ""
echo "  ⚠️  Jika pakai domain, edit server_name di:"
echo "     sudo nano $NGINX_CONF"
echo "     sudo systemctl reload nginx"
echo ""
echo "  🔄 Untuk update berikutnya, jalankan:"
echo "     cd $APP_DIR && git pull origin main && npm install && npm run build"
echo ""
