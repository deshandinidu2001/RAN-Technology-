import React from 'react';
import { motion } from 'framer-motion';

interface LogoImageProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  animated?: boolean;
  className?: string;
  showTagline?: boolean;
}

const LogoImage: React.FC<LogoImageProps> = ({ 
  size = 'md', 
  animated = true, 
  className = '',
  showTagline = false 
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
    hero: 'h-32 md:h-48',
  };

  const taglineSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    hero: 'text-xl md:text-2xl',
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <motion.img
        src="/images/logo.png"
        alt="RAN - The Best Haven For Technology"
        className={`${sizeClasses[size]} w-auto object-contain`}
        initial={animated ? { opacity: 0, scale: 0.8, y: 20 } : {}}
        animate={animated ? { opacity: 1, scale: 1, y: 0 } : {}}
        transition={{ 
          duration: 0.8, 
          ease: [0.6, -0.05, 0.01, 0.99],
          delay: 0.1 
        }}
        whileHover={{ 
          scale: 1.05,
          filter: 'drop-shadow(0 0 20px rgba(247, 181, 0, 0.5))'
        }}
      />
      {showTagline && (
        <motion.p
          className={`${taglineSizes[size]} text-white/70 mt-2 italic font-light tracking-wide`}
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={animated ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          The Best Haven For Technology
        </motion.p>
      )}
    </div>
  );
};

// Navbar specific logo component
export const NavbarLogoImage: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <motion.img
      src="/images/logo.png"
      alt="RAN"
      className={`h-10 w-auto object-contain ${className}`}
      whileHover={{ 
        scale: 1.05,
        filter: 'drop-shadow(0 0 15px rgba(247, 181, 0, 0.4))'
      }}
      transition={{ duration: 0.2 }}
    />
  );
};

export default LogoImage;
