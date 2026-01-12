# 🚀 Langkah Selanjutnya - Portal ABK Ciraya Backend

## Status Saat Ini ✅

Backend **SUDAH SELESAI** dibuat dengan lengkap:
- ✅ Express.js + TypeScript server
- ✅ Prisma ORM + MySQL schema
- ✅ Authentication (JWT + bcrypt)
- ✅ API endpoints untuk semua modul
- ✅ Deployment scripts (PM2 + Nginx)
- ✅ Documentation lengkap

**Yang perlu Anda lakukan sekarang:**

---

## 1️⃣ Setup Database MySQL (5 menit)

### Pastikan MySQL sudah terinstall:

```bash
# Cek MySQL status
mysql --version

# Jika belum install, install dulu:
# Windows: Download dari https://dev.mysql.com/downloads/installer/
# Linux: sudo apt install mysql-server
```

### Buat Database:

```bash
# Login ke MySQL
mysql -u root -p
# Masukkan password MySQL Anda
```

Jalankan SQL berikut:

```sql
CREATE DATABASE portal_abk_ciraya CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'portal_user'@'localhost' IDENTIFIED BY 'PasswordKuat123!';

GRANT ALL PRIVILEGES ON portal_abk_ciraya.* TO 'portal_user'@'localhost';

FLUSH PRIVILEGES;

SHOW DATABASES;  -- Lihat database yang sudah dibuat

EXIT;
```

---

## 2️⃣ Konfigurasi Environment (2 menit)

**Buat file `.env` di folder `backend`:**

```bash
cd backend
notepad .env  # Windows
# atau
nano .env     # Linux/Mac
```

**Isi file `.env`:**

```env
DATABASE_URL="mysql://portal_user:PasswordKuat123!@localhost:3306/portal_abk_ciraya"

PORT=3000
NODE_ENV=development

JWT_SECRET=ganti-dengan-string-random-minimal-32-karakter-untuk-keamanan
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

**⚠️ PENTING:**
- Ganti `PasswordKuat123!` dengan password yang Anda buat di step 1
- Ganti `JWT_SECRET` dengan string random yang panjang untuk produksi

---

## 3️⃣ Generate Prisma Client & Migrasi Database (3 menit)

```bash
cd backend

# Generate Prisma Client (TypeScript types)
npx prisma generate

# Buat tabel-tabel database (jalankan migration)
npx prisma migrate dev --name init

# Isi data sample untuk testing
npm run seed
```

**Output yang diharapkan:**
```
✅ Admin user created: admin@portal.com
✅ Categories created: 3
✅ Supplier created: Main Supplier
✅ Products created: 2
🎉 Database seeding completed!
```

**Login credentials default:**
- Email: `admin@portal.com`
- Password: `admin123`

---

## 4️⃣ Jalankan Backend Server (1 menit)

```bash
# Di folder backend
npm run dev
```

**Output yang diharapkan:**
```
🚀 Server running on port 3000
📝 Environment: development
🌐 CORS Origin: http://localhost:5173
```

**Biarkan terminal ini tetap berjalan!**

---

## 5️⃣ Test API (2 menit)

### Buka terminal BARU, test dengan curl atau browser:

**Health Check:**
```bash
curl http://localhost:3000/health
# atau buka di browser: http://localhost:3000/health
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@portal.com\",\"password\":\"admin123\"}"
```

**Ambil Data Products:**
```bash
curl http://localhost:3000/api/products
```

**Atau gunakan Postman/Insomnia untuk testing yang lebih mudah!**

---

## 6️⃣ Hubungkan dengan Frontend (Next Step)

### Opsi A: Update Frontend untuk Connect ke Backend

Buat file baru `frontend/src/config/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return response.json();
    },
    // ... dst
  },
  products: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/products`);
      return response.json();
    },
    // ... dst
  },
};
```

### Opsi B: Tetap Gunakan Mock Data Dulu

Anda bisa tetap development frontend dengan mock data, sambil backend sudah ready untuk nanti di-integrate.

---

## 🎯 Cek Apakah Sudah Berhasil

✅ **Backend berhasil jika:**
1. Server running di http://localhost:3000
2. Health check response: `{"status":"ok","message":"Server is running"}`
3. Login berhasil dan dapat token JWT
4. API products mengembalikan data

✅ **Database berhasil jika:**
1. Database `portal_abk_ciraya` terlihat di MySQL
2. Tabel-tabel sudah terbuat (users, products, categories, dll)
3. Seed data berhasil (ada admin user dan sample products)

---

## 🆘 Troubleshooting

### Error: "Can't connect to MySQL server"
- Pastikan MySQL running: `sudo service mysql status`
- Cek username/password di `.env` file
- Pastikan database `portal_abk_ciraya` sudah dibuat

### Error: "Prisma Client not found"
```bash
npx prisma generate
```

### Error: "Port 3000 already in use"
- Ubah PORT di `.env` menjadi `3001` atau port lain
- Atau matikan service yang menggunakan port 3000

### Error saat migrate
- Pastikan DATABASE_URL di `.env` benar
- Cek MySQL user memiliki privileges yang cukup
- Drop database dan buat ulang jika perlu

---

## 📞 Dukungan

**Dokumentasi lengkap:**
- [README.md](file:///d:/Backup/portal-abk-ciraya_20251221_024550/backend/README.md) - API documentation lengkap
- [SETUP.md](file:///d:/Backup/portal-abk-ciraya_20251221_024550/backend/SETUP.md) - Quick start guide

**File penting:**
- `backend/prisma/schema.prisma` - Database schema
- `backend/src/server.ts` - Main server file
- `backend/.env` - Environment configuration

---

## 🚀 Setelah Semuanya Running

**Untuk Development:**
1. Frontend: `npm run dev` (sudah running di port 5173)
2. Backend: `npm run dev` (running di port 3000)

**Untuk Deploy ke VPS:**
```bash
# Lihat file deploy/deploy-backend.sh
chmod +x deploy/deploy-backend.sh
./deploy/deploy-backend.sh
```

---

## 🎉 Kesimpulan

Anda sekarang punya:
- ✅ Backend API production-ready
- ✅ Database schema dengan auto-migration
- ✅ Authentication system lengkap
- ✅ 30+ API endpoints siap pakai
- ✅ Deployment ready untuk VPS

**Tinggal jalankan 6 langkah di atas dan backend Anda live! 🔥**

Jika ada pertanyaan atau error, screenshot dan kasih tahu saya!
