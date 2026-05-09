import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  description,
  centered = true,
  light = false,
  className = ''
}) => {
  return (
    <div className={`${centered ? 'text-center' : ''} mb-12 ${className}`}>
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-sm font-semibold tracking-[0.3em] uppercase mb-4 ${
            light ? 'text-[#F7B500]' : 'text-[#06B6D4]'
          }`}
        >
          {subtitle}
        </motion.p>
      )}
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className={`text-4xl md:text-5xl lg:text-6xl font-black mb-4 ${
          light ? 'text-white' : 'text-gray-900'
        }`}
      >
        {title}
      </motion.h2>
      
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={`text-lg max-w-2xl ${centered ? 'mx-auto' : ''} ${
            light ? 'text-white/60' : 'text-gray-600'
          }`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
};

export default SectionHeader;
