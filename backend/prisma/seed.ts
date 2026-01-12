import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Seed Admin User
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@portal.com' },
        update: {},
        create: {
            email: 'admin@portal.com',
            password: hashedPassword,
            name: 'Admin Portal',
            role: 'ADMIN',
            phone: '081234567890',
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // Seed Categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { name: 'Electronics' },
            update: {},
            create: { name: 'Electronics', description: 'Electronic products', icon: '💻' },
        }),
        prisma.category.upsert({
            where: { name: 'Accessories' },
            update: {},
            create: { name: 'Accessories', description: 'Product accessories', icon: '🎧' },
        }),
        prisma.category.upsert({
            where: { name: 'Services' },
            update: {},
            create: { name: 'Services', description: 'Service products', icon: '🛠️' },
        }),
    ]);
    console.log('✅ Categories created:', categories.length);

    // Seed Suppliers
    const supplier = await prisma.supplier.upsert({
        where: { id: 1 },
        update: {},
        create: {
            name: 'Main Supplier',
            company: 'Supply Co.',
            email: 'supplier@example.com',
            phone: '081234567891',
            address: 'Jl. Supplier No. 1',
            city: 'Jakarta',
            province: 'DKI Jakarta',
        },
    });
    console.log('✅ Supplier created:', supplier.name);

    // Seed Products
    const products = await Promise.all([
        prisma.product.upsert({
            where: { sku: 'PROD-001' },
            update: {},
            create: {
                sku: 'PROD-001',
                name: 'Sample Product 1',
                description: 'This is a sample product',
                categoryId: categories[0].id,
                supplierId: supplier.id,
                costPrice: 50000,
                sellingPrice: 75000,
                stock: 100,
                minStock: 10,
            },
        }),
        prisma.product.upsert({
            where: { sku: 'PROD-002' },
            update: {},
            create: {
                sku: 'PROD-002',
                name: 'Sample Product 2',
                description: 'Another sample product',
                categoryId: categories[1].id,
                supplierId: supplier.id,
                costPrice: 30000,
                sellingPrice: 50000,
                stock: 50,
                minStock: 5,
            },
        }),
    ]);
    console.log('✅ Products created:', products.length);

    console.log('🎉 Database seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
