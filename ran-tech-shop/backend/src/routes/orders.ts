import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
} from '../controllers/orderController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// User routes
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/all', optionalAuth, getAllOrders); // Admin/dashboard route
router.get('/:id', authenticate, getOrderById);
router.post('/:id/cancel', authenticate, cancelOrder);

// Admin routes
router.put('/:id/status', optionalAuth, updateOrderStatus);

export default router;
