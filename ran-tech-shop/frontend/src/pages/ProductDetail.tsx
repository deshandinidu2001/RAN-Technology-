import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '../types';
import { useCartStore } from '../store/cartStore';
import { useFavoritesStore } from '../store/favoritesStore';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const authUser = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Auto-fill reviewer name when a logged-in customer opens the form.
  useEffect(() => {
    if (isAuthenticated && authUser?.name && !newReview.name) {
      setNewReview((r) => ({ ...r, name: authUser.name }));
    }
  }, [isAuthenticated, authUser?.name]);

  const addToCart = useCartStore((state) => state.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isFavorite = useFavoritesStore((s) => (product ? s.isFavorite(product.id) : false));

  const handleToggleFavorite = () => {
    if (!product) return;
    toggleFavorite({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      brand: (product as any).brand,
    });
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/products/${id}`);
        // API returns { product: {...} }
        setProduct(response.data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/shop');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  // Calculate average rating from reviews
  const getAverageRating = () => {
    if (!product?.reviews || product.reviews.length === 0) return 0;
    const sum = product.reviews.reduce((acc, review) => acc + review.rating, 0);
    return Math.round(sum / product.reviews.length);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Product not found</h2>
          <Link to="/shop" className="text-primary hover:underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Use product images from database, fallback to main image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  // Use specs from database — robust against string/object/non-string values.
  // Admin's dropdowns save spec:Field=Value pairs into product.specs as
  // a plain object; older rows may have it as a JSON string.
  const rawSpecs: any = product.specs ?? {};
  const specsObject: Record<string, unknown> = (() => {
    if (!rawSpecs) return {};
    if (typeof rawSpecs === 'string') {
      try { return JSON.parse(rawSpecs) || {}; } catch { return {}; }
    }
    return rawSpecs;
  })();
  const stringifyVal = (v: unknown): string => {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return JSON.stringify(v);
  };
  const specEntries = Object.entries(specsObject)
    .map(([k, v]) => [k, stringifyVal(v)] as const)
    .filter(([, v]) => v.trim().length > 0);

  // Add base specs
  const allSpecs = [
    { label: 'Brand', value: product.brand || product.name.split(' ')[0] },
    { label: 'Category', value: product.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) },
    { label: 'SKU', value: product.sku || `RAN-${product.id.substring(0, 6).toUpperCase()}` },
    { label: 'Availability', value: product.stock > 0 ? 'In Stock' : 'Out of Stock' },
    ...specEntries.map(([key, value]) => ({ label: key, value })),
  ];

  // Use features from database
  const features = product.features || [
    'Premium build quality with durable materials',
    'Latest technology for optimal performance',
    'Energy efficient design',
    'Comprehensive warranty coverage',
    '24/7 customer support',
  ];

  // Use reviews from database
  const reviews = product.reviews || [];
  const averageRating = getAverageRating();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm mb-8"
        >
          <Link to="/" className="text-white/60 hover:text-primary transition-colors">
            Home
          </Link>
          <span className="text-white/40">/</span>
          <Link to="/shop" className="text-white/60 hover:text-primary transition-colors">
            Shop
          </Link>
          <span className="text-white/40">/</span>
          <Link 
            to={`/shop?category=${product.category}`} 
            className="text-white/60 hover:text-primary transition-colors capitalize"
          >
            {product.category.replace('-', ' ')}
          </Link>
          <span className="text-white/40">/</span>
          <span className="text-primary">{product.name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-dark-200 rounded-2xl overflow-hidden border border-white/10">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.featured && (
                <span className="absolute top-4 left-4 px-4 py-2 bg-primary text-dark text-sm font-bold rounded-full">
                  Featured
                </span>
              )}
              {product.stock < 10 && product.stock > 0 && (
                <span className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full">
                  Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-4">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary shadow-lg shadow-primary/30'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category */}
            <p className="text-primary text-sm font-semibold uppercase tracking-wider">
              {product.category.replace('-', ' ')}
            </p>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {product.name}
            </h1>

            {/* Rating from database reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= averageRating ? 'text-primary' : 'text-white/20'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-white/60 text-sm">
                ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-primary">
                Rs. {product.price.toLocaleString()}
              </span>
              {product.stock > 0 ? (
                <span className="text-green-400 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-400">Out of Stock</span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-white/70 text-lg leading-relaxed">
              {product.description}
            </p>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <label className="text-white font-medium">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-dark-200 rounded-xl border border-white/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-colors rounded-l-xl"
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
                    className="w-12 h-12 flex items-center justify-center hover:bg-white/5 transition-colors rounded-r-xl"
                    disabled={quantity >= product.stock}
                  >
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 px-8 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                    product.stock === 0
                      ? 'bg-gray-500/50 text-gray-400 cursor-not-allowed'
                      : 'bg-primary text-dark hover:bg-primary-400 hover:shadow-lg hover:shadow-primary/30'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart - Rs. {(product.price * quantity).toLocaleString()}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleFavorite}
                  aria-pressed={isFavorite}
                  className={`w-14 h-14 rounded-xl border flex items-center justify-center transition-colors ${
                    isFavorite
                      ? 'bg-red-500/15 border-red-500/40 hover:bg-red-500/25'
                      : 'bg-dark-200 border-white/10 hover:bg-white/5'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <svg
                    className={`w-6 h-6 ${isFavorite ? 'text-red-400' : 'text-white'}`}
                    fill={isFavorite ? 'currentColor' : 'none'}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">In-store Pickup</p>
                  <p className="text-white/50 text-sm">Reserve online, collect at our Bibile shop</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">2 Year Warranty</p>
                  <p className="text-white/50 text-sm">Full coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">Easy Returns</p>
                  <p className="text-white/50 text-sm">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">24/7 Support</p>
                  <p className="text-white/50 text-sm">Dedicated help</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16"
        >
          {/* Tab Headers */}
          <div className="flex gap-1 border-b border-white/10">
            {(['description', 'specs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-lg font-medium transition-all relative ${
                  activeTab === tab ? 'text-primary' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'description' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-invert max-w-none"
              >
                <h3 className="text-2xl font-bold text-white mb-4">Product Description</h3>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  {product.description}
                </p>
                <p className="text-white/70 leading-relaxed mb-6">
                  Experience premium quality with the {product.name}. Designed for tech enthusiasts who demand the best, 
                  this product combines cutting-edge technology with exceptional build quality. Whether you're a professional 
                  or a casual user, you'll appreciate the attention to detail and performance that this product delivers.
                </p>
                <h4 className="text-xl font-bold text-white mb-3">Key Features</h4>
                <ul className="text-white/70 space-y-2 list-disc list-inside">
                  {features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            {activeTab === 'specs' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">Technical Specifications</h3>
                <div className="bg-dark-200 rounded-2xl border border-white/10 overflow-hidden">
                  {allSpecs.map((spec, index) => (
                    <div
                      key={spec.label}
                      className={`flex items-center justify-between px-6 py-4 ${
                        index !== allSpecs.length - 1 ? 'border-b border-white/10' : ''
                      } ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                    >
                      <span className="text-white/60 font-medium">{spec.label}</span>
                      <span className="text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-2xl font-bold text-white mb-6">
                  Customer Reviews ({reviews.length})
                </h3>
                {!showReviewForm && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowReviewForm(true)}
                    className="mb-8 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-dark font-semibold rounded-lg"
                  >
                    Write a Review
                  </motion.button>
                )}

                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-200/50 border border-white/10 rounded-2xl p-8 mb-8 space-y-4"
                  >
                    <h4 className="text-xl font-bold text-white">Share Your Experience</h4>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary"
                    />
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                      <option value="4">⭐⭐⭐⭐ - Good</option>
                      <option value="3">⭐⭐⭐ - Average</option>
                      <option value="2">⭐⭐ - Poor</option>
                      <option value="1">⭐ - Very Poor</option>
                    </select>
                    <textarea
                      placeholder="Share your experience with this product..."
                      value={newReview.text}
                      onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-dark-200 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary resize-none"
                    />
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          if (newReview.name.trim() && newReview.text.trim()) {
                            try {
                              const res = await api.post(`/products/${product.id}/reviews`, {
                                userName: newReview.name,
                                rating: newReview.rating,
                                comment: newReview.text
                              });
                              setProduct(prev => prev ? {...prev, reviews: [res.data.review, ...(prev.reviews || [])]} : prev);
                              setShowReviewForm(false);
                              setNewReview({ name: '', rating: 5, text: '' });
                            } catch (error) {
                              console.error('Failed to post review:', error);
                              alert('Failed to post review. Please try again.');
                            }
                          }
                        }}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-dark font-bold rounded-lg"
                      >
                        Post Review
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowReviewForm(false)}
                        className="flex-1 px-6 py-3 border-2 border-white/20 text-white font-bold rounded-lg hover:border-primary/60"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-dark-200 rounded-2xl border border-white/10 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                              <span className="text-primary font-bold">{review.userName[0]}</span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{review.userName}</p>
                              <p className="text-white/50 text-sm">{formatDate(review.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? 'text-primary' : 'text-white/20'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-white/70">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-dark-200 rounded-2xl border border-white/10 p-8 text-center">
                    <p className="text-white/50">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
