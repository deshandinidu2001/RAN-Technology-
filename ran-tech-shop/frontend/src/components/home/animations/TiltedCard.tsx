import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  transitionDuration?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
}

const TiltedCard: React.FC<TiltedCardProps> = ({
  children,
  className = '',
  maxTilt = 15,
  perspective = 1000,
  scale = 1.05,
  transitionDuration = 400,
  glareEnable = true,
  glareMaxOpacity = 0.35
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * maxTilt;
    const tiltY = ((centerX - x) / centerX) * maxTilt;

    setTilt({ x: tiltX, y: tiltY });
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  }, [maxTilt]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        scale: isHovered ? scale : 1
      }}
      transition={{
        duration: transitionDuration / 1000,
        ease: 'easeOut'
      }}
    >
      {children}
      {glareEnable && (
        <div
          className="absolute inset-0 pointer-events-none rounded-inherit overflow-hidden"
          style={{
            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,${isHovered ? glareMaxOpacity : 0}) 0%, transparent 60%)`,
            transition: `opacity ${transitionDuration}ms ease`
          }}
        />
      )}
    </motion.div>
  );
};

export default TiltedCard;
