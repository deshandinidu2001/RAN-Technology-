import { Router } from 'express';
import { getAllUsers } from '../controllers/userController';
import { optionalAuth, authenticate } from '../middleware/auth';

const router = Router();

// Routes
router.get('/', getAllUsers);

export default router;
