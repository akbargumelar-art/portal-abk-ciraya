# Portal ABK Ciraya

Aplikasi manajemen bisnis lengkap untuk Portal ABK Ciraya dengan frontend React dan backend Node.js.

## 🚀 Tech Stack

### Frontend
- React 19 + TypeScript
- Vite
- TailwindCSS
- React Router
- Chart.js & Recharts

### Backend
- Node.js 20 + Express
- TypeScript
- Prisma ORM
- MySQL 8.0
- JWT Authentication
- PM2 Cluster

## 📁 Struktur Project

```
portal-abk-ciraya/
├── frontend/              # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/              # Node.js API server
│   ├── src/
│   ├── prisma/
│   └── package.json
└── deploy/              # Deployment scripts
    ├── deploy-backend.sh
    └── nginx.conf
```

## 🛠️ Quick Start

### Prerequisites
- Node.js >= 20.x
- MySQL >= 8.0
- npm atau yarn

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/portal-abk-ciraya.git
cd portal-abk-ciraya
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

#### 3. Backend Setup
```bash
cd backend
npm install

# Copy environment template
cp .env.example .env
# Edit .env dengan database credentials Anda

# Setup database
npx prisma generate
npx prisma migrate dev --name init
npm run seed

# Start backend
npm run dev
# Backend runs on http://localhost:3000
```

## 📚 Documentation

- [Backend README](./backend/README.md) - API documentation lengkap
- [Backend Setup Guide](./backend/SETUP.md) - Panduan setup cepat
- [Deployment Guide](./backend/LANGKAH-SELANJUTNYA.md) - Panduan deployment

## 🚢 Deployment

### Deploy ke VPS Ubuntu

Lihat panduan lengkap di [LANGKAH-SELANJUTNYA.md](./backend/LANGKAH-SELANJUTNYA.md)

### Quick Deploy

```bash
# Di VPS
git clone https://github.com/YOUR_USERNAME/portal-abk-ciraya.git
cd portal-abk-ciraya/deploy
chmod +x deploy-backend.sh
./deploy-backend.sh
```

## 🔐 Default Credentials (Setelah Seed)

- Email: `admin@portal.com`
- Password: `admin123`

**⚠️ PENTING:** Ganti password default setelah login pertama!

## 📝 License

ISC

## 👥 Author

Portal ABK Ciraya Team
