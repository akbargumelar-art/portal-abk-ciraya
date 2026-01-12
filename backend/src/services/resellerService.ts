import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const resellerService = {
    async getAllResellers() {
        return await prisma.reseller.findMany({
            include: { user: { select: { email: true, name: true, phone: true } } },
            orderBy: { createdAt: 'desc' },
        });
    },

    async getResellerById(id: number) {
        const reseller = await prisma.reseller.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!reseller) throw new AppError('Reseller not found', 404);
        return reseller;
    },

    async createReseller(data: any) {
        return await prisma.reseller.create({
            data,
            include: { user: true },
        });
    },

    async updateReseller(id: number, data: any) {
        const existing = await prisma.reseller.findUnique({ where: { id } });
        if (!existing) throw new AppError('Reseller not found', 404);
        return await prisma.reseller.update({ where: { id }, data, include: { user: true } });
    },

    async deleteReseller(id: number) {
        const existing = await prisma.reseller.findUnique({ where: { id } });
        if (!existing) throw new AppError('Reseller not found', 404);
        await prisma.reseller.delete({ where: { id } });
        return { message: 'Reseller deleted successfully' };
    },
};
