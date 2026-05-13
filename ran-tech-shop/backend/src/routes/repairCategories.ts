import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/repairCategoryController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', listCategories);
router.post('/', optionalAuth, createCategory);
router.patch('/:id', optionalAuth, updateCategory);
router.delete('/:id', optionalAuth, deleteCategory);

export default router;
