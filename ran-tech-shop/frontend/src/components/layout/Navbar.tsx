import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { NavbarLogoImage } from '../ui/LogoImage';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Repair', path: '/repair' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled || isMobileMenuOpen
            ? 'bg-black/40 backdrop-blur-2xl border-b border-white/10 shadow-2xl shadow-black/50'
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <img
                  src="/images/logo.png"
                  alt="RAN - The Best Haven For Technology"
                  className="h-12 w-auto object-contain"
                />
                <div className="absolute inset-0 bg-primary/30 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="relative group"
                >
                  <span
                    className={`text-sm font-medium transition-colors ${
                      isActive(link.path) ? 'text-primary' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </span>
                  {/* Active indicator */}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5 bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: isActive(link.path) ? '100%' : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Hover indicator */}
                  <span className="absolute -bottom-1 left-0 h-0.5 bg-primary/50 w-0 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Right side - Cart & Auth */}
            <div className="hidden md:flex items-center gap-4">
              {/* Cart */}
              <Link to="/checkout" className="relative group">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {/* Cart count badge */}
                  <AnimatePresence>
                    {cartItemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-dark text-xs font-bold rounded-full flex items-center justify-center"
                      >
                        {cartItemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-medium text-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-white/70">{user?.name}</span>
                    <svg
                      className="w-4 h-4 text-white/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-dark-200 rounded-lg border border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5"
                    >
                      Orders
                    </Link>
                    <hr className="my-2 border-white/10" />
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-primary text-dark font-medium rounded-lg hover:bg-primary-400 transition-colors"
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-4">
              {/* Mobile Cart */}
              <Link to="/checkout" className="relative">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-dark text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <motion.span
                    animate={{
                      rotate: isMobileMenuOpen ? 45 : 0,
                      y: isMobileMenuOpen ? 8 : 0,
                    }}
                    className="w-full h-0.5 bg-white rounded-full origin-left"
                  />
                  <motion.span
                    animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                    className="w-full h-0.5 bg-white rounded-full"
                  />
                  <motion.span
                    animate={{
                      rotate: isMobileMenuOpen ? -45 : 0,
                      y: isMobileMenuOpen ? -8 : 0,
                    }}
                    className="w-full h-0.5 bg-white rounded-full origin-left"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-20 left-0 right-0 bg-dark-500/95 backdrop-blur-xl z-40 md:hidden border-b border-white/5"
          >
            <div className="container-custom py-6">
              <div className="flex flex-col gap-4">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      className={`block py-3 text-lg font-medium ${
                        isActive(link.path) ? 'text-primary' : 'text-white/70'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}

                <hr className="border-white/10" />

                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 py-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-white">{user?.name}</span>
                    </div>
                    <button
                      onClick={logout}
                      className="py-3 text-left text-red-400 font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="py-3 text-lg font-medium text-primary"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
