import { Router } from 'express';
import { sendQuote } from '../controllers/quoteController';

const router = Router();

router.post('/send', sendQuote);

export default router;
