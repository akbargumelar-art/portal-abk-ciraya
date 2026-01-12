import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const categoryService = {
    async getAllCategories() {
        return await prisma.category.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    },

    async getCategoryById(id: number) {
        const category = await prisma.category.findUnique({
            where: { id },
        });

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        return category;
    },

    async createCategory(data: { name: string; description?: string; icon?: string }) {
        return await prisma.category.create({ data });
    },

    async updateCategory(id: number, data: Partial<any>) {
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) throw new AppError('Category not found', 404);

        return await prisma.category.update({ where: { id }, data });
    },

    async deleteCategory(id: number) {
        const existing = await prisma.category.findUnique({ where: { id } });
        if (!existing) throw new AppError('Category not found', 404);

        await prisma.category.update({ where: { id }, data: { isActive: false } });
        return { message: 'Category deleted successfully' };
    },
};
