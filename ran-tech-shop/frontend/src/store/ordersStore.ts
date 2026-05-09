import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================
export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  shippingAddress: string;
  trackingNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export interface RepairBooking {
  ticketId: string;
  deviceType: string;
  deviceModel: string;
  issueDescription: string;
  currentStage: number; // 0: Received, 1: Diagnosing, 2: Waiting for Parts, 3: Repairing, 4: Ready
  bookedDate: string;
  estimatedCompletion: string;
  technicianName: string;
  totalCost: number;
  services: string[];
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
}

interface OrdersState {
  orders: Order[];
  bookings: RepairBooking[];
  
  // Orders actions
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => string;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrderById: (orderId: string) => Order | undefined;
  
  // Bookings actions
  addBooking: (booking: Omit<RepairBooking, 'ticketId' | 'currentStage' | 'createdAt' | 'technicianName' | 'estimatedCompletion'>) => string;
  updateBookingStage: (ticketId: string, stage: number) => void;
  getBookingByTicketId: (ticketId: string) => RepairBooking | undefined;
  getBookingByPhone: (phone: string) => RepairBooking[];
  
  // Admin actions
  updateBookingTechnician: (ticketId: string, technicianName: string) => void;
  updateBookingEstCompletion: (ticketId: string, date: string) => void;
  updateBookingCost: (ticketId: string, cost: number) => void;
  deleteBooking: (ticketId: string) => void;
  deleteOrder: (orderId: string) => void;
  
  // Clear all
  clearAll: () => void;
}

// Generate unique IDs
const generateOrderId = () => `RAN-${Date.now().toString(36).toUpperCase()}`;
const generateTicketId = () => String(100 + Math.floor(Math.random() * 900));

// Calculate estimated completion (3-7 days from now)
const calculateEstimatedCompletion = () => {
  const date = new Date();
  date.setDate(date.getDate() + 3 + Math.floor(Math.random() * 5));
  return date.toISOString().split('T')[0];
};

// Random technician assignment
const technicians = ['Kasun Silva', 'Nimesh Jayawardena', 'Pradeep Fernando', 'Ruwan Perera'];
const assignTechnician = () => technicians[Math.floor(Math.random() * technicians.length)];

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      bookings: [],

      // Add a new order
      addOrder: (orderData) => {
        const orderId = generateOrderId();
        const newOrder: Order = {
          ...orderData,
          id: orderId,
          date: new Date().toISOString().split('T')[0],
          status: 'processing',
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));

        return orderId;
      },

      // Update order status
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          ),
        }));
      },

      // Get order by ID
      getOrderById: (orderId) => {
        return get().orders.find((order) => order.id === orderId);
      },

      // Add a new repair booking
      addBooking: (bookingData) => {
        const ticketId = generateTicketId();
        const newBooking: RepairBooking = {
          ...bookingData,
          ticketId,
          currentStage: 0, // Received
          createdAt: new Date().toISOString(),
          technicianName: assignTechnician(),
          estimatedCompletion: calculateEstimatedCompletion(),
        };

        set((state) => ({
          bookings: [newBooking, ...state.bookings],
        }));

        return ticketId;
      },

      // Update booking stage
      updateBookingStage: (ticketId, stage) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.ticketId === ticketId ? { ...booking, currentStage: stage } : booking
          ),
        }));
      },

      // Get booking by ticket ID
      getBookingByTicketId: (ticketId) => {
        return get().bookings.find((booking) => booking.ticketId === ticketId);
      },

      // Get bookings by phone number
      getBookingByPhone: (phone) => {
        const normalizedPhone = phone.replace(/\D/g, '');
        return get().bookings.filter((booking) =>
          booking.customerPhone.replace(/\D/g, '').includes(normalizedPhone)
        );
      },
      // Admin: Update technician
      updateBookingTechnician: (ticketId, technicianName) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.ticketId === ticketId ? { ...booking, technicianName } : booking
          ),
        }));
      },

      // Admin: Update estimated completion
      updateBookingEstCompletion: (ticketId, date) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.ticketId === ticketId ? { ...booking, estimatedCompletion: date } : booking
          ),
        }));
      },

      // Admin: Update cost
      updateBookingCost: (ticketId, cost) => {
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.ticketId === ticketId ? { ...booking, totalCost: cost } : booking
          ),
        }));
      },

      // Admin: Delete booking
      deleteBooking: (ticketId) => {
        set((state) => ({
          bookings: state.bookings.filter((booking) => booking.ticketId !== ticketId),
        }));
      },

      // Admin: Delete order
      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== orderId),
        }));
      },
      // Clear all data
      clearAll: () => {
        set({ orders: [], bookings: [] });
      },
    }),
    {
      name: 'ran-orders-storage',
    }
  )
);
