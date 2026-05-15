import { Router } from 'express';
import {
  submitContactMessage,
  listContactMessages,
  setMessageRead,
  replyToContactMessage,
  deleteContactMessage,
} from '../controllers/contactController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Public
router.post('/', submitContactMessage);

// Admin
router.get('/admin', optionalAuth, listContactMessages);
router.patch('/admin/:id', optionalAuth, setMessageRead);
router.post('/admin/:id/reply', optionalAuth, replyToContactMessage);
router.delete('/admin/:id', optionalAuth, deleteContactMessage);

export default router;
