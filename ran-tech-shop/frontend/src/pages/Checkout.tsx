import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import EmailQuoteButton from '../components/ui/EmailQuoteButton';

// This shop does not process online payments or delivery. The cart simply
// lets the customer compile a list of products and request a written price
// quotation by email. Customers pick the items up (and pay) in-store.
const Cart: React.FC = () => {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore();
  const { user } = useAuthStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#0A0A0B]">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Your Cart is Empty</h1>
            <p className="text-white/60 mb-8">
              Add some products to your cart, then request a price quotation.
            </p>
            <Link to="/shop">
              <Button variant="primary" size="lg">Browse Shop</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0A0A0B]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-white">Your Cart</h1>
          <p className="text-white/50 text-sm mt-2">
            Review the items you've picked, then request a written price quotation by email.
            Final purchase is completed in-store.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
            >
              <div className="space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="flex gap-4 p-4 bg-dark-100/50 rounded-xl"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-primary font-bold">Rs. {item.price.toLocaleString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 bg-dark-200 rounded flex items-center justify-center text-white/60 hover:text-white transition-colors"
                        >-</button>
                        <span className="w-8 text-center text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-dark-200 rounded flex items-center justify-center text-white/60 hover:text-white transition-colors"
                        >+</button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-white/40 hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-3 items-center justify-between">
                <button
                  onClick={() => {
                    if (confirm('Clear your cart?')) clearCart();
                  }}
                  className="text-white/40 hover:text-red-400 text-sm transition-colors"
                >
                  Clear cart
                </button>
                <Link to="/shop" className="text-white/60 hover:text-white text-sm">
                  ← Continue browsing
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Quote summary sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Quotation Summary</h3>

              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.name}</p>
                      <p className="text-white/60 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white text-sm font-medium">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6">
                <EmailQuoteButton
                  type="cart"
                  items={items.map((it) => ({ name: it.name, quantity: it.quantity, price: it.price }))}
                  subtotal={total}
                  total={total}
                  defaultEmail={user?.email || ''}
                  defaultName={user?.name || ''}
                  label="Request price quotation"
                  className="w-full"
                />
              </div>

              <p className="text-white/40 text-xs mt-4 leading-relaxed">
                We will email your quotation with the final price. Visit our shop in
                Bibile to confirm your order — we do not accept online payments or
                offer delivery.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
