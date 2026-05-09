import { Request, Response } from 'express';
import { prisma } from '../server';

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
export const getAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    // Get existing bookings for the date
    const existingBookings = await prisma.repairBooking.findMany({
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
    const customAvailability = await prisma.shopAvailability.findUnique({
      where: { date: date },
    });

    let slots = defaultTimeSlots;

    if (customAvailability) {
      try {
        slots = JSON.parse(customAvailability.slots);
      } catch {
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
  } catch (error) {
    console.error('Error getting availability:', error);
    res.status(500).json({ error: 'Failed to get availability' });
  }
};

// Create a new repair booking
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      date,
      timeSlot,
      deviceType,
      issueDescription,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    // Validate required fields
    if (!date || !timeSlot || !deviceType || !issueDescription || !customerName || !customerEmail || !customerPhone) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if slot is still available
    const existingBooking = await prisma.repairBooking.findFirst({
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
    const booking = await prisma.repairBooking.create({
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
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Get all bookings (admin)
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, date, page = '1', limit = '10' } = req.query;

    const where: any = {};
    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (date && typeof date === 'string') {
      where.date = date;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [bookings, total] = await Promise.all([
      prisma.repairBooking.findMany({
        where,
        orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
        skip,
        take,
      }),
      prisma.repairBooking.count({ where }),
    ]);

    res.json({
      bookings,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

// Get booking by ID
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.repairBooking.findUnique({
      where: { id },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json({ booking });
  } catch (error) {
    console.error('Error getting booking:', error);
    res.status(500).json({ error: 'Failed to get booking' });
  }
};

// Get bookings by email (for customers)
export const getBookingsByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const bookings = await prisma.repairBooking.findMany({
      where: { customerEmail: email },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Error getting bookings:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

// Update booking status (admin)
export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes, estimatedCost, actualCost } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
    if (actualCost !== undefined) updateData.actualCost = actualCost;
    if (status === 'completed') updateData.completedAt = new Date();

    const booking = await prisma.repairBooking.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    const booking = await prisma.repairBooking.findUnique({
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

    const updatedBooking = await prisma.repairBooking.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

// Set shop availability for a date (admin)
export const setAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { date, slots } = req.body;

    if (!date || !slots) {
      res.status(400).json({ error: 'Date and slots are required' });
      return;
    }

    const availability = await prisma.shopAvailability.upsert({
      where: { date },
      update: { slots: JSON.stringify(slots) },
      create: { date, slots: JSON.stringify(slots) },
    });

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability,
    });
  } catch (error) {
    console.error('Error setting availability:', error);
    res.status(500).json({ error: 'Failed to set availability' });
  }
};

// Get repair statistics (admin)
export const getStatistics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalBookings,
      pendingBookings,
      completedBookings,
      todayBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.repairBooking.count(),
      prisma.repairBooking.count({ where: { status: 'pending' } }),
      prisma.repairBooking.count({ where: { status: 'completed' } }),
      prisma.repairBooking.count({ where: { date: today } }),
      prisma.repairBooking.findMany({
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
  } catch (error) {
    console.error('Error getting statistics:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
};

// Get repair service reviews
export const getRepairReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceType, serviceName, limit = '10' } = req.query;

    const where: any = {};
    if (serviceType && typeof serviceType === 'string') {
      where.serviceType = serviceType;
    }
    if (serviceName && typeof serviceName === 'string') {
      where.serviceName = serviceName;
    }

    const reviews = await prisma.repairReview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string, 10),
    });

    // Get average ratings by service type
    const allReviews = await prisma.repairReview.findMany({
      select: {
        serviceType: true,
        serviceName: true,
        rating: true,
      },
    });

    const ratingsByService: Record<string, { total: number; count: number }> = {};
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
  } catch (error) {
    console.error('Error getting repair reviews:', error);
    res.status(500).json({ error: 'Failed to get repair reviews' });
  }
};

// Create repair service review
export const createRepairReview = async (req: Request, res: Response): Promise<void> => {
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

    const review = await prisma.repairReview.create({
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
  } catch (error) {
    console.error('Error creating repair review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get repair services from products (items that are services)
export const getRepairServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceType } = req.query;

    const where: any = { isService: true };
    if (serviceType && typeof serviceType === 'string') {
      where.serviceType = serviceType;
    }

    const services = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({ services });
  } catch (error) {
    console.error('Error getting repair services:', error);
    res.status(500).json({ error: 'Failed to get repair services' });
  }
};
