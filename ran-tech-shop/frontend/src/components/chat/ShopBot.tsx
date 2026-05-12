import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrdersStore, RepairBooking, Order } from '../../store/ordersStore';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';

type MessageType = 'bot' | 'user';
type ChatState = 'menu' | 'orders' | 'repairs' | 'products' | 'order-detail' | 'repair-detail' | 'about';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface Message {
  id: number;
  type: MessageType;
  text: string;
  options?: { label: string; action: string; data?: any }[];
  repairs?: RepairBooking[];
  orders?: Order[];
  products?: Product[];
  orderDetail?: Order;
  repairDetail?: RepairBooking;
}

const WHATSAPP_NUMBER = '94771234567';
const SHOP_NAME = 'RAN Tech Shop';

const repairStages = ['Received', 'Diagnosing', 'Waiting for Parts', 'Repairing', 'Ready for Pickup'];
const orderStatuses: Record<string, string> = {
  'processing': '📦 Processing',
  'shipped': '🚚 Shipped',
  'delivered': '✅ Delivered',
  'cancelled': '❌ Cancelled',
};

const ShopBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setChatState] = useState<ChatState>('menu');
  const [isTyping, setIsTyping] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect to stores
  const { bookings: allBookings, orders: allOrders } = useOrdersStore();
  const { user, isAuthenticated } = useAuthStore();

  // Filter to only show current user's data
  const bookings = allBookings.filter(b => 
    b.customerEmail?.toLowerCase() === user?.email?.toLowerCase()
  );
  const orders = allOrders.filter(o => 
    o.customerEmail?.toLowerCase() === user?.email?.toLowerCase()
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        if (response.data?.products) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  // Initialize chat when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = isAuthenticated && user?.name 
        ? `Welcome back, ${user.name}!` 
        : `Welcome to ${SHOP_NAME}!`;
      
      addBotMessage(`${greeting}\n\nHow can I help you today?`, [
        { label: 'My Orders', action: 'orders' },
        { label: 'My Repairs', action: 'repairs' },
        { label: 'About Us', action: 'about' },
        { label: 'Talk to Human (WhatsApp)', action: 'whatsapp' },
      ]);
    }
  }, [isOpen, isAuthenticated, user]);

  const addBotMessage = (
    text: string, 
    options?: { label: string; action: string; data?: any }[],
    extras?: {
      repairs?: RepairBooking[];
      orders?: Order[];
      products?: Product[];
      orderDetail?: Order;
      repairDetail?: RepairBooking;
    }
  ) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        type: 'bot',
        text,
        options,
        ...extras,
      }]);
      setIsTyping(false);
    }, 500);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      text,
    }]);
  };

  const handleOptionClick = (action: string, data?: any) => {
    switch (action) {
      case 'orders':
        addUserMessage('My Orders');
        setChatState('orders');
        setTimeout(() => {
          if (!isAuthenticated) {
            addBotMessage('Please sign in to view your orders.', [
              { label: '⬅️ Back to Menu', action: 'back-menu' },
            ]);
          } else if (orders.length === 0) {
            addBotMessage('You don\'t have any orders yet.\n\nVisit our shop to place your first order! 🛒', [
              { label: '⬅️ Back to Menu', action: 'back-menu' },
            ]);
          } else {
            addBotMessage(
              `📦 You have ${orders.length} order${orders.length > 1 ? 's' : ''}:\n\nClick on an order to see details.`,
              [
                ...orders.map(order => ({
                  label: `Order ${order.id} - Rs. ${order.total.toLocaleString()}`,
                  action: 'order-detail',
                  data: order,
                })),
                { label: '⬅️ Back to Menu', action: 'back-menu' },
              ]
            );
          }
        }, 300);
        break;

      case 'order-detail':
        if (data) {
          addUserMessage(`Order ${data.id}`);
          setChatState('order-detail');
          setTimeout(() => {
            addBotMessage(
              `📦 Order Details`,
              [
                { label: 'View All Orders', action: 'orders' },
                { label: '⬅️ Back to Menu', action: 'back-menu' },
              ],
              { orderDetail: data }
            );
          }, 300);
        }
        break;

      case 'repairs':
        addUserMessage('My Repairs');
        setChatState('repairs');
        setTimeout(() => {
          if (!isAuthenticated) {
            addBotMessage('Please sign in to view your repair bookings.', [
              { label: '⬅️ Back to Menu', action: 'back-menu' },
            ]);
          } else if (bookings.length === 0) {
            addBotMessage('You don\'t have any repair bookings yet.\n\nBook a repair service today! 🔧', [
              { label: '⬅️ Back to Menu', action: 'back-menu' },
            ]);
          } else {
            addBotMessage(
              `🔧 You have ${bookings.length} repair${bookings.length > 1 ? 's' : ''}:\n\nClick on a repair to see details.`,
              [
                ...bookings.map(repair => ({
                  label: `Repair #${repair.ticketId} - ${repair.deviceType}`,
                  action: 'repair-detail',
                  data: repair,
                })),
                { label: '⬅️ Back to Menu', action: 'back-menu' },
              ]
            );
          }
        }, 300);
        break;

      case 'repair-detail':
        if (data) {
          addUserMessage(`Repair #${data.ticketId}`);
          setChatState('repair-detail');
          setTimeout(() => {
            addBotMessage(
              `🔧 Repair Details`,
              [
                { label: 'View All Repairs', action: 'repairs' },
                { label: 'Contact Support', action: 'whatsapp' },
                { label: '⬅️ Back to Menu', action: 'back-menu' },
              ],
              { repairDetail: data }
            );
          }, 300);
        }
        break;

      case 'products':
        addUserMessage('Get Price Quote');
        setChatState('products');
        setTimeout(() => {
          if (products.length === 0) {
            addBotMessage('Loading products... Please try again in a moment.', [
              { label: 'Refresh', action: 'products' },
              { label: '⬅️ Back to Menu', action: 'back-menu' },
            ]);
          } else {
            addBotMessage(
              `💰 Our Products (${products.length} items):\n\nBrowse our catalog below:`,
              [
                { label: '💬 Need Help Choosing?', action: 'whatsapp' },
                { label: '⬅️ Back to Menu', action: 'back-menu' },
              ],
              { products: products.slice(0, 10) } // Show first 10 products
            );
          }
        }, 300);
        break;

      case 'about':
        addUserMessage('About Us');
        setChatState('about');
        setTimeout(() => {
          addBotMessage(
            `🏪 About ${SHOP_NAME}\n\n` +
            `We are your trusted tech partner in Sri Lanka!\n\n` +
            `📍 Location: Colombo, Sri Lanka\n` +
            `⏰ Hours: Mon-Sat 9AM-7PM\n` +
            `📞 Phone: +94 77 123 4567\n` +
            `📧 Email: info@rantech.lk\n\n` +
            `🔧 Services:\n` +
            `• Computer & Laptop Repairs\n` +
            `• Mobile Phone Repairs\n` +
            `• Gaming Console Repairs\n` +
            `• Hardware Upgrades\n` +
            `• Data Recovery\n\n` +
            `🛒 Products:\n` +
            `• Laptops & Desktops\n` +
            `• Components & Accessories\n` +
            `• Gaming Gear\n` +
            `• Networking Equipment`,
            [
              { label: '💬 Contact Us', action: 'whatsapp' },
              { label: '⬅️ Back to Menu', action: 'back-menu' },
            ]
          );
        }, 300);
        break;

      case 'whatsapp':
        addUserMessage('Talk to Human');
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hi, I need help with my device`, '_blank');
        setTimeout(() => {
          addBotMessage('Opening WhatsApp... 📱\n\nIs there anything else I can help you with?', [
            { label: '📦 My Orders', action: 'orders' },
            { label: '🔧 My Repairs', action: 'repairs' },
            { label: '⬅️ Back to Menu', action: 'back-menu' },
          ]);
          setChatState('menu');
        }, 300);
        break;

      case 'back-menu':
        setChatState('menu');
        addBotMessage('How else can I help you?', [
          { label: '📦 My Orders', action: 'orders' },
          { label: '🔧 My Repairs', action: 'repairs' },
          { label: 'ℹ️ About Us', action: 'about' },
          { label: '💬 Talk to Human (WhatsApp)', action: 'whatsapp' },
        ]);
        break;
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-96 max-h-[70vh] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
            style={{ maxWidth: '380px' }}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-amber-500 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">RAN Support</h3>
                <p className="text-white/80 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online • Replies instantly
                </p>
              </div>
              <button
                onClick={closeChat}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" style={{ minHeight: '300px', maxHeight: '400px', overscrollBehavior: 'contain' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    {message.type === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                        <svg className="w-4 h-4 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}

                    <div className="flex-1">
                      {/* Message Bubble */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl px-4 py-2.5 ${
                          message.type === 'user'
                            ? 'bg-primary text-dark rounded-br-md'
                            : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                      </motion.div>

                      {/* Order Detail */}
                      {message.orderDetail && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-blue-600">{message.orderDetail.id}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                              {orderStatuses[message.orderDetail.status]}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-600">📅 Date: {message.orderDetail.date}</p>
                            <p className="text-gray-600">📍 Address: {message.orderDetail.shippingAddress}</p>
                            <div className="border-t pt-2 mt-2">
                              <p className="font-medium text-gray-800 mb-2">Items:</p>
                              {message.orderDetail.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-xs text-gray-600 py-1">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold">
                              <span>Total</span>
                              <span className="text-primary">Rs. {message.orderDetail.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Repair Detail */}
                      {message.repairDetail && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-bold text-primary">#{message.repairDetail.ticketId}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              message.repairDetail.currentStage === 4 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {repairStages[message.repairDetail.currentStage]}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-gray-600">📱 Device: {message.repairDetail.deviceType} - {message.repairDetail.deviceModel}</p>
                            <p className="text-gray-600">🔧 Issue: {message.repairDetail.issueDescription}</p>
                            <p className="text-gray-600">👨‍🔧 Technician: {message.repairDetail.technicianName}</p>
                            <p className="text-gray-600">📅 Booked: {message.repairDetail.bookedDate}</p>
                            <p className="text-gray-600">⏰ Est. Completion: {message.repairDetail.estimatedCompletion}</p>
                            {message.repairDetail.services.length > 0 && (
                              <div className="border-t pt-2 mt-2">
                                <p className="font-medium text-gray-800 mb-1">Services:</p>
                                <div className="flex flex-wrap gap-1">
                                  {message.repairDetail.services.map((service, idx) => (
                                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Progress bar */}
                            <div className="pt-2">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{Math.round((message.repairDetail.currentStage / 4) * 100)}%</span>
                              </div>
                              <div className="flex gap-1">
                                {[0, 1, 2, 3, 4].map((stage) => (
                                  <div
                                    key={stage}
                                    className={`h-2 flex-1 rounded-full ${
                                      stage <= message.repairDetail!.currentStage ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold">
                              <span>Total Cost</span>
                              <span className="text-primary">Rs. {message.repairDetail.totalCost.toLocaleString()}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Products List */}
                      {message.products && message.products.length > 0 && (
                        <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                          {message.products.map((product) => (
                            <motion.div
                              key={product.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm flex gap-3"
                            >
                              <img 
                                src={product.image || '/images/placeholder.png'} 
                                alt={product.name}
                                className="w-14 h-14 object-cover rounded-lg bg-gray-100"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800 font-medium truncate">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.category}</p>
                                <p className="text-sm font-bold text-primary mt-1">
                                  Rs. {product.price.toLocaleString()}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Options */}
                      {message.options && message.type === 'bot' && (
                        <div className="mt-2 space-y-2">
                          {message.options.map((option, idx) => (
                            <motion.button
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => handleOptionClick(option.action, option.data)}
                              className="block w-full text-left px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all shadow-sm"
                            >
                              {option.label}
                            </motion.button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                      <svg className="w-4 h-4 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Powered By */}
            <div className="py-2 text-center bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-400">Powered by RAN Support</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={toggleChat}
        className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-primary to-amber-500 shadow-lg shadow-primary/30 flex items-center justify-center z-50 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 1 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.svg
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="w-6 h-6 text-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="w-6 h-6 text-dark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Notification Badge */}
        {!isOpen && (bookings.length > 0 || orders.length > 0) && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            {bookings.length + orders.length}
          </motion.span>
        )}
      </motion.button>

      {/* Tooltip (shows initially) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: 2.5 }}
            className="fixed bottom-8 right-24 bg-white rounded-lg shadow-lg px-4 py-2 z-40 hidden sm:block"
          >
            <p className="text-sm text-gray-700 whitespace-nowrap">Need help? Chat with us! 💬</p>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-white"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShopBot;
