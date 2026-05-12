import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Footer from './components/layout/Footer';

// Layout
import Layout from './components/layout/Layout';
import RepairLayout from './components/layout/RepairLayout';

// Pages - Shop Section
import Landing from './pages/Landing';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';

// Pages - Repair Section
import RepairHome from './pages/RepairHome';
import RepairBooking from './pages/RepairBooking';
import RepairAbout from './pages/RepairAbout';
import RepairContact from './pages/RepairContact';
import PCBuild from './pages/PCBuild';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Pages - Admin Section (Hidden)
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Store
import { useAuthStore } from './store/authStore';
import api from './utils/api';

// ─── Repair-ready notification banner ───────────────────────────────────────
const RepairReadyNotification: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [readyRepairs, setReadyRepairs] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const location = useLocation();

  const fetchReadyRepairs = useCallback(async () => {
    if (!isAuthenticated || !user?.email) return;
    try {
      const res = await api.get('/repairs/my-bookings', { params: { email: user.email } });
      const bookings: any[] = res.data?.bookings || [];
      setReadyRepairs(bookings.filter((b) => b.status === 'ready-for-pickup'));
    } catch {}
  }, [isAuthenticated, user?.email]);

  useEffect(() => {
    fetchReadyRepairs();
    const interval = setInterval(fetchReadyRepairs, 60000);
    return () => clearInterval(interval);
  }, [fetchReadyRepairs]);

  // Don't show on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  const visible = readyRepairs.filter((r) => !dismissed.has(r.id));
  if (!visible.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] space-y-2 max-w-sm w-full px-4">
      {visible.map((repair) => (
        <div
          key={repair.id}
          className="bg-green-900/90 backdrop-blur border border-green-500/40 rounded-xl p-4 shadow-xl flex items-start gap-3"
        >
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-green-300 font-semibold text-sm">Device Ready for Pickup!</p>
            <p className="text-white/70 text-xs mt-0.5 truncate">
              {repair.deviceType} — Job #{repair.id.slice(0, 8)}
            </p>
            <p className="text-white/50 text-xs mt-1">Visit our service center to collect your device.</p>
          </div>
          <button
            onClick={() => setDismissed((prev) => new Set(prev).add(repair.id))}
            className="text-white/40 hover:text-white ml-1 flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const { checkAuth, token } = useAuthStore();

  // Check authentication status on app load
  useEffect(() => {
    if (token) {
      checkAuth();
    } else {
      // No auth token on boot → discard any leftover cart from a previous
      // logged-in session so guests don't see another customer's items
      // (e.g. cart badge showing "18" when no one is signed in).
      // The user's saved cart is preserved under `ran-cart-<userId>`
      // and restored when they sign in again.
      import('./store/cartStore').then(({ useCartStore }) => {
        useCartStore.getState().clearCart();
      });
    }
  }, [checkAuth, token]);

  return (
    <Router>
      <Routes>
        {/* Landing Page - Standalone */}
        <Route path="/" element={<Landing />} />
        
        {/* Shop Section - With Shop Layout */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          {/* Shared pages accessible from both sections */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        {/* Auth pages - Standalone without header/footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Legal pages - Standalone */}
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Repair Section - With Repair Layout */}
        <Route element={<RepairLayout />}>
          <Route path="/repair-home" element={<RepairHome />} />
          <Route path="/repair" element={<RepairBooking />} />
          <Route path="/pc-build" element={<PCBuild />} />
          <Route path="/repair-about" element={<RepairAbout />} />
          <Route path="/repair-contact" element={<RepairContact />} />
        </Route>

        {/* Admin Section - Hidden, accessible only via URL */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* 404 - Not Found */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col bg-dark">
              <div className="flex-1 flex items-center justify-center px-6">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
                  <p className="text-white/60 text-xl mb-8">Page not found</p>
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-400 transition-colors"
                  >
                    Go Home
                  </a>
                </div>
              </div>
              <Footer />
            </div>
          }
        />
      </Routes>
      <RepairReadyNotification />
    </Router>
  );
};

export default App;
