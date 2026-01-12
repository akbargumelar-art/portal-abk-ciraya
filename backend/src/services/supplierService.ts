import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const supplierService = {
    async getAllSuppliers() {
        return await prisma.supplier.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    },

    async getSupplierById(id: number) {
        const supplier = await prisma.supplier.findUnique({ where: { id } });
        if (!supplier) throw new AppError('Supplier not found', 404);
        return supplier;
    },

    async createSupplier(data: any) {
        return await prisma.supplier.create({ data });
    },

    async updateSupplier(id: number, data: any) {
        const existing = await prisma.supplier.findUnique({ where: { id } });
        if (!existing) throw new AppError('Supplier not found', 404);
        return await prisma.supplier.update({ where: { id }, data });
    },

    async deleteSupplier(id: number) {
        const existing = await prisma.supplier.findUnique({ where: { id } });
        if (!existing) throw new AppError('Supplier not found', 404);
        await prisma.supplier.update({ where: { id }, data: { isActive: false } });
        return { message: 'Supplier deleted successfully' };
    },
};
