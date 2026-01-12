import { Request, Response, NextFunction } from 'express';
import { supplierService } from '../services/supplierService.js';
import { resellerService } from '../services/resellerService.js';
import { orderService } from '../services/orderService.js';

export const supplierController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await supplierService.getAllSuppliers();
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await supplierService.getSupplierById(Number(req.params.id));
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await supplierService.createSupplier(req.body);
            res.status(201).json({ success: true, message: 'Supplier created', data });
        } catch (error) {
            next(error);
        }
    },
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await supplierService.updateSupplier(Number(req.params.id), req.body);
            res.json({ success: true, message: 'Supplier updated', data });
        } catch (error) {
            next(error);
        }
    },
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await supplierService.deleteSupplier(Number(req.params.id));
            res.json({ success: true, message: 'Supplier deleted' });
        } catch (error) {
            next(error);
        }
    },
};

export const resellerController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await resellerService.getAllResellers();
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await resellerService.getResellerById(Number(req.params.id));
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await resellerService.createReseller(req.body);
            res.status(201).json({ success: true, message: 'Reseller created', data });
        } catch (error) {
            next(error);
        }
    },
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await resellerService.updateReseller(Number(req.params.id), req.body);
            res.json({ success: true, message: 'Reseller updated', data });
        } catch (error) {
            next(error);
        }
    },
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await resellerService.deleteReseller(Number(req.params.id));
            res.json({ success: true, message: 'Reseller deleted' });
        } catch (error) {
            next(error);
        }
    },
};

export const orderController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, userId } = req.query;
            const data = await orderService.getAllOrders({
                status: status as string,
                userId: userId ? Number(userId) : undefined,
            });
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await orderService.getOrderById(Number(req.params.id));
            res.json({ success: true, data });
        } catch (error) {
            next(error);
        }
    },
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await orderService.createOrder(req.body);
            res.status(201).json({ success: true, message: 'Order created', data });
        } catch (error) {
            next(error);
        }
    },
    async updateStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await orderService.updateOrderStatus(Number(req.params.id), req.body.status);
            res.json({ success: true, message: 'Order status updated', data });
        } catch (error) {
            next(error);
        }
    },
    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await orderService.deleteOrder(Number(req.params.id));
            res.json({ success: true, message: 'Order deleted' });
        } catch (error) {
            next(error);
        }
    },
};
