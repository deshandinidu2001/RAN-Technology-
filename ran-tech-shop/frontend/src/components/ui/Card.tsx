import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'outline' | 'gradient';
  hover?: boolean;
  glow?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(({
  children,
  variant = 'default',
  hover = false,
  glow = false,
  padding = 'md',
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'rounded-2xl overflow-hidden transition-all duration-300';
  
  const variants = {
    default: 'bg-dark-200 border border-white/5',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    outline: 'bg-transparent border-2 border-white/10',
    gradient: 'bg-gradient-to-br from-dark-100 to-dark-300 border border-white/5',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover
    ? 'hover:border-primary/30 hover:shadow-glow hover:-translate-y-1 cursor-pointer'
    : '';

  const glowStyles = glow ? 'shadow-glow' : '';

  return (
    <motion.div
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${hoverStyles} ${glowStyles} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

// Card subcomponents
interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-white ${className}`}>{children}</h3>
);

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = '' }) => (
  <p className={`text-white/60 text-sm ${className}`}>{children}</p>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-white/5 ${className}`}>{children}</div>
);

export default Card;
