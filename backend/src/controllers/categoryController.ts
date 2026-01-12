import { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/categoryService.js';

export const categoryController = {
    async getAll(req: Request, res: Response, next: NextFunction) {
        try {
            const categories = await categoryService.getAllCategories();
            res.json({ success: true, data: categories });
        } catch (error) {
            next(error);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await categoryService.getCategoryById(Number(req.params.id));
            res.json({ success: true, data: category });
        } catch (error) {
            next(error);
        }
    },

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await categoryService.createCategory(req.body);
            res.status(201).json({ success: true, message: 'Category created', data: category });
        } catch (error) {
            next(error);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const category = await categoryService.updateCategory(Number(req.params.id), req.body);
            res.json({ success: true, message: 'Category updated', data: category });
        } catch (error) {
            next(error);
        }
    },

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await categoryService.deleteCategory(Number(req.params.id));
            res.json({ success: true, message: 'Category deleted' });
        } catch (error) {
            next(error);
        }
    },
};
