import prisma from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export const orderService = {
    async getAllOrders(filters?: { status?: string; userId?: number }) {
        const where: any = {};
        if (filters?.status) where.status = filters.status;
        if (filters?.userId) where.userId = filters.userId;

        return await prisma.order.findMany({
            where,
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: { include: { product: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    async getOrderById(id: number) {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: true,
                items: { include: { product: true } },
                transactions: true,
            },
        });
        if (!order) throw new AppError('Order not found', 404);
        return order;
    },

    async createOrder(data: any) {
        const { items, ...orderData } = data;

        // Generate order number
        const orderNumber = `ORD-${Date.now()}`;

        return await prisma.order.create({
            data: {
                ...orderData,
                orderNumber,
                items: {
                    create: items,
                },
            },
            include: { items: true },
        });
    },

    async updateOrderStatus(id: number, status: string) {
        const existing = await prisma.order.findUnique({ where: { id } });
        if (!existing) throw new AppError('Order not found', 404);

        return await prisma.order.update({
            where: { id },
            data: { status: status as any },
        });
    },

    async deleteOrder(id: number) {
        const existing = await prisma.order.findUnique({ where: { id } });
        if (!existing) throw new AppError('Order not found', 404);
        await prisma.order.delete({ where: { id } });
        return { message: 'Order deleted successfully' };
    },
};
