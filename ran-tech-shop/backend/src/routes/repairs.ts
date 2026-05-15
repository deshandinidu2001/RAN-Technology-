import { Router } from 'express';
import {
  getAvailability,
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByEmail,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
  setAvailability,
  getStatistics,
  getRepairReviews,
  createRepairReview,
  getRepairServices,
  sendBookingQuote,
  acceptQuote,
  sendCustomMessage,
} from '../controllers/repairController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/availability', getAvailability);
router.post('/book', createBooking);
router.get('/my-bookings', getBookingsByEmail);
router.get('/booking/:id', getBookingById);
router.post('/booking/:id/cancel', cancelBooking);
router.post('/booking/:id/accept', acceptQuote);

// Reviews routes
router.get('/reviews', getRepairReviews);
router.post('/reviews', createRepairReview);

// Services from database
router.get('/services', getRepairServices);

// Protected routes (admin only)
router.get('/admin/bookings', optionalAuth, getAllBookings);
router.patch('/admin/booking/:id', optionalAuth, updateBookingStatus);
router.post('/admin/booking/:id/quote', optionalAuth, sendBookingQuote);
router.post('/admin/booking/:id/message', optionalAuth, sendCustomMessage);
router.delete('/admin/booking/:id', optionalAuth, deleteBooking);
router.post('/admin/availability', authenticate, setAvailability);
router.get('/admin/statistics', optionalAuth, getStatistics);

export default router;
