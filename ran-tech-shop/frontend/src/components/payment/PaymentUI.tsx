import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

interface PaymentUIProps {
  total: number;
  onPaymentComplete: () => void;
  isProcessing?: boolean;
}

const PaymentUI: React.FC<PaymentUIProps> = ({
  total,
  onPaymentComplete,
  isProcessing,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'apple'>('card');
  const [errors, setErrors] = useState<{
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
    cardName?: string;
  }>({});

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').substr(0, 19) : '';
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiry(formatExpiry(e.target.value));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvc(e.target.value.replace(/\D/g, '').substr(0, 4));
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }

    if (!expiry || expiry.length < 5) {
      newErrors.expiry = 'Please enter a valid expiry date';
    }

    if (!cvc || cvc.length < 3) {
      newErrors.cvc = 'Please enter a valid CVC';
    }

    if (!cardName) {
      newErrors.cardName = 'Please enter the name on card';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onPaymentComplete();
    }
  };

  // Detect card type
  const getCardType = () => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    return null;
  };

  const cardType = getCardType();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <span className="w-8 h-8 bg-primary text-dark rounded-full flex items-center justify-center text-sm font-bold">
          2
        </span>
        Payment Method
      </h2>

      {/* Payment method selection */}
      <div className="grid grid-cols-3 gap-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPaymentMethod('card')}
          className={`p-4 rounded-xl border-2 transition-all ${
            paymentMethod === 'card'
              ? 'border-primary bg-primary/10'
              : 'border-white/10 bg-dark-200 hover:border-white/20'
          }`}
        >
          <svg className="w-8 h-8 mx-auto mb-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-sm text-white/80">Card</span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPaymentMethod('paypal')}
          className={`p-4 rounded-xl border-2 transition-all ${
            paymentMethod === 'paypal'
              ? 'border-primary bg-primary/10'
              : 'border-white/10 bg-dark-200 hover:border-white/20'
          }`}
        >
          <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24">
            <path fill="#00457C" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.783.783 0 0 1 .771-.667h6.412c2.126 0 3.858.558 4.79 1.565.854.924 1.185 2.163.995 3.704l-.013.098v.699l.544.308c.463.249.827.527 1.095.84.548.636.85 1.476.85 2.474 0 .962-.22 1.875-.654 2.684-.397.737-.946 1.352-1.629 1.831-.648.454-1.405.788-2.252.997-.814.201-1.716.303-2.677.303H12.34a.963.963 0 0 0-.949.815l-.041.209-.692 4.328-.03.158a.963.963 0 0 1-.949.815H7.076z" />
            <path fill="#0079C1" d="M18.556 7.705l-.066.421c-.86 4.422-3.828 5.951-7.614 5.951H8.934a.937.937 0 0 0-.925.795l-.99 6.27-.28 1.779a.494.494 0 0 0 .487.573h3.42a.82.82 0 0 0 .809-.693l.033-.172.641-4.065.041-.223a.82.82 0 0 1 .809-.693h.51c3.3 0 5.882-1.34 6.637-5.217.316-1.62.152-2.97-.683-3.92a3.258 3.258 0 0 0-.887-.806z" />
          </svg>
          <span className="text-sm text-white/80">PayPal</span>
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPaymentMethod('apple')}
          className={`p-4 rounded-xl border-2 transition-all ${
            paymentMethod === 'apple'
              ? 'border-primary bg-primary/10'
              : 'border-white/10 bg-dark-200 hover:border-white/20'
          }`}
        >
          <svg className="w-8 h-8 mx-auto mb-2 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.27 2.33-2.01 4.44-3.74 4.25z" />
          </svg>
          <span className="text-sm text-white/80">Apple Pay</span>
        </motion.button>
      </div>

      {/* Card form */}
      {paymentMethod === 'card' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card preview */}
          <div className="relative w-full aspect-[1.6/1] max-w-sm mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-dark-100 to-dark-300 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <p className="text-white/40 text-xs">Card Number</p>
                  <p className="text-white font-mono tracking-wider">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </p>
                </div>
                {cardType && (
                  <img
                    src={`https://img.icons8.com/color/48/${cardType}.png`}
                    alt={cardType}
                    className="w-12 h-auto"
                  />
                )}
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-white/40 text-xs">Card Holder</p>
                  <p className="text-white text-sm uppercase tracking-wide">
                    {cardName || 'YOUR NAME'}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-white/40 text-xs">Expires</p>
                  <p className="text-white font-mono">{expiry || 'MM/YY'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card inputs */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-white/70">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                className={`w-full px-4 py-3 bg-dark-200 border rounded-lg text-white font-mono placeholder-white/30 focus:outline-none focus:border-primary transition-colors ${
                  errors.cardNumber ? 'border-red-500' : 'border-white/10'
                }`}
                maxLength={19}
              />
              {errors.cardNumber && (
                <p className="mt-2 text-sm text-red-500">{errors.cardNumber}</p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-white/70">
                Name on Card
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                placeholder="JOHN DOE"
                className={`w-full px-4 py-3 bg-dark-200 border rounded-lg text-white uppercase placeholder-white/30 focus:outline-none focus:border-primary transition-colors ${
                  errors.cardName ? 'border-red-500' : 'border-white/10'
                }`}
              />
              {errors.cardName && (
                <p className="mt-2 text-sm text-red-500">{errors.cardName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-white/70">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  className={`w-full px-4 py-3 bg-dark-200 border rounded-lg text-white font-mono placeholder-white/30 focus:outline-none focus:border-primary transition-colors ${
                    errors.expiry ? 'border-red-500' : 'border-white/10'
                  }`}
                  maxLength={5}
                />
                {errors.expiry && (
                  <p className="mt-2 text-sm text-red-500">{errors.expiry}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white/70">
                  CVC
                </label>
                <input
                  type="text"
                  value={cvc}
                  onChange={handleCvcChange}
                  placeholder="123"
                  className={`w-full px-4 py-3 bg-dark-200 border rounded-lg text-white font-mono placeholder-white/30 focus:outline-none focus:border-primary transition-colors ${
                    errors.cvc ? 'border-red-500' : 'border-white/10'
                  }`}
                  maxLength={4}
                />
                {errors.cvc && (
                  <p className="mt-2 text-sm text-red-500">{errors.cvc}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70">Total</span>
              <span className="text-2xl font-bold text-white">
                ${total.toFixed(2)}
              </span>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isProcessing}
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            >
              Pay ${total.toFixed(2)}
            </Button>
          </div>

          {/* Security info */}
          <div className="flex items-center justify-center gap-2 text-white/40 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secured by Stripe</span>
          </div>
        </form>
      )}

      {/* PayPal */}
      {paymentMethod === 'paypal' && (
        <div className="text-center py-8">
          <p className="text-white/60 mb-6">
            You will be redirected to PayPal to complete your payment.
          </p>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onPaymentComplete}
            isLoading={isProcessing}
          >
            Continue with PayPal
          </Button>
        </div>
      )}

      {/* Apple Pay */}
      {paymentMethod === 'apple' && (
        <div className="text-center py-8">
          <p className="text-white/60 mb-6">
            Click the button below to pay with Apple Pay.
          </p>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onPaymentComplete}
            isLoading={isProcessing}
            className="bg-black hover:bg-gray-900 text-white"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.27 2.33-2.01 4.44-3.74 4.25z" />
            </svg>
            Pay with Apple Pay
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentUI;
