import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { supplierController, resellerController, orderController } from '../controllers/businessControllers.js';
import { authenticate, authorize } from '../middleware/auth.js';

// Category Routes
export const categoryRoutes = Router();
categoryRoutes.get('/', categoryController.getAll);
categoryRoutes.get('/:id', categoryController.getById);
categoryRoutes.post('/', authenticate, authorize('ADMIN'), categoryController.create);
categoryRoutes.put('/:id', authenticate, authorize('ADMIN'), categoryController.update);
categoryRoutes.delete('/:id', authenticate, authorize('ADMIN'), categoryController.delete);

// Supplier Routes
export const supplierRoutes = Router();
supplierRoutes.get('/', authenticate, supplierController.getAll);
supplierRoutes.get('/:id', authenticate, supplierController.getById);
supplierRoutes.post('/', authenticate, authorize('ADMIN'), supplierController.create);
supplierRoutes.put('/:id', authenticate, authorize('ADMIN'), supplierController.update);
supplierRoutes.delete('/:id', authenticate, authorize('ADMIN'), supplierController.delete);

// Reseller Routes
export const resellerRoutes = Router();
resellerRoutes.get('/', authenticate, authorize('ADMIN'), resellerController.getAll);
resellerRoutes.get('/:id', authenticate, resellerController.getById);
resellerRoutes.post('/', authenticate, authorize('ADMIN'), resellerController.create);
resellerRoutes.put('/:id', authenticate, authorize('ADMIN'), resellerController.update);
resellerRoutes.delete('/:id', authenticate, authorize('ADMIN'), resellerController.delete);

// Order Routes
export const orderRoutes = Router();
orderRoutes.get('/', authenticate, orderController.getAll);
orderRoutes.get('/:id', authenticate, orderController.getById);
orderRoutes.post('/', authenticate, orderController.create);
orderRoutes.patch('/:id/status', authenticate, authorize('ADMIN'), orderController.updateStatus);
orderRoutes.delete('/:id', authenticate, authorize('ADMIN'), orderController.delete);
