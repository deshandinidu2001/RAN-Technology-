import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

// Color palette - Same as Shop Header
const colors = {
  primary: '#F7B500',
  secondary: '#FF6B35',
  accent: '#7C3AED',
  highlight: '#06B6D4',
  dark: '#0A0A0B',
};

// Navigation items for Repair Section (No Shop)
const navItems = [
  { label: 'Home', path: '/repair-home' },
  { label: 'Book Repair', path: '/repair' },
  { label: 'Custom Build', path: '/pc-build' },
  { label: 'About', path: '/repair-about' },
  { label: 'Contact', path: '/repair-contact' },
];

// RAN Repair logo asset
const RepairLogo: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src="/images/ranrepair.png"
    alt="RAN Repair"
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
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
              >
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Mobile menu
const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const location = useLocation();

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
              <RepairLogo className="h-8 w-auto" />
            </div>

            {/* Nav items */}
            <nav className="p-4 space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
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
            </nav>

            {/* CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
              <Link to="/repair" onClick={onClose}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-xl font-bold text-black"
                  style={{ backgroundColor: colors.primary }}
                >
                  Book Repair
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Main RepairHeader component
const RepairHeader: React.FC = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

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
              <Link to="/repair-home" className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RepairLogo className="h-8 w-auto" />
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
                          layoutId="activeNavRepair"
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
                  className="hidden lg:flex w-10 h-10 rounded-full items-center justify-center border border-white/20 hover:border-primary/50 transition-colors"
                >
                  <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </motion.button>

                {/* Cart */}
                <CartIcon />

                {/* User menu - Desktop */}
                <div className="hidden lg:block">
                  <UserMenu />
                </div>

                {/* Book Repair CTA - Desktop */}
                <Link to="/repair" className="hidden xl:block">
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${colors.primary}50` }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 rounded-full text-sm font-bold text-black"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Book Repair
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
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default RepairHeader;
