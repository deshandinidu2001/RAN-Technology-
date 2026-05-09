import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingTextProps {
  texts: string[];
  rotationInterval?: number;
  className?: string;
  splitBy?: 'characters' | 'words';
}

const RotatingText: React.FC<RotatingTextProps> = ({
  texts,
  rotationInterval = 2000,
  className = '',
  splitBy = 'characters'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [texts.length, rotationInterval]);

  const splitText = (text: string) => {
    return splitBy === 'characters' ? text.split('') : text.split(' ');
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-120%', opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="flex"
        >
          {splitText(texts[currentIndex]).map((char, index) => (
            <motion.span
              key={index}
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.03,
                ease: 'easeOut'
              }}
              className="inline-block"
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RotatingText;
