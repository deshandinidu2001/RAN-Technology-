import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import NotificationBell from '../ui/NotificationBell';
import api from '../../utils/api';
import type { Product } from '../../types';

// Color palette
const colors = {
  primary: '#F7B500',
  secondary: '#FF6B35',
  accent: '#7C3AED',
  highlight: '#06B6D4',
  dark: '#0A0A0B',
};

// Navigation items for Shop Section (No Repair)
const navItems = [
  { label: 'Home', path: '/home' },
  { label: 'Shop', path: '/shop' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

// RAN Shop logo asset
const ShopLogo: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src="/images/ranshop.png"
    alt="RAN Shop"
    className={className ?? 'h-8 w-auto'}
    loading="lazy"
    height={32}
  />
);

// Cart icon with count
const CartIcon: React.FC = () => {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link to="/checkout" className="relative">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full flex items-center justify-center border border-white/20 hover:border-primary/50 transition-colors"
      >
        <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-black"
            style={{ backgroundColor: colors.primary }}
          >
            {itemCount}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};

// User menu
const UserMenu: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link to="/login">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all"
          style={{
            borderColor: colors.primary,
            color: colors.primary,
          }}
        >
          Sign In
        </motion.button>
      </Link>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
        style={{ backgroundColor: colors.accent }}
      >
        {user.name?.charAt(0).toUpperCase() || 'U'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-48 rounded-xl border overflow-hidden"
            style={{
              backgroundColor: `${colors.dark}95`,
              borderColor: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="p-3 border-b border-white/10">
              <p className="text-white font-semibold truncate">{user.name}</p>
              <p className="text-white/50 text-sm truncate">{user.email}</p>
            </div>
            <div className="p-2">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </Link>
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Search Modal
const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setTotalCount(0);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get('/products', {
          params: { search: searchQuery, limit: 100 }
        });
        // Handle both array response and object with products array
        const products = Array.isArray(response.data) ? response.data : (response.data.products || []);
        setTotalCount(products.length);
        setSearchResults(products.slice(0, 5)); // Show only 5 results
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        setTotalCount(0);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleProductClick = (productId: number | string) => {
    onClose();
    setSearchQuery('');
    navigate(`/product/${productId}`);
  };

  const handleDiscoverAll = () => {
    onClose();
    navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    setSearchQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60]"
          />

          {/* Search Container */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-[60] px-4"
          >
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: `${colors.dark}95`,
                borderColor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/40"
                />
                {isSearching && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/20 border-t-primary rounded-full"
                  />
                )}
                <button
                  onClick={onClose}
                  className="text-white/50 hover:text-white text-sm"
                >
                  ESC
                </button>
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <motion.button
                          key={product.id}
                          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                          onClick={() => handleProductClick(product.id)}
                          className="w-full flex items-center gap-4 p-3 rounded-xl text-left transition-colors"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover bg-white/10"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{product.name}</p>
                            <p className="text-white/50 text-sm">{product.category}</p>
                          </div>
                          <p className="text-primary font-bold">
                            Rs. {product.price.toLocaleString()}
                          </p>
                        </motion.button>
                      ))}
                      
                      {/* Discover All Button */}
                      {totalCount > 5 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleDiscoverAll}
                          className="w-full mt-2 py-3 rounded-xl font-semibold text-black flex items-center justify-center gap-2"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <span>Discover All {totalCount} Products</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </motion.button>
                      )}
                      
                      {/* Show Discover All even for 5 or less results */}
                      {totalCount > 0 && totalCount <= 5 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleDiscoverAll}
                          className="w-full mt-2 py-3 rounded-xl font-semibold border border-primary/50 text-primary flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors"
                        >
                          <span>View in Shop</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </motion.button>
                      )}
                    </div>
                  ) : !isSearching ? (
                    <div className="p-8 text-center">
                      <p className="text-white/50">No products found for "{searchQuery}"</p>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Quick Links */}
              {!searchQuery && (
                <div className="p-4">
                  <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Popular Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {['Laptops', 'Phones', 'Accessories', 'Gaming'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSearchQuery(cat)}
                        className="px-3 py-1.5 rounded-full text-sm text-white/70 bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Mobile menu
const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void; onSearchOpen: () => void }> = ({ isOpen, onClose, onSearchOpen }) => {
  const location = useLocation();

  const handleSearchClick = () => {
    onClose();
    setTimeout(() => onSearchOpen(), 100);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Menu panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-[280px] z-50 border-l"
            style={{
              backgroundColor: colors.dark,
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/10"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <ShopLogo className="h-8 w-auto" />
            </div>

            {/* Nav items */}
            <nav className="p-4 space-y-1">
              {/* Search button */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
              >
                <button
                  onClick={handleSearchClick}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Products
                </button>
              </motion.div>

              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (index + 1) * 0.1 }}
                >
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`block px-4 py-3 rounded-xl font-medium transition-colors ${
                      location.pathname === item.path
                        ? 'bg-primary/20 text-primary'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navItems.length + 1) * 0.1 }}
                className="pt-3 mt-2 border-t border-white/10"
              >
                <Link
                  to="/"
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <span>←</span> Main Site
                </Link>
              </motion.div>
            </nav>

            {/* CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
              <Link to="/shop" onClick={onClose}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-bold text-black"
                  style={{ backgroundColor: colors.primary }}
                >
                  Shop Now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main Header component
const Header: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  // Keyboard shortcut to open search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-4'
        }`}
      >
        <div className="container mx-auto px-4 lg:px-6">
          <motion.div
            className="relative rounded-2xl border transition-all duration-300"
            style={{
              backgroundColor: isScrolled ? `${colors.dark}95` : `${colors.dark}60`,
              borderColor: isScrolled ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              boxShadow: isScrolled ? '0 10px 40px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            <div className="flex items-center justify-between px-4 lg:px-6 py-3">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShopLogo className="h-8 w-auto" />
                </motion.div>
              </Link>

              {/* Center navigation - Desktop */}
              <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                {navItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      className="relative px-4 py-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span
                        className={`text-sm font-medium transition-colors ${
                          location.pathname === item.path
                            ? 'text-white'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </span>
                      
                      {/* Active indicator */}
                      {location.pathname === item.path && (
                        <motion.div
                          layoutId="activeNav"
                          className="absolute inset-0 rounded-xl -z-10"
                          style={{ backgroundColor: `${colors.primary}20` }}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                ))}
              </nav>

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                {/* Back to Landing */}
                <Link to="/" className="hidden lg:block">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white border border-white/20 rounded-lg hover:border-primary/50 transition-all"
                  >
                    ← Main Site
                  </motion.div>
                </Link>

                {/* Search button - Desktop */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden lg:flex w-10 h-10 rounded-full items-center justify-center border border-white/20 hover:border-primary/50 transition-colors"
                >
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.button>

                {/* Notifications */}
                <NotificationBell />

                {/* Cart */}
                <CartIcon />

                {/* User menu - Desktop */}
                <div className="hidden lg:block">
                  <UserMenu />
                </div>

                {/* Shop Now CTA - Desktop */}
                <Link to="/shop" className="hidden xl:block">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${colors.primary}50` }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 rounded-full text-sm font-bold text-black"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Shop Now
                  </motion.button>
                </Link>

                {/* Mobile menu button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center border border-white/20"
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        onSearchOpen={() => setIsSearchOpen(true)}
      />

      {/* Search modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
