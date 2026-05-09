import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onQuickView?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading,
  onQuickView,
}) => {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-dark-200 rounded-2xl overflow-hidden animate-pulse"
          >
            <div className="h-64 bg-dark-100" />
            <div className="p-5">
              <div className="h-3 bg-dark-100 rounded w-1/4 mb-3" />
              <div className="h-5 bg-dark-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-dark-100 rounded w-full mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-6 bg-dark-100 rounded w-1/4" />
                <div className="h-10 bg-dark-100 rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20"
      >
        <div className="w-24 h-24 bg-dark-200 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-white/30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
        <p className="text-white/50 text-center max-w-md">
          Try adjusting your filters or search criteria to find what you're looking for.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <AnimatePresence mode="popLayout">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ProductCard product={product} onQuickView={onQuickView} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
