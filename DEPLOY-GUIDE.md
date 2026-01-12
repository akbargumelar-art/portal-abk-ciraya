# 🚀 Panduan Upload ke GitHub & Deploy ke VPS

## Bagian 1️⃣: Upload Project ke GitHub (dari Windows Anda)

### Step 1: Install Git (jika belum)

Download dan install Git for Windows: https://git-scm.com/download/win

### Step 2: Buat Repository di GitHub

1. Buka https://github.com
2. Login ke akun GitHub Anda
3. Click tombol **"New"** atau **"Create repository"**
4. Isi:
   - **Repository name**: `portal-abk-ciraya`
   - **Description**: "Portal ABK Ciraya - Business Management Application"
   - **Public** atau **Private** (pilih sesuai kebutuhan)
   - **Jangan** centang "Add README" (karena kita sudah punya)
5. Click **"Create repository"**

GitHub akan menampilkan instruksi. **Jangan tutup halaman ini dulu.**

### Step 3: Push Project ke GitHub

Buka **Git Bash** atau **Command Prompt** di Windows, lalu jalankan:

```bash
# Pindah ke folder project
cd "d:\Backup\portal-abk-ciraya_20251221_024550"

# Initialize Git (jika belum)
git init

# Add semua file
git add .

# Commit pertama
git commit -m "Initial commit: Fullstack Portal ABK Ciraya with backend API"

# Ganti 'main' jadi nama branch default (optional, tapi recommended)
git branch -M main

# Tambahkan remote GitHub (GANTI dengan URL repository Anda!)
git remote add origin https://github.com/YOUR_USERNAME/portal-abk-ciraya.git

# Push ke GitHub
git push -u origin main
```

**⚠️ PENTING:** 
- Ganti `YOUR_USERNAME` dengan username GitHub Anda
- Login GitHub akan ditanya saat push pertama kali

### Step 4: Verifikasi

Refresh halaman GitHub repository Anda. Semua file harusnya sudah muncul!

---

## Bagian 2️⃣: Clone & Deploy di VPS Ubuntu

### Step 1: Install Node.js di VPS (jika belum)

```bash
# Di VPS (SSH connection yang sudah terbuka)
# Install Node.js v20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verifikasi
node --version  # Harus v20.x
npm --version
```

### Step 2: Install PM2 Globally

```bash
sudo npm install -g pm2
pm2 --version
```

### Step 3: Clone Repository dari GitHub

```bash
# Pindah ke home directory
cd ~

# Clone repository (GANTI dengan URL repository Anda!)
git clone https://github.com/YOUR_USERNAME/portal-abk-ciraya.git

# Masuk ke folder
cd portal-abk-ciraya
```

### Step 4: Setup Backend di VPS

```bash
# Masuk ke folder backend
cd backend

# Install dependencies
npm install

# Buat file .env
nano .env
```

Paste isi berikut ke file `.env`:

```env
DATABASE_URL="mysql://portal_user:PasswordKuat123!@localhost:3306/portal_abk_ciraya"

PORT=3000
NODE_ENV=production

JWT_SECRET=ganti-dengan-string-random-panjang-minimal-32-karakter-production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://31.97.106.147
```

**Tekan:**
- `CTRL + X` untuk keluar
- `Y` untuk save
- `ENTER` untuk confirm

### Step 5: Setup Database & Migrasi

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (create tables)
npx prisma migrate deploy

# Seed data (admin user & sample data)
npm run seed
```

**Output yang diharapkan:**
```
✅ Admin user created: admin@portal.com
✅ Categories created: 3
✅ Products created: 2
🎉 Database seeding completed!
```

### Step 6: Build Backend

```bash
# Build TypeScript ke JavaScript
npm run build

# Cek folder dist sudah ada
ls dist/
```

### Step 7: Start dengan PM2

```bash
# Start backend dengan PM2
pm2 start ecosystem.config.cjs

