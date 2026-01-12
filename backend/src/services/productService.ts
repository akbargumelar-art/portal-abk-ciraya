import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const productService = {
    async getAllProducts(filters?: { categoryId?: number; supplierId?: number; search?: string }) {
        const where: any = { isActive: true };

        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }

        if (filters?.supplierId) {
            where.supplierId = filters.supplierId;
        }

        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search } },
                { sku: { contains: filters.search } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            include: {
                category: true,
                supplier: true,
            },
            orderBy: { name: 'asc' },
        });

        return products;
    },

    async getProductById(id: number) {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                supplier: true,
            },
        });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        return product;
    },

    async createProduct(data: {
        sku: string;
        name: string;
        description?: string;
        categoryId: number;
        supplierId: number;
        costPrice: number;
        sellingPrice: number;
        stock?: number;
        minStock?: number;
        imageUrl?: string;
    }) {
        // Check if SKU already exists
        const existingProduct = await prisma.product.findUnique({
            where: { sku: data.sku },
        });

        if (existingProduct) {
            throw new AppError('SKU already exists', 400);
        }

        const product = await prisma.product.create({
            data,
            include: {
                category: true,
                supplier: true,
            },
        });

        return product;
    },

    async updateProduct(id: number, data: Partial<any>) {
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            throw new AppError('Product not found', 404);
        }

        const product = await prisma.product.update({
            where: { id },
            data,
            include: {
                category: true,
                supplier: true,
            },
        });

        return product;
    },

    async deleteProduct(id: number) {
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });

        if (!existingProduct) {
            throw new AppError('Product not found', 404);
        }

        // Soft delete
        await prisma.product.update({
            where: { id },
            data: { isActive: false },
        });

        return { message: 'Product deleted successfully' };
    },

    async updateStock(id: number, quantity: number) {
        const product = await prisma.product.findUnique({
            where: { id },
        });

        if (!product) {
            throw new AppError('Product not found', 404);
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: { stock: product.stock + quantity },
        });

        return updatedProduct;
    },

    async getLowStockProducts() {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                stock: { lte: prisma.product.fields.minStock },
            },
            include: {
                category: true,
                supplier: true,
            },
        });

        return products;
    },
};
