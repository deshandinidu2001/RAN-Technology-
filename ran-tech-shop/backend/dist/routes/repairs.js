"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repairController_1 = require("../controllers/repairController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/availability', repairController_1.getAvailability);
router.post('/book', repairController_1.createBooking);
router.get('/my-bookings', repairController_1.getBookingsByEmail);
router.get('/booking/:id', repairController_1.getBookingById);
router.post('/booking/:id/cancel', repairController_1.cancelBooking);
// Reviews routes
router.get('/reviews', repairController_1.getRepairReviews);
router.post('/reviews', repairController_1.createRepairReview);
// Services from database
router.get('/services', repairController_1.getRepairServices);
// Protected routes (admin only)
router.get('/admin/bookings', auth_1.optionalAuth, repairController_1.getAllBookings);
router.patch('/admin/booking/:id', auth_1.optionalAuth, repairController_1.updateBookingStatus);
router.post('/admin/availability', auth_1.authenticate, repairController_1.setAvailability);
router.get('/admin/statistics', auth_1.optionalAuth, repairController_1.getStatistics);
exports.default = router;
//# sourceMappingURL=repairs.js.map