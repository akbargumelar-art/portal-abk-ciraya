# Portal ABK Ciraya - Backend API

Production-ready backend API for Portal ABK Ciraya built with Node.js, Express, TypeScript, Prisma ORM, and MySQL.

## 🚀 Tech Stack

- **Runtime**: Node.js v20 LTS
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: MySQL 8.0
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Process Manager**: PM2

## 📋 Prerequisites

- Node.js >= 20.x
- MySQL >= 8.0
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="mysql://username:password@localhost:3306/portal_abk_ciraya"
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-minimum-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Database Setup

Generate Prisma Client:

```bash
npm run prisma:generate
```

Create database and run migrations:

```bash
npm run migrate
```

Seed initial data:

```bash
npm run seed
```

**Default admin credentials** (after seeding):
- Email: `admin@portal.com`
- Password: `admin123`

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Server will run on `http://localhost:3000`

### Production Mode

```bash
npm run build
npm start
```

### With PM2 (Production)

```bash
pm2 start ecosystem.config.cjs
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | User login | ❌ |
| GET | `/auth/me` | Get current user | ✅ |
| POST | `/auth/logout` | Logout | ✅ |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/products` | Get all products | ❌ |
| GET | `/products/:id` | Get product by ID | ❌ |
| GET | `/products/low-stock` | Get low stock products | ✅ (Admin) |
| POST | `/products` | Create product | ✅ (Admin) |
| PUT | `/products/:id` | Update product | ✅ (Admin) |
| DELETE | `/products/:id` | Delete product | ✅ (Admin) |
| PATCH | `/products/:id/stock` | Update stock | ✅ (Admin) |

### Category Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/categories` | Get all categories | ❌ |
| GET | `/categories/:id` | Get category by ID | ❌ |
| POST | `/categories` | Create category | ✅ (Admin) |
| PUT | `/categories/:id` | Update category | ✅ (Admin) |
| DELETE | `/categories/:id` | Delete category | ✅ (Admin) |

### Supplier Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/suppliers` | Get all suppliers | ✅ | Any |
| GET | `/suppliers/:id` | Get supplier by ID | ✅ | Any |
| POST | `/suppliers` | Create supplier | ✅ | Admin |
| PUT | `/suppliers/:id` | Update supplier | ✅ | Admin |
| DELETE | `/suppliers/:id` | Delete supplier | ✅ | Admin |

### Reseller Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/resellers` | Get all resellers | ✅ | Admin |
| GET | `/resellers/:id` | Get reseller by ID | ✅ | Any |
| POST | `/resellers` | Create reseller | ✅ | Admin |
| PUT | `/resellers/:id` | Update reseller | ✅ | Admin |
| DELETE | `/resellers/:id` | Delete reseller | ✅ | Admin |

### Order Endpoints

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/orders` | Get all orders | ✅ | Any |
| GET | `/orders/:id` | Get order by ID | ✅ | Any |
| POST | `/orders` | Create order | ✅ | Any |
| PATCH | `/orders/:id/status` | Update order status | ✅ | Admin |
| DELETE | `/orders/:id` | Delete order | ✅ | Admin |

## 🔒 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Example Login Request

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@portal.com", "password": "admin123"}'
```

### Example Authenticated Request

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🗄️ Database Migrations

### Create New Migration

When you modify `prisma/schema.prisma`:

```bash
npm run migrate
```

This will:
1. Create a migration file
2. Apply changes to database
3. Regenerate Prisma Client

### Deploy Migrations (Production)

```bash
npm run migrate:deploy
```

**✅ NO MANUAL SQL QUERIES NEEDED!**

## 🚢 Deployment to VPS

### Prerequisites on VPS

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install MySQL
sudo apt-get install mysql-server
```

### Deployment Steps

1. **Clone repository** to VPS
2. **Navigate to backend** folder
3. **Setup environment** (create `.env` file)
4. **Run deployment script**:

```bash
cd deploy
chmod +x deploy-backend.sh
./deploy-backend.sh
```

### Manual Deployment Steps

```bash
cd backend
npm install
npm run build
npm run migrate:deploy
npm run prisma:generate
pm2 start ecosystem.config.cjs
pm2 save
```

## 📊 PM2 Commands

```bash
pm2 status                    # Check status
pm2 logs portal-abk-backend   # View logs
pm2 restart portal-abk-backend # Restart
pm2 stop portal-abk-backend   # Stop
pm2 monit                     # Monitor resources
```

## 🔧 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts      # App config
│   │   └── database.ts   # Prisma client
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Authentication
│   │   ├── errorHandler.ts
│   │   └── validate.ts   # Validation
│   ├── services/         # Business logic
│   │   ├── authService.ts
│   │   ├── productService.ts
│   │   ├── categoryService.ts
│   │   ├── supplierService.ts
│   │   ├── resellerService.ts
│   │   └── orderService.ts
│   ├── controllers/      # Request handlers
│   │   ├── authController.ts
│   │   ├── productController.ts
│   │   ├── categoryController.ts
│   │   └── businessControllers.ts
│   ├── routes/           # API routes
│   │   ├── authRoutes.ts
│   │   ├── productRoutes.ts
│   │   └── businessRoutes.ts
│   └── server.ts         # Entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Database migrations
│   └── seed.ts           # Seed data
├── .env                  # Environment variables
├── .env.example          # Environment template
├── package.json
├── tsconfig.json
└── ecosystem.config.cjs  # PM2 configuration
```

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (12 salt rounds)
- ✅ JWT authentication with expiry
- ✅ Role-based access control (ADMIN, RESELLER, CUSTOMER)
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Environment variable protection

## 📝 License

ISC

---

**Built with ❤️ for Portal ABK Ciraya**
