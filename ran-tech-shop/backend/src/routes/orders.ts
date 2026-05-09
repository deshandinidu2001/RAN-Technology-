import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All order routes require authentication
router.use(authenticate);

// User routes
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/all', getAllOrders); // Admin route
router.get('/:id', getOrderById);
router.post('/:id/cancel', cancelOrder);

// Admin routes
router.put('/:id/status', updateOrderStatus);

export default router;
