# Quick Start Guide - Backend Setup

## 🏃 Getting Started in 5 Minutes

### Step 1: Setup MySQL Database

Make sure MySQL is running, then create the database:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE portal_abk_ciraya;
CREATE USER 'portal_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON portal_abk_ciraya.* TO 'portal_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Step 2: Configure Environment

Create `.env` file in the `backend` folder:

```env
DATABASE_URL="mysql://portal_user:your_password@localhost:3306/portal_abk_ciraya"
PORT=3000
NODE_ENV=development
JWT_SECRET=change-this-to-a-random-string-minimum-32-characters
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### Step 3: Install & Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run migrations (create tables)
npx prisma migrate dev --name init

# Seed database with sample data
npm run seed
```

### Step 4: Start Backend

```bash
npm run dev
```

Backend will run on **http://localhost:3000**

### Step 5: Test API

Open browser or use curl:

```bash
# Health check
curl http://localhost:3000/health

# Login with seeded admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@portal.com","password":"admin123"}'
```

## ✅ You're Ready!

Your backend is now running with:
- ✅ MySQL database connected
- ✅ All tables created
- ✅ Sample data loaded
- ✅ Admin user: `admin@portal.com` / `admin123`
- ✅ API ready at `http://localhost:3000/api`

## 🔄 Database Migrations (When Schema Changes)

Whenever you modify `prisma/schema.prisma`:

```bash
# Create migration
npx prisma migrate dev --name describe_your_change

# ✅ Done! Database automatically updated
```

## 📝 Common Issues

### "Can't connect to database"
- Check MySQL is running: `sudo service mysql status`
- Verify DATABASE_URL in `.env` file
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Port 3000 already in use"
- Change PORT in `.env` to another port (e.g., 3001)
- Or stop other process: `lsof -ti:3000 | xargs kill`

## 🚀 Next Steps

1. **Connect Frontend**: Update frontend API calls to point to `http://localhost:3000/api`
2. **Test Endpoints**: Use Postman or curl to test all API endpoints
3. **Customize**: Add more fields to Prisma schema as needed
4. **Deploy**: Follow deployment guide in README.md

---

Need help? Check the full README.md for detailed documentation!
