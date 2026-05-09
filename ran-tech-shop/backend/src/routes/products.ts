import { Router } from 'express';
import {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductFilters,
  addReview,
} from '../controllers/productController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', optionalAuth, getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/filters', getProductFilters);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', addReview);

// Admin-only routes (in production, add a real admin role check here).
// optionalAuth allows the admin panel (which uses a local password gate) to
// call these without a per-user JWT.
router.post('/', optionalAuth, createProduct);
router.put('/:id', optionalAuth, updateProduct);
router.delete('/:id', optionalAuth, deleteProduct);

export default router;
