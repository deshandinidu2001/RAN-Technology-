import { useState } from 'react';
import { motion } from 'framer-motion';

interface GlareHoverProps {
  children: React.ReactNode;
  className?: string;
  glareColor?: string;
  glareOpacity?: number;
  glareSize?: number;
  transitionDuration?: number;
  borderRadius?: string;
  background?: string;
}

const GlareHover: React.FC<GlareHoverProps> = ({
  children,
  className = '',
  glareColor = '#ffffff',
  glareOpacity = 0.3,
  glareSize = 300,
  transitionDuration = 800,
  borderRadius = '16px',
  background = 'transparent'
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{ borderRadius, background }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {children}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${glareColor}, transparent 70%)`,
          width: `${glareSize}%`,
          height: `${glareSize}%`,
          left: mousePosition.x,
          top: mousePosition.y,
          transform: 'translate(-50%, -50%)',
          opacity: isHovered ? glareOpacity : 0,
          transition: `opacity ${transitionDuration}ms ease`
        }}
      />
    </motion.div>
  );
};

export default GlareHover;
