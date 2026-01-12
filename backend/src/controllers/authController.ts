import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';

export const authController = {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, name, role } = req.body;

            const result = await authService.register(email, password, name, role);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            res.json({
                success: true,
                message: 'Login successful',
                data: result,
            });
        } catch (error) {
            next(error);
        }
    },

    async getMe(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const user = await authService.getUserById(req.user.userId);

            res.json({
                success: true,
                data: user,
            });
        } catch (error) {
            next(error);
        }
    },

    async logout(req: Request, res: Response) {
        // With JWT, logout is handled client-side by removing the token
        res.json({
            success: true,
            message: 'Logout successful',
        });
    },
};
