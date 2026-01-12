import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/productService.js';

export const productController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { categoryId, supplierId, search } = req.query;

            const products = await productService.getAllProducts({
                categoryId: categoryId ? Number(categoryId) : undefined,
                supplierId: supplierId ? Number(supplierId) : undefined,
                search: search as string,
            });

            res.json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const product = await productService.getProductById(Number(id));

            res.json({
                success: true,
                data: product,
            });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const product = await productService.createProduct(req.body);

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product,
            });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const product = await productService.updateProduct(Number(id), req.body);

            res.json({
                success: true,
                message: 'Product updated successfully',
                data: product,
            });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            await productService.deleteProduct(Number(id));

            res.json({
                success: true,
                message: 'Product deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    },

    async updateStock(req: Request, res: Response, next: NextFunction) {
        try {
            const { id } = req.params;
            const { quantity } = req.body;

            const product = await productService.updateStock(Number(id), quantity);

            res.json({
                success: true,
                message: 'Stock updated successfully',
                data: product,
            });
        } catch (error) {
            next(error);
        }
    },

    async getLowStock(req: Request, res: Response, next: NextFunction) {
        try {
            const products = await productService.getLowStockProducts();

            res.json({
                success: true,
                data: products,
            });
        } catch (error) {
            next(error);
        }
    },
};