# Cek status
pm2 status

# Lihat logs (jika ada error)
pm2 logs portal-abk-backend

# Save PM2 config (auto-start saat reboot)
pm2 save
pm2 startup
# Copy paste command yang muncul dan jalankan
```

### Step 8: Test Backend API

```bash
# Test health check
curl http://localhost:3000/health

# Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","password":"admin123"}'
```

Jika berhasil, Anda akan dapat response dengan token JWT!

---

## Bagian 3️⃣: Setup Nginx (Reverse Proxy)

### Step 1: Install Nginx

```bash
sudo apt update
sudo apt install nginx -y
```

### Step 2: Configure Nginx

```bash
# Buat config file
sudo nano /etc/nginx/sites-available/portal-abk-ciraya
```

Paste config berikut:

```nginx
server {
    listen 80;
    server_name 31.97.106.147;

    # Frontend - nanti setelah build React
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
```

Save dengan `CTRL+X`, `Y`, `ENTER`.

### Step 3: Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/portal-abk-ciraya /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl status nginx
```

### Step 4: Test API dari Luar

Dari browser atau Postman:
```
http://31.97.106.147/health
http://31.97.106.147/api/products
```

---

## Bagian 4️⃣: Build & Deploy Frontend

```bash
# Kembali ke root project
cd ~/portal-abk-ciraya/frontend

# Install dependencies
npm install

# Build production
npm run build

# Cek folder dist sudah ada
ls dist/
```

Frontend sekarang bisa diakses di: **http://31.97.106.147**

---

## 🎯 Checklist Deployment

✅ **Database:**
- [x] MySQL installed
- [x] Database `portal_abk_ciraya` created
- [x] User `portal_user` created with privileges

✅ **Backend:**
- [ ] Node.js v20 installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured
- [ ] Prisma migration run
- [ ] Database seeded
- [ ] TypeScript built
- [ ] PM2 running
- [ ] API responding on `/health`

✅ **Nginx:**
- [ ] Nginx installed
- [ ] Config file created
- [ ] Site enabled
- [ ] Nginx restarted
- [ ] API accessible from outside

✅ **Frontend:**
- [ ] Dependencies installed
- [ ] Built (`npm run build`)
- [ ] Accessible from browser

---

## 🆘 Troubleshooting

### PM2 not found
```bash
sudo npm install -g pm2
```

### Port 3000 already in use
```bash
# Lihat process di port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### Nginx error
```bash
# Cek error log
sudo tail -f /var/log/nginx/error.log

# Test config
sudo nginx -t
```

### Can't connect to database
- Cek DATABASE_URL di `.env`
- Pastikan MySQL running: `sudo systemctl status mysql`

---

## 🔄 Update Code (Jika Ada Perubahan)

### Di Windows (Local):
```bash
git add .
git commit -m "Update: describe your changes"
git push origin main
```

### Di VPS:
```bash
cd ~/portal-abk-ciraya

# Pull latest code
git pull origin main

# Update backend
cd backend
npm install
npm run build
pm2 restart portal-abk-backend

# Update frontend (jika ada perubahan)
cd ../frontend
npm install
npm run build
```

---

## 📞 Commands Penting

```bash
# PM2
pm2 status                    # Status semua process
pm2 logs portal-abk-backend   # Lihat logs
pm2 restart portal-abk-backend # Restart backend
pm2 stop portal-abk-backend   # Stop backend
pm2 monit                     # Monitor resources

# Nginx
sudo systemctl status nginx   # Cek status
sudo systemctl restart nginx  # Restart
sudo nginx -t                # Test config

# MySQL
sudo systemctl status mysql   # Cek status
mysql -u portal_user -p       # Login ke database
```

---

**Selamat! Backend & Frontend Anda sekarang LIVE di VPS! 🎉**

Access: **http://31.97.106.147**
API: **http://31.97.106.147/api**
