#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Portal ABK Ciraya — Update Script (VPS)
#
# Jalankan setiap kali ada commit baru di GitHub:
#   cd /var/www/portal && bash deploy.sh
#
# Yang dilakukan:
#   1. Pull update terbaru dari GitHub (branch main)
#   2. Install ulang dependencies HANYA jika package*.json berubah
#   3. Build production (vite)
#   4. Reload Nginx
#
# Untuk first-time setup di VPS baru, gunakan: deploy/deploy-vps.sh
# ═══════════════════════════════════════════════════════════════
set -e

BRANCH="${BRANCH:-main}"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Warna ────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()   { echo -e "${GREEN}[OK]${NC}   $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC}  $1"; }

START_TS=$(date +%s)
echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Portal ABK Ciraya — Deploy Update"
echo "  Dir: $APP_DIR"
echo "  Branch: $BRANCH"
echo "═══════════════════════════════════════════════════════"

cd "$APP_DIR"

# ── Validasi: pastikan ini git repo ──────────────────────────
if [ ! -d ".git" ]; then
    err "Folder ini bukan git repository. Jalankan deploy/deploy-vps.sh dulu untuk first-time setup."
    exit 1
fi

# ── Step 1: Catat commit lama untuk deteksi perubahan ────────
OLD_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "none")
OLD_PKG_HASH=$(sha1sum package.json package-lock.json 2>/dev/null | sha1sum | awk '{print $1}')

# ── Step 2: Pull update ──────────────────────────────────────
info "Step 1/4: Pull dari origin/$BRANCH..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"
NEW_COMMIT=$(git rev-parse HEAD)

if [ "$OLD_COMMIT" = "$NEW_COMMIT" ]; then
    warn "Tidak ada commit baru. Lanjut build ulang? (Ctrl+C untuk batal, Enter untuk lanjut)"
    read -r _
else
    ok "Update: ${OLD_COMMIT:0:7} → ${NEW_COMMIT:0:7}"
    echo ""
    echo "  Commit yang masuk:"
    git log --oneline "${OLD_COMMIT}..${NEW_COMMIT}" 2>/dev/null | head -10 | sed 's/^/    /'
    echo ""
fi

# ── Step 3: Install dependencies (kalau berubah) ─────────────
NEW_PKG_HASH=$(sha1sum package.json package-lock.json 2>/dev/null | sha1sum | awk '{print $1}')
if [ "$OLD_PKG_HASH" != "$NEW_PKG_HASH" ] || [ ! -d "node_modules" ]; then
    info "Step 2/4: package.json berubah → npm ci..."
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    ok "Dependencies di-install."
else
    info "Step 2/4: Dependencies tidak berubah, skip."
fi

# ── Step 4: Build ────────────────────────────────────────────
info "Step 3/4: Build production..."
npm run build
if [ ! -f "$APP_DIR/dist/index.html" ]; then
    err "Build gagal — dist/index.html tidak ada."
    exit 1
fi
DIST_SIZE=$(du -sh "$APP_DIR/dist/" | cut -f1)
ok "Build selesai. Ukuran dist: $DIST_SIZE"

# ── Step 5: Reload Nginx ─────────────────────────────────────
info "Step 4/4: Reload Nginx..."
if command -v nginx &>/dev/null; then
    if sudo nginx -t 2>&1 | grep -q "successful"; then
        sudo systemctl reload nginx
        ok "Nginx di-reload."
    else
        err "Nginx config invalid! Cek: sudo nginx -t"
        exit 1
    fi
else
    warn "Nginx tidak terinstall, skip reload."
fi

# ── Done ─────────────────────────────────────────────────────
ELAPSED=$(( $(date +%s) - START_TS ))
echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "  ${GREEN}✅ DEPLOY SELESAI dalam ${ELAPSED}s${NC}"
echo "═══════════════════════════════════════════════════════"
echo "  Commit aktif : ${NEW_COMMIT:0:7}  ($(git log -1 --format='%s' "$NEW_COMMIT"))"
echo "  Build output : $APP_DIR/dist/"
echo ""
