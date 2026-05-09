import React from 'react';
import { motion } from 'framer-motion';
import { Navigate, useLocation, Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import { useAuthStore } from '../store/authStore';

const Login: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  // Redirect if already logged in
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-20" style={{ backgroundColor: '#0A0A0B' }}>
      {/* Back to Home */}
      <Link 
        to="/home" 
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-sm font-medium">Back to Home</span>
      </Link>
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="bg-dark-200/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <LoginForm />
        </div>

        {/* Decorative elements */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -top-20 -right-20 w-40 h-40 border border-primary/20 rounded-full"
        />
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -bottom-10 -left-10 w-32 h-32 border border-primary/10 rounded-full"
        />
      </motion.div>
    </div>
  );
};

export default Login;
