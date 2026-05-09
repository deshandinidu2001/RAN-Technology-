import React, { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outline';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  variant = 'default',
  className = '',
  type = 'text',
  id,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const baseStyles = 'w-full px-4 py-3 text-white placeholder-white/40 transition-all duration-300 outline-none';
  
  const variants = {
    default: 'bg-dark-200 border border-white/10 rounded-lg focus:border-primary',
    filled: 'bg-dark-100 border-b-2 border-white/10 rounded-t-lg focus:border-primary',
    outline: 'bg-transparent border-2 border-white/20 rounded-lg focus:border-primary',
  };

  const errorStyles = error ? 'border-red-500 focus:border-red-500' : '';
  const iconPaddingLeft = leftIcon ? 'pl-11' : '';
  const iconPaddingRight = rightIcon || isPassword ? 'pr-11' : '';

  return (
    <div className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <motion.label
          htmlFor={inputId}
          className={`block mb-2 text-sm font-medium transition-colors ${
            isFocused ? 'text-primary' : 'text-white/70'
          }`}
          animate={{ color: isFocused ? '#F7B500' : 'rgba(255,255,255,0.7)' }}
        >
          {label}
        </motion.label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
            {leftIcon}
          </span>
        )}

        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`${baseStyles} ${variants[variant]} ${errorStyles} ${iconPaddingLeft} ${iconPaddingRight}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Right icon / Password toggle */}
        {(rightIcon || isPassword) && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            ) : (
              <span className="text-white/40">{rightIcon}</span>
            )}
          </span>
        )}

        {/* Focus animation border */}
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: isFocused ? '100%' : '0%' }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Error / Hint messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
        {!error && hint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 text-sm text-white/40"
          >
            {hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
