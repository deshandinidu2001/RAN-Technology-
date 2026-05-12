import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import CheckoutForm from '../components/payment/CheckoutForm';
import PaymentUI from '../components/payment/PaymentUI';
import Button from '../components/ui/Button';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useOrdersStore } from '../store/ordersStore';
import EmailQuoteButton from '../components/ui/EmailQuoteButton';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

const Checkout: React.FC = () => {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState('');
  const navigate = useNavigate();

  const { items, total, clearCart, updateQuantity, removeItem } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const { addOrder } = useOrdersStore();

  const shipping = 0; // Free shipping
  const tax = total * 0.08; // 8% tax
  const grandTotal = total + shipping + tax;

  const handleShippingSubmit = (shippingInfo: { address: string; city: string; state: string; zip: string }) => {
    const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zip}`;
    setShippingAddress(fullAddress);
    setStep('payment');
  };

  const handlePaymentComplete = async () => {
    setIsProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Save order to store
    const newOrderId = addOrder({
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
      total: grandTotal,
      shippingAddress: shippingAddress || 'Address not provided',
      customerName: user?.name || 'Customer',
      customerEmail: user?.email || '',
      customerPhone: '',
    });

    setOrderId(newOrderId);
    clearCart();
    setStep('confirmation');
    setIsProcessing(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 bg-[#0A0A0B]">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Please Sign In</h1>
            <p className="text-white/60 mb-8">
              You need to be logged in to proceed with checkout.
            </p>
            <Link to="/login" state={{ from: { pathname: '/checkout' } }}>
              <Button variant="primary" size="lg">
                Sign In to Continue
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step !== 'confirmation') {
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
              Add some products to your cart before checking out.
            </p>
            <Link to="/shop">
              <Button variant="primary" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#0A0A0B]">
      <div className="container mx-auto px-4">
        {/* Progress bar */}
        {step !== 'confirmation' && (
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {['cart', 'shipping', 'payment'].map((s, index) => (
                <React.Fragment key={s}>
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                        step === s || index < ['cart', 'shipping', 'payment'].indexOf(step)
                          ? 'bg-primary text-dark'
                          : 'bg-dark-200 text-white/40'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`ml-3 hidden sm:block transition-colors ${
                        step === s ? 'text-white' : 'text-white/40'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </span>
                  </div>
                  {index < 2 && (
                    <div
                      className={`flex-1 h-px mx-4 transition-colors ${
                        index < ['cart', 'shipping', 'payment'].indexOf(step)
                          ? 'bg-primary'
                          : 'bg-white/10'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        <div
          className={
            step === 'confirmation'
              ? 'flex justify-center'
              : 'grid grid-cols-1 lg:grid-cols-3 gap-8'
          }
        >
          {/* Main content */}
          <div
            className={
              step === 'confirmation' ? 'w-full max-w-2xl' : 'lg:col-span-2'
            }
          >
            <AnimatePresence mode="wait">
              {step === 'cart' && (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-primary text-dark rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    Your Cart
                  </h2>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
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
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 bg-dark-200 rounded flex items-center justify-center text-white/60 hover:text-white transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-white/40 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => setStep('shipping')}
                    >
                      Continue to Shipping
                    </Button>
                    <div className="flex justify-center">
                      <EmailQuoteButton
                        type="cart"
                        items={items.map((it) => ({ name: it.name, quantity: it.quantity, price: it.price }))}
                        subtotal={total}
                        tax={tax}
                        total={grandTotal}
                        defaultEmail={user?.email || ''}
                        defaultName={user?.name || ''}
                        label="Email me a price quote"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <CheckoutForm onSubmit={handleShippingSubmit} />
                  <button
                    onClick={() => setStep('cart')}
                    className="mt-4 text-white/60 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Cart
                  </button>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
                >
                  <PaymentUI
                    total={grandTotal}
                    onPaymentComplete={handlePaymentComplete}
                    isProcessing={isProcessing}
                  />
                  <button
                    onClick={() => setStep('shipping')}
                    className="mt-4 text-white/60 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Shipping
                  </button>
                </motion.div>
              )}

              {step === 'confirmation' && (
                <motion.div
                  key="confirmation"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 text-center mx-auto"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-4">Order Confirmed!</h2>
                  <p className="text-white/60 mb-2">Thank you for your purchase.</p>
                  <p className="text-white/60 mb-8">
                    Order ID: <span className="text-primary font-mono">{orderId}</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="primary"
                      onClick={() => navigate('/shop')}
                    >
                      Continue Shopping
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => navigate('/profile')}
                    >
                      View My Orders
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          {step !== 'confirmation' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-dark-200/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-24">
                <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{item.name}</p>
                        <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-white font-medium">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Shipping</span>
                    <span className="text-green-500">Free</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Tax (8%)</span>
                    <span>Rs. {tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-lg pt-3 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-primary">Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2 text-primary text-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Secure checkout powered by Stripe</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
