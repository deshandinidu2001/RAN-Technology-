import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

// Default time slots
const defaultTimeSlots = [
  { id: '1', time: '09:00 AM - 10:00 AM', available: true },
  { id: '2', time: '10:00 AM - 11:00 AM', available: true },
  { id: '3', time: '11:00 AM - 12:00 PM', available: true },
  { id: '4', time: '12:00 PM - 01:00 PM', available: false },
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

    const { data: existingBookings, error: bookingsErr } = await supabase
      .from('RepairBooking')
      .select('timeSlot')
      .eq('date', date)
      .neq('status', 'cancelled');
    if (bookingsErr) throw bookingsErr;

    const bookedSlots = (existingBookings ?? []).map((b: any) => b.timeSlot);

    const { data: customAvailability } = await supabase
      .from('ShopAvailability')
      .select('slots')
      .eq('date', date)
      .maybeSingle();

    let slots = defaultTimeSlots;
    if (customAvailability) {
      try {
        slots = JSON.parse((customAvailability as any).slots);
      } catch {
        slots = defaultTimeSlots;
      }
    }

    const availableSlots = slots.map((slot) => ({
      ...slot,
      available: slot.available && !bookedSlots.includes(slot.time),
    }));

    res.json({
      date,
      slots: availableSlots,
      bookedCount: bookedSlots.length,
      availableCount: availableSlots.filter((s) => s.available).length,
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
      date, timeSlot, deviceType, issueDescription,
      customerName, customerEmail, customerPhone, totalAmount,
    } = req.body;

    if (
      !date || !timeSlot || !deviceType ||
      !customerName || !customerEmail || !customerPhone
    ) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const { data: existingBooking } = await supabase
      .from('RepairBooking')
      .select('id')
      .eq('date', date)
      .eq('timeSlot', timeSlot)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (existingBooking) {
      res.status(409).json({ error: 'This time slot is no longer available' });
      return;
    }

    const { data: booking, error } = await supabase
      .from('RepairBooking')
      .insert({
        date,
        timeSlot,
        deviceType,
        issueDescription: issueDescription || '',
        customerName,
        customerEmail,
        customerPhone,
        estimatedCost: totalAmount || null,
        status: 'pending',
      })
      .select('*')
      .single();

    if (error || !booking) throw error ?? new Error('Insert returned no row');

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
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    let query = supabase
      .from('RepairBooking')
      .select('*', { count: 'exact' })
      .order('date', { ascending: true })
      .order('timeSlot', { ascending: true })
      .range(from, to);

    if (status && typeof status === 'string') query = query.eq('status', status);
    if (date && typeof date === 'string') query = query.eq('date', date);

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    res.json({
      bookings: data ?? [],
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
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
    const { data: booking, error } = await supabase
      .from('RepairBooking')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
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

// Get bookings by email or phone (for customers — used by the status tracker)
export const getBookingsByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone } = req.query;
    let query = supabase
      .from('RepairBooking')
      .select('*')
      .order('createdAt', { ascending: false });

    if (email && typeof email === 'string') {
      query = query.eq('customerEmail', email);
    } else if (phone && typeof phone === 'string') {
      query = query.eq('customerPhone', phone);
    } else {
      res.status(400).json({ error: 'Email or phone is required' });
      return;
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ bookings: data ?? [] });
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

    const validStatuses = ['pending', 'confirmed', 'in-progress', 'ready-for-pickup', 'completed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (estimatedCost !== undefined) updates.estimatedCost = estimatedCost;
    if (actualCost !== undefined) updates.actualCost = actualCost;
    if (status === 'completed') updates.completedAt = new Date().toISOString();

    const { data: booking, error } = await supabase
      .from('RepairBooking')
      .update(updates)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    res.json({ success: true, message: 'Booking updated successfully', booking });
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

    const { data: booking, error: fetchError } = await supabase
      .from('RepairBooking')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (email && (booking as any).customerEmail !== email) {
      res.status(403).json({ error: 'Unauthorized to cancel this booking' });
      return;
    }

    if (['completed', 'cancelled'].includes((booking as any).status)) {
      res.status(400).json({ error: 'This booking cannot be cancelled' });
      return;
    }

    const { data: updatedBooking, error: updateError } = await supabase
      .from('RepairBooking')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) throw updateError;

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

// Hard-delete a booking (admin)
export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('RepairBooking').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
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

    const { data, error } = await supabase
      .from('ShopAvailability')
      .upsert({ date, slots: JSON.stringify(slots) }, { onConflict: 'date' })
      .select('*')
      .single();

    if (error) throw error;
    res.json({
      success: true,
      message: 'Availability updated successfully',
      availability: data,
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

    const countQuery = (filter?: (q: any) => any) => {
      let q = supabase.from('RepairBooking').select('id', { count: 'exact', head: true });
      if (filter) q = filter(q);
      return q;
    };

    const [
      { count: totalBookings },
      { count: pendingBookings },
      { count: completedBookings },
      { count: todayBookings },
      { data: recentBookings },
    ] = await Promise.all([
      countQuery(),
      countQuery((q) => q.eq('status', 'pending')),
      countQuery((q) => q.eq('status', 'completed')),
      countQuery((q) => q.eq('date', today)),
      supabase
        .from('RepairBooking')
        .select('*')
        .order('createdAt', { ascending: false })
        .limit(5),
    ]);

    res.json({
      statistics: {
        totalBookings: totalBookings ?? 0,
        pendingBookings: pendingBookings ?? 0,
        completedBookings: completedBookings ?? 0,
        todayBookings: todayBookings ?? 0,
      },
      recentBookings: recentBookings ?? [],
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

    let reviewsQuery = supabase
      .from('RepairReview')
      .select('*')
      .order('createdAt', { ascending: false })
      .limit(parseInt(limit as string, 10));
    if (serviceType && typeof serviceType === 'string') {
      reviewsQuery = reviewsQuery.eq('serviceType', serviceType);
    }
    if (serviceName && typeof serviceName === 'string') {
      reviewsQuery = reviewsQuery.eq('serviceName', serviceName);
    }

    const { data: reviews, error: reviewsErr } = await reviewsQuery;
    if (reviewsErr) throw reviewsErr;

    const { data: allReviews, error: allErr } = await supabase
      .from('RepairReview')
      .select('serviceType, serviceName, rating');
    if (allErr) throw allErr;

    const ratingsByService: Record<string, { total: number; count: number }> = {};
    (allReviews ?? []).forEach((review: any) => {
      const key = review.serviceName;
      if (!ratingsByService[key]) ratingsByService[key] = { total: 0, count: 0 };
      ratingsByService[key].total += review.rating;
      ratingsByService[key].count += 1;
    });

    const averageRatings = Object.entries(ratingsByService).map(([name, data]) => ({
      serviceName: name,
      averageRating: Math.round((data.total / data.count) * 10) / 10,
      reviewCount: data.count,
    }));

    res.json({
      reviews: reviews ?? [],
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

    const { data: review, error } = await supabase
      .from('RepairReview')
      .insert({ serviceType, serviceName, userName, rating, comment })
      .select('*')
      .single();
    if (error || !review) throw error ?? new Error('Insert returned no row');

    res.status(201).json({ success: true, review });
  } catch (error) {
    console.error('Error creating repair review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
};

// Get repair services from products (items that are services)
export const getRepairServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceType } = req.query;

    let query = supabase
      .from('Product')
      .select('*')
      .eq('isService', true)
      .order('name', { ascending: true });

    if (serviceType && typeof serviceType === 'string') {
      query = query.eq('serviceType', serviceType);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json({ services: data ?? [] });
  } catch (error) {
    console.error('Error getting repair services:', error);
    res.status(500).json({ error: 'Failed to get repair services' });
  }
};
