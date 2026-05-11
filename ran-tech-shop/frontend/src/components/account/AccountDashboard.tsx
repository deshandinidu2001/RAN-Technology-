import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useOrdersStore } from '../../store/ordersStore';

const REPAIR_STAGES = ['Received', 'Diagnosing', 'Waiting for Parts', 'Repairing', 'Ready for Pickup'];

const ORDER_STATUS_CONFIG = {
  processing: { label: 'Processing', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  shipped: { label: 'Shipped', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  delivered: { label: 'Delivered', color: 'text-green-400', bg: 'bg-green-400/10' },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-400/10' },
};

// ============================================
// MAIN COMPONENT
// ============================================
type TabType = 'orders' | 'bookings';

const AccountDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { orders: storeOrders, bookings: storeBookings } = useOrdersStore();

  // Filter orders and bookings to only show current user's data
  const userOrders = storeOrders.filter(order => 
    order.customerEmail?.toLowerCase() === user?.email?.toLowerCase()
  );
  const userBookings = storeBookings.filter(booking => 
    booking.customerEmail?.toLowerCase() === user?.email?.toLowerCase()
  );

  const orders = userOrders;
  const bookings = userBookings;

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-2xl font-bold text-dark">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.name || 'User'}</h2>
            <p className="text-white/60">{user?.email || 'user@example.com'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="bg-dark-100/50 rounded-lg px-4 py-2">
            <span className="text-white/40">Orders</span>
            <span className="text-white font-bold ml-2">{storeOrders.length}</span>
          </div>
          <div className="bg-dark-100/50 rounded-lg px-4 py-2">
            <span className="text-white/40">Active Repairs</span>
            <span className="text-primary font-bold ml-2">{storeBookings.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-dark-100/50 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-primary text-dark'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          My Orders
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
            activeTab === 'bookings'
              ? 'bg-primary text-dark'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Repair Bookings
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-white/60">No orders yet</p>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  className="bg-dark-100/50 border border-white/10 rounded-xl overflow-hidden"
                >
                  {/* Order Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => toggleOrderExpand(order.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-dark-200 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">{order.id}</p>
                          <p className="text-white/50 text-sm">
                            {new Date(order.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_CONFIG[order.status].bg} ${ORDER_STATUS_CONFIG[order.status].color}`}>
                          {ORDER_STATUS_CONFIG[order.status].label}
                        </span>
                        <span className="text-primary font-bold">Rs. {order.total.toLocaleString()}</span>
                        <motion.svg
                          className="w-5 h-5 text-white/40"
                          animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 space-y-4">
                          {/* Order Items */}
                          <div className="space-y-3">
                            <h4 className="text-white/60 text-sm font-medium">Items</h4>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4 bg-dark-200/50 rounded-lg p-3">
                                <div className="w-14 h-14 bg-dark-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                                <div className="flex-1">
                                  <p className="text-white font-medium text-sm">{item.name}</p>
                                  <p className="text-white/50 text-xs">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-primary font-medium">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-dark-200/30 rounded-lg p-3">
                              <span className="text-white/40 text-xs uppercase tracking-wider">Shipping Address</span>
                              <p className="text-white text-sm mt-1">{order.shippingAddress}</p>
                            </div>
                            {order.trackingNumber && (
                              <div className="bg-dark-200/30 rounded-lg p-3">
                                <span className="text-white/40 text-xs uppercase tracking-wider">Tracking Number</span>
                                <p className="text-primary text-sm font-mono mt-1">{order.trackingNumber}</p>
                              </div>
                            )}
                          </div>

                          {/* Order Tracking Progress */}
                          {order.status !== 'cancelled' && (
                            <div className="bg-dark-200/30 rounded-lg p-4">
                              <h4 className="text-white/60 text-sm font-medium mb-4">Order Progress</h4>
                              <div className="relative">
                                <div className="absolute top-3 left-0 right-0 h-1 bg-dark-100 rounded-full" />
                                <motion.div
                                  className="absolute top-3 left-0 h-1 bg-gradient-to-r from-primary to-green-400 rounded-full"
                                  initial={{ width: '0%' }}
                                  animate={{
                                    width:
                                      order.status === 'processing' ? '33%' :
                                      order.status === 'shipped' ? '66%' : '100%'
                                  }}
                                  transition={{ duration: 0.8 }}
                                />
                                <div className="relative flex justify-between">
                                  {['Confirmed', 'Shipped', 'Delivered'].map((step, idx) => {
                                    const stepIndex = ['processing', 'shipped', 'delivered'].indexOf(order.status);
                                    const isCompleted = idx <= stepIndex;
                                    const isCurrent = idx === stepIndex;

                                    return (
                                      <div key={step} className="flex flex-col items-center">
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                                            isCompleted ? 'bg-green-500 text-white' : 'bg-dark-100 text-white/40'
                                          }`}
                                        >
                                          {isCompleted ? (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                          ) : (
                                            <span className="text-xs">{idx + 1}</span>
                                          )}
                                        </div>
                                        <span className={`text-xs mt-2 ${isCurrent ? 'text-primary' : 'text-white/50'}`}>
                                          {step}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <motion.div
            key="bookings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-white/60">No repair bookings yet</p>
                <a href="/repair" className="text-primary text-sm mt-2 inline-block hover:underline">
                  Book a repair →
                </a>
              </div>
            ) : (
              bookings.map((booking) => (
                <motion.div
                  key={booking.ticketId}
                  layout
                  className="bg-dark-100/50 border border-white/10 rounded-xl overflow-hidden"
                >
                  {/* Booking Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setSelectedBooking(selectedBooking === booking.ticketId ? null : booking.ticketId)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{booking.deviceModel}</p>
                            <span className="bg-primary/20 text-primary text-xs font-mono px-2 py-0.5 rounded">
                              #{booking.ticketId}
                            </span>
                          </div>
                          <p className="text-white/50 text-sm">{booking.issueDescription}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.currentStage === 4
                              ? 'bg-green-400/10 text-green-400'
                              : 'bg-blue-400/10 text-blue-400'
                          }`}>
                            {REPAIR_STAGES[booking.currentStage]}
                          </span>
                        </div>
                        <motion.svg
                          className="w-5 h-5 text-white/40"
                          animate={{ rotate: selectedBooking === booking.ticketId ? 180 : 0 }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {selectedBooking === booking.ticketId && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-white/10"
                      >
                        <div className="p-4 space-y-4">
                          {/* Booking Details */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-dark-200/30 rounded-lg p-3">
                              <span className="text-white/40 text-xs uppercase tracking-wider">Device</span>
                              <p className="text-white text-sm mt-1">{booking.deviceType}</p>
                            </div>
                            <div className="bg-dark-200/30 rounded-lg p-3">
                              <span className="text-white/40 text-xs uppercase tracking-wider">Booked On</span>
                              <p className="text-white text-sm mt-1">
                                {new Date(booking.bookedDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="bg-dark-200/30 rounded-lg p-3">
                              <span className="text-white/40 text-xs uppercase tracking-wider">Est. Completion</span>
                              <p className="text-white text-sm mt-1">
                                {new Date(booking.estimatedCompletion).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                            <div className="bg-dark-200/30 rounded-lg p-3">
                              <span className="text-white/40 text-xs uppercase tracking-wider">Technician</span>
                              <p className="text-white text-sm mt-1">{booking.technicianName}</p>
                            </div>
                          </div>

                          {/* Services */}
                          <div className="bg-dark-200/30 rounded-lg p-3">
                            <span className="text-white/40 text-xs uppercase tracking-wider">Services</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {booking.services.map((service, idx) => (
                                <span key={idx} className="bg-dark-100 text-white/70 text-xs px-3 py-1 rounded-full">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Repair Progress Tracker */}
                          <div className="bg-dark-200/30 rounded-lg p-4">
                            <h4 className="text-white/60 text-sm font-medium mb-4">Repair Progress</h4>
                            <div className="relative">
                              {/* Progress Line */}
                              <div className="absolute top-3 left-0 right-0 h-1 bg-dark-100 rounded-full" />
                              <motion.div
                                className="absolute top-3 left-0 h-1 bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(booking.currentStage / (REPAIR_STAGES.length - 1)) * 100}%` }}
                                transition={{ duration: 0.8 }}
                              />

                              {/* Steps */}
                              <div className="relative flex justify-between">
                                {REPAIR_STAGES.map((stage, idx) => {
                                  const isCompleted = idx < booking.currentStage;
                                  const isCurrent = idx === booking.currentStage;

                                  return (
                                    <div key={stage} className="flex flex-col items-center" style={{ width: '20%' }}>
                                      <motion.div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                                          isCompleted
                                            ? 'bg-green-500 text-white'
                                            : isCurrent
                                            ? 'bg-primary text-dark ring-2 ring-primary/30'
                                            : 'bg-dark-100 text-white/40'
                                        }`}
                                        animate={isCurrent ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                      >
                                        {isCompleted ? (
                                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        ) : (
                                          <span className="text-xs">{idx + 1}</span>
                                        )}
                                      </motion.div>
                                      <span className={`text-xs mt-2 text-center hidden sm:block ${
                                        isCurrent ? 'text-primary' : isCompleted ? 'text-green-400' : 'text-white/40'
                                      }`}>
                                        {stage}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Cost */}
                          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-4">
                            <span className="text-white">Estimated Cost</span>
                            <span className="text-primary font-bold text-lg">Rs. {booking.totalCost.toLocaleString()}</span>
                          </div>

                          {/* Ready Banner */}
                          {booking.currentStage === 4 && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 text-center"
                            >
                              <p className="text-green-400 font-medium">🎉 Your device is ready for pickup!</p>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}

            {/* Book New Repair CTA */}
            <motion.a
              href="/repair"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="block bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 text-center hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-primary font-medium">Book a New Repair</span>
              </div>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountDashboard;
