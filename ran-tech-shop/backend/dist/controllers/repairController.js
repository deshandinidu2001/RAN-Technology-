"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRepairServices = exports.createRepairReview = exports.getRepairReviews = exports.getStatistics = exports.setAvailability = exports.cancelBooking = exports.updateBookingStatus = exports.getBookingsByEmail = exports.getBookingById = exports.getAllBookings = exports.createBooking = exports.getAvailability = void 0;
const server_1 = require("../server");
// Default time slots
const defaultTimeSlots = [
    { id: '1', time: '09:00 AM - 10:00 AM', available: true },
    { id: '2', time: '10:00 AM - 11:00 AM', available: true },
    { id: '3', time: '11:00 AM - 12:00 PM', available: true },
    { id: '4', time: '12:00 PM - 01:00 PM', available: false }, // Lunch break
    { id: '5', time: '02:00 PM - 03:00 PM', available: true },
    { id: '6', time: '03:00 PM - 04:00 PM', available: true },
    { id: '7', time: '04:00 PM - 05:00 PM', available: true },
    { id: '8', time: '05:00 PM - 06:00 PM', available: true },
];
// Get availability for a specific date
const getAvailability = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
            res.status(400).json({ error: 'Date is required' });
            return;
        }
        // Get existing bookings for the date
        const existingBookings = await server_1.prisma.repairBooking.findMany({
            where: {
                date: date,
                status: { not: 'cancelled' },
            },
            select: {
                timeSlot: true,
            },
        });
        const bookedSlots = existingBookings.map(b => b.timeSlot);
        // Check if there's custom availability for this date
        const customAvailability = await server_1.prisma.shopAvailability.findUnique({
            where: { date: date },
        });
        let slots = defaultTimeSlots;
        if (customAvailability) {
            try {
                slots = JSON.parse(customAvailability.slots);
            }
            catch {
                slots = defaultTimeSlots;
            }
        }
        // Mark booked slots as unavailable
        const availableSlots = slots.map(slot => ({
            ...slot,
            available: slot.available && !bookedSlots.includes(slot.time),
        }));
        res.json({
            date,
            slots: availableSlots,
            bookedCount: bookedSlots.length,
            availableCount: availableSlots.filter(s => s.available).length,
        });
    }
    catch (error) {
        console.error('Error getting availability:', error);
        res.status(500).json({ error: 'Failed to get availability' });
    }
};
exports.getAvailability = getAvailability;
// Create a new repair booking
const createBooking = async (req, res) => {
    try {
        const { date, timeSlot, deviceType, issueDescription, customerName, customerEmail, customerPhone, } = req.body;
        // Validate required fields
        if (!date || !timeSlot || !deviceType || !issueDescription || !customerName || !customerEmail || !customerPhone) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        // Check if slot is still available
        const existingBooking = await server_1.prisma.repairBooking.findFirst({
            where: {
                date,
                timeSlot,
                status: { not: 'cancelled' },
            },
        });
        if (existingBooking) {
            res.status(409).json({ error: 'This time slot is no longer available' });
            return;
        }
        // Create the booking
        const booking = await server_1.prisma.repairBooking.create({
            data: {
                date,
                timeSlot,
                deviceType,
                issueDescription,
                customerName,
                customerEmail,
                customerPhone,
                status: 'pending',
            },
        });
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                id: booking.id,
                date: booking.date,
                timeSlot: booking.timeSlot,
                deviceType: booking.deviceType,
                status: booking.status,
                createdAt: booking.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
};
exports.createBooking = createBooking;
// Get all bookings (admin)
const getAllBookings = async (req, res) => {
    try {
        const { status, date, page = '1', limit = '10' } = req.query;
        const where = {};
        if (status && typeof status === 'string') {
            where.status = status;
        }
        if (date && typeof date === 'string') {
            where.date = date;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);
        const [bookings, total] = await Promise.all([
            server_1.prisma.repairBooking.findMany({
                where,
                orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
                skip,
                take,
            }),
            server_1.prisma.repairBooking.count({ where }),
        ]);
        res.json({
            bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit)),
            },
        });
    }
    catch (error) {
        console.error('Error getting bookings:', error);
        res.status(500).json({ error: 'Failed to get bookings' });
    }
};
exports.getAllBookings = getAllBookings;
// Get booking by ID
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await server_1.prisma.repairBooking.findUnique({
            where: { id },
        });
        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        res.json({ booking });
    }
    catch (error) {
        console.error('Error getting booking:', error);
        res.status(500).json({ error: 'Failed to get booking' });
    }
};
exports.getBookingById = getBookingById;
// Get bookings by email (for customers)
const getBookingsByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email || typeof email !== 'string') {
            res.status(400).json({ error: 'Email is required' });
            return;
        }
        const bookings = await server_1.prisma.repairBooking.findMany({
            where: { customerEmail: email },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ bookings });
    }
    catch (error) {
        console.error('Error getting bookings:', error);
        res.status(500).json({ error: 'Failed to get bookings' });
    }
};
exports.getBookingsByEmail = getBookingsByEmail;
// Update booking status (admin)
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, estimatedCost, actualCost } = req.body;
        const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
        if (status && !validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        const updateData = {};
        if (status)
            updateData.status = status;
        if (notes !== undefined)
            updateData.notes = notes;
        if (estimatedCost !== undefined)
            updateData.estimatedCost = estimatedCost;
        if (actualCost !== undefined)
            updateData.actualCost = actualCost;
        if (status === 'completed')
            updateData.completedAt = new Date();
        const booking = await server_1.prisma.repairBooking.update({
            where: { id },
            data: updateData,
        });
        res.json({
            success: true,
            message: 'Booking updated successfully',
            booking,
        });
    }
    catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
};
exports.updateBookingStatus = updateBookingStatus;
// Cancel booking
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        const booking = await server_1.prisma.repairBooking.findUnique({
            where: { id },
        });
        if (!booking) {
            res.status(404).json({ error: 'Booking not found' });
            return;
        }
        // Verify email matches (for customer cancellation)
        if (email && booking.customerEmail !== email) {
            res.status(403).json({ error: 'Unauthorized to cancel this booking' });
            return;
        }
        // Check if booking can be cancelled
        if (['completed', 'cancelled'].includes(booking.status)) {
            res.status(400).json({ error: 'This booking cannot be cancelled' });
            return;
        }
        const updatedBooking = await server_1.prisma.repairBooking.update({
            where: { id },
            data: { status: 'cancelled' },
        });
        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            booking: updatedBooking,
        });
    }
    catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Failed to cancel booking' });
    }
};
exports.cancelBooking = cancelBooking;
// Set shop availability for a date (admin)
const setAvailability = async (req, res) => {
    try {
        const { date, slots } = req.body;
        if (!date || !slots) {
            res.status(400).json({ error: 'Date and slots are required' });
            return;
        }
        const availability = await server_1.prisma.shopAvailability.upsert({
            where: { date },
            update: { slots: JSON.stringify(slots) },
            create: { date, slots: JSON.stringify(slots) },
        });
        res.json({
            success: true,
            message: 'Availability updated successfully',
            availability,
        });
    }
    catch (error) {
        console.error('Error setting availability:', error);
        res.status(500).json({ error: 'Failed to set availability' });
    }
};
exports.setAvailability = setAvailability;
// Get repair statistics (admin)
const getStatistics = async (_req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [totalBookings, pendingBookings, completedBookings, todayBookings, recentBookings,] = await Promise.all([
            server_1.prisma.repairBooking.count(),
            server_1.prisma.repairBooking.count({ where: { status: 'pending' } }),
            server_1.prisma.repairBooking.count({ where: { status: 'completed' } }),
            server_1.prisma.repairBooking.count({ where: { date: today } }),
            server_1.prisma.repairBooking.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);
        res.json({
            statistics: {
                totalBookings,
                pendingBookings,
                completedBookings,
                todayBookings,
            },
            recentBookings,
        });
    }
    catch (error) {
        console.error('Error getting statistics:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
};
exports.getStatistics = getStatistics;
// Get repair service reviews
const getRepairReviews = async (req, res) => {
    try {
        const { serviceType, serviceName, limit = '10' } = req.query;
        const where = {};
        if (serviceType && typeof serviceType === 'string') {
            where.serviceType = serviceType;
        }
        if (serviceName && typeof serviceName === 'string') {
            where.serviceName = serviceName;
        }
        const reviews = await server_1.prisma.repairReview.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit, 10),
        });
        // Get average ratings by service type
        const allReviews = await server_1.prisma.repairReview.findMany({
            select: {
                serviceType: true,
                serviceName: true,
                rating: true,
            },
        });
        const ratingsByService = {};
        allReviews.forEach(review => {
            const key = review.serviceName;
            if (!ratingsByService[key]) {
                ratingsByService[key] = { total: 0, count: 0 };
            }
            ratingsByService[key].total += review.rating;
            ratingsByService[key].count += 1;
        });
        const averageRatings = Object.entries(ratingsByService).map(([name, data]) => ({
            serviceName: name,
            averageRating: Math.round((data.total / data.count) * 10) / 10,
            reviewCount: data.count,
        }));
        res.json({
            reviews,
            averageRatings,
        });
    }
    catch (error) {
        console.error('Error getting repair reviews:', error);
        res.status(500).json({ error: 'Failed to get repair reviews' });
    }
};
exports.getRepairReviews = getRepairReviews;
// Create repair service review
const createRepairReview = async (req, res) => {
    try {
        const { serviceType, serviceName, userName, rating, comment } = req.body;
        if (!serviceType || !serviceName || !userName || !rating || !comment) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        if (rating < 1 || rating > 5) {
            res.status(400).json({ error: 'Rating must be between 1 and 5' });
            return;
        }
        const review = await server_1.prisma.repairReview.create({
            data: {
                serviceType,
                serviceName,
                userName,
                rating,
                comment,
            },
        });
        res.status(201).json({
            success: true,
            review,
        });
    }
    catch (error) {
        console.error('Error creating repair review:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
};
exports.createRepairReview = createRepairReview;
// Get repair services from products (items that are services)
const getRepairServices = async (req, res) => {
    try {
        const { serviceType } = req.query;
        const where = { isService: true };
        if (serviceType && typeof serviceType === 'string') {
            where.serviceType = serviceType;
        }
        const services = await server_1.prisma.product.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        res.json({ services });
    }
    catch (error) {
        console.error('Error getting repair services:', error);
        res.status(500).json({ error: 'Failed to get repair services' });
    }
};
exports.getRepairServices = getRepairServices;
//# sourceMappingURL=repairController.js.map