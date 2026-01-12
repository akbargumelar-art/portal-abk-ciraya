import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken';
import prisma from '../config/database.js';
import { appConfig } from '../config/index.js';
import { AppError } from '../middleware/errorHandler.js';

const SALT_ROUNDS = 12;

export const authService = {
    async register(email: string, password: string, name: string, role: string = 'CUSTOMER') {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new AppError('Email already registered', 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role as any,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        // Generate token
        const token = this.generateToken(user.id, user.email, user.role);

        return { user, token };
    },

    async login(email: string, password: string) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        if (!user.isActive) {
            throw new AppError('Account is inactive', 403);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new AppError('Invalid credentials', 401);
        }

        // Generate token
        const token = this.generateToken(user.id, user.email, user.role);

        const userWithoutPassword = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
        };

        return { user: userWithoutPassword, token };
    },

    generateToken(userId: number, email: string, role: string): string {
        return jwt.sign(
            { userId, email, role },
            appConfig.jwt.secret as Secret,
            { expiresIn: appConfig.jwt.expiresIn }
        );
    },
    async getUserById(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        return user;
    },
};
