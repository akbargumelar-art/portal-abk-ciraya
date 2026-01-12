import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/', productController.getAll);
router.get('/low-stock', authenticate, authorize('ADMIN'), productController.getLowStock);
router.get('/:id', productController.getById);

// Protected routes (Admin only)
router.post('/', authenticate, authorize('ADMIN'), productController.create);
router.put('/:id', authenticate, authorize('ADMIN'), productController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), productController.delete);
router.patch('/:id/stock', authenticate, authorize('ADMIN'), productController.updateStock);

export default router;
