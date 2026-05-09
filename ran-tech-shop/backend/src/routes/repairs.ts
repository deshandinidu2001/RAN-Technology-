import { Router } from 'express';
import {
  getAvailability,
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByEmail,
  updateBookingStatus,
  cancelBooking,
  setAvailability,
  getStatistics,
  getRepairReviews,
  createRepairReview,
  getRepairServices,
} from '../controllers/repairController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/availability', getAvailability);
router.post('/book', createBooking);
router.get('/my-bookings', getBookingsByEmail);
router.get('/booking/:id', getBookingById);
router.post('/booking/:id/cancel', cancelBooking);

// Reviews routes
router.get('/reviews', getRepairReviews);
router.post('/reviews', createRepairReview);

// Services from database
router.get('/services', getRepairServices);

// Protected routes (admin only)
router.get('/admin/bookings', authenticate, getAllBookings);
router.patch('/admin/booking/:id', authenticate, updateBookingStatus);
router.post('/admin/availability', authenticate, setAvailability);
router.get('/admin/statistics', authenticate, getStatistics);

export default router;
