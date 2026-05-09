import React from 'react';
import { motion } from 'framer-motion';

interface RanLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  animated?: boolean;
  className?: string;
  showTagline?: boolean;
}

const RanLogo: React.FC<RanLogoProps> = ({ 
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

  const LogoSVG = () => (
    <svg viewBox="0 0 300 100" fill="none" className={`${sizeClasses[size]} w-auto`}>
      {/* R Letter - Yellow/Gold */}
      <motion.path
        d="M5 5 L5 95 L22 95 L22 60 L40 60 L58 95 L80 95 L58 55 C68 50 75 42 75 32 C75 15 60 5 40 5 L5 5 Z M22 18 L38 18 C50 18 57 22 57 30 C57 38 50 42 38 42 L22 42 L22 18 Z"
        fill="#F7B500"
        initial={animated ? { pathLength: 0, opacity: 0 } : {}}
        animate={animated ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0 }}
      />
      
      {/* A Letter - Black/Dark with circuit detail */}
      <motion.g
        initial={animated ? { opacity: 0, y: 10 } : {}}
        animate={animated ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Main A shape */}
        <path 
          d="M90 95 L125 5 L145 5 L180 95 L160 95 L153 78 L117 78 L110 95 L90 95 Z M122 62 L148 62 L135 25 L122 62 Z" 
          fill="currentColor"
          className="text-white"
        />
        {/* Circuit line from A */}
        <motion.line 
          x1="135" y1="95" x2="135" y2="108" 
          stroke="currentColor" 
          strokeWidth="2"
          className="text-white/60"
          initial={animated ? { pathLength: 0 } : {}}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.6 }}
        />
        <motion.line 
          x1="135" y1="108" x2="185" y2="108" 
          stroke="currentColor" 
          strokeWidth="2"
          className="text-white/60"
          initial={animated ? { pathLength: 0 } : {}}
          animate={animated ? { pathLength: 1 } : {}}
          transition={{ duration: 0.3, delay: 0.7 }}
        />
        <motion.circle 
          cx="185" cy="108" r="3" 
          fill="currentColor"
          className="text-white/60"
          initial={animated ? { scale: 0 } : {}}
          animate={animated ? { scale: 1 } : {}}
          transition={{ duration: 0.2, delay: 0.9 }}
        />
        <motion.circle 
          cx="155" cy="108" r="2" 
          fill="currentColor"
          className="text-white/60"
          initial={animated ? { scale: 0 } : {}}
          animate={animated ? { scale: 1 } : {}}
          transition={{ duration: 0.2, delay: 0.85 }}
        />
      </motion.g>
      
      {/* N Letter - Black/Dark */}
      <motion.path 
        d="M195 5 L195 95 L212 95 L212 35 L255 95 L275 95 L275 5 L258 5 L258 65 L215 5 L195 5 Z" 
        fill="currentColor"
        className="text-white"
        initial={animated ? { opacity: 0, x: 10 } : {}}
        animate={animated ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    </svg>
  );

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <LogoSVG />
      {showTagline && (
        <motion.p
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={animated ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1 }}
          className={`${taglineSizes[size]} text-white/70 mt-2 tracking-wide`}
        >
          The Best Haven For Technology
        </motion.p>
      )}
    </div>
  );
};

// Simple inline logo for navbar
export const NavbarLogo: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <svg viewBox="0 0 300 100" fill="none" className="h-9 w-auto">
      {/* R Letter - Yellow/Gold */}
      <path
        d="M5 5 L5 95 L22 95 L22 60 L40 60 L58 95 L80 95 L58 55 C68 50 75 42 75 32 C75 15 60 5 40 5 L5 5 Z M22 18 L38 18 C50 18 57 22 57 30 C57 38 50 42 38 42 L22 42 L22 18 Z"
        fill="#F7B500"
      />
      
      {/* A Letter */}
      <path 
        d="M90 95 L125 5 L145 5 L180 95 L160 95 L153 78 L117 78 L110 95 L90 95 Z M122 62 L148 62 L135 25 L122 62 Z" 
        fill="white"
      />
      {/* Circuit line from A */}
      <line x1="135" y1="95" x2="135" y2="108" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
      <line x1="135" y1="108" x2="185" y2="108" stroke="rgba(255,255,255,0.5)" strokeWidth="2"/>
      <circle cx="185" cy="108" r="3" fill="rgba(255,255,255,0.5)"/>
      <circle cx="155" cy="108" r="2" fill="rgba(255,255,255,0.5)"/>
      
      {/* N Letter */}
      <path 
        d="M195 5 L195 95 L212 95 L212 35 L255 95 L275 95 L275 5 L258 5 L258 65 L215 5 L195 5 Z" 
        fill="white"
      />
    </svg>
  </div>
);

export default RanLogo;
