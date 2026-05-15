import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import Button from '../ui/Button';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = React.useState(1);
  const addToCart = useCartStore((state) => state.addItem);

  React.useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container - Centered with flexbox */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl max-h-[90vh] bg-dark-200 rounded-2xl overflow-hidden shadow-2xl border border-white/10 pointer-events-auto"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col md:flex-row h-full md:h-auto max-h-[90vh] overflow-y-auto">
                {/* Image */}
                <div className="relative w-full md:w-1/2 h-64 md:h-auto md:min-h-[500px]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-200 via-transparent to-transparent md:bg-gradient-to-r" />
                
                  {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.featured && (
                    <span className="px-3 py-1 bg-primary text-dark text-sm font-bold rounded-full">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 md:p-8 flex flex-col">
                {/* Category */}
                <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">
                  {product.category.replace('-', ' ')}
                </p>

                {/* Name */}
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {product.name}
                </h2>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-3xl md:text-4xl font-bold text-primary">
                    Rs. {product.price.toLocaleString()}
                  </span>
                  {product.stock > 0 ? (
                    <span className="text-sm text-green-400">
                      ✓ In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="text-sm text-red-400">Out of Stock</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-white/60 mb-8 flex-1">
                  {product.description}
                </p>

                {/* Quantity selector */}
                <div className="mb-6">
                  <label className="text-sm text-white/70 mb-2 block">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-dark-100 rounded-lg flex items-center justify-center hover:bg-dark-50 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-16 text-center text-xl font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 bg-dark-100 rounded-lg flex items-center justify-center hover:bg-dark-50 transition-colors"
                      disabled={quantity >= product.stock}
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between py-4 border-t border-white/10 mb-6">
                  <span className="text-white/70">Total</span>
                  <span className="text-2xl font-bold text-white">
                    Rs. {(product.price * quantity).toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    }
                  >
                    Add to Cart
                  </Button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 bg-dark-100 rounded-lg flex items-center justify-center hover:bg-dark-50 transition-colors flex-shrink-0"
                    title="Add to wishlist"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </motion.button>
                </div>

                {/* Features */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">In-store Pickup</p>
                        <p className="text-xs text-white/50">Reserve online, collect at our shop</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">Warranty</p>
                        <p className="text-xs text-white/50">1 year manufacturer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;
