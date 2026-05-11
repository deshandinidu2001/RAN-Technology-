import { Router } from 'express';
import {
  listFilterCategories,
  createFilterCategory,
  updateFilterCategory,
  deleteFilterCategory,
} from '../controllers/filterCategoryController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', listFilterCategories);
router.post('/', optionalAuth, createFilterCategory);
router.patch('/:id', optionalAuth, updateFilterCategory);
router.delete('/:id', optionalAuth, deleteFilterCategory);

export default router;
