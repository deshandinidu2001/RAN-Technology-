import { Router } from 'express';
import { listNotifications, markRead, markAllRead } from '../controllers/notificationController';

const router = Router();

router.get('/', listNotifications);
router.patch('/:id/read', markRead);
router.post('/read-all', markAllRead);

export default router;
