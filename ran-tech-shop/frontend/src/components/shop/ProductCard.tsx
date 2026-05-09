import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { useFavoritesStore } from '../../store/favoritesStore';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const addToCart = useCartStore((state) => state.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => s.isFavorite(product.id));
  const navigate = useNavigate();

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      brand: (product as any).brand,
    });
  };

  // 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.3,
      ease: 'power2.out',
    });

    // Move image slightly for parallax effect
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        x: (centerX - x) / 15,
        y: (centerY - y) / 15,
        duration: 0.3,
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;

    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out',
    });

    if (imageRef.current) {
      gsap.to(imageRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);

    // Add to cart animation
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div
        ref={cardRef}
        onClick={handleCardClick}
        className="group relative bg-dark-200 rounded-2xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-300 perspective cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image container */}
        <div className="relative h-64 overflow-hidden">
          <img
            ref={imageRef}
            src={product.image}
            alt={product.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://placehold.co/800x600/1a1b1e/f7b500?text=${encodeURIComponent(product.category.replace('-', ' ').toUpperCase())}`;
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-200 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.featured && (
              <span className="px-3 py-1 bg-primary text-dark text-xs font-bold rounded-full">
                Featured
              </span>
            )}
            {product.stock < 10 && product.stock > 0 && (
              <span className="px-3 py-1 bg-red-500/80 text-white text-xs font-bold rounded-full">
                Low Stock
              </span>
            )}
            {product.stock === 0 && (
              <span className="px-3 py-1 bg-gray-500/80 text-white text-xs font-bold rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleQuickView}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              title="Quick view"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleFavorite}
              className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors ${
                isFavorite ? 'bg-red-500/30 hover:bg-red-500/40' : 'bg-white/10 hover:bg-white/20'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              aria-pressed={isFavorite}
            >
              <svg
                className={`w-5 h-5 ${isFavorite ? 'text-red-400' : 'text-white'}`}
                fill={isFavorite ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          <p className="text-primary text-xs font-semibold uppercase tracking-wider mb-2">
            {product.category.replace('-', ' ')}
          </p>

          {/* Name */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-white/50 text-sm line-clamp-2 mb-4">
            {product.description}
          </p>

          {/* Price and Add to Cart */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-white">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.stock > 0 && (
                <p className="text-xs text-white/40 mt-1">
                  {product.stock} in stock
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                product.stock === 0
                  ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-dark hover:bg-primary-400 hover:shadow-glow'
              }`}
            >
              {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </motion.button>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
