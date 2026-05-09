import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

const App: React.FC = () => {
  const { checkAuth, token } = useAuthStore();

  // Check authentication status on app load
  useEffect(() => {
    if (token) {
      checkAuth();
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
    </Router>
  );
};

export default App;
