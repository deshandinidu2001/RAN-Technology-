/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F7B500',
          50: '#FEF5D9',
          100: '#FDEFC4',
          200: '#FCE39B',
          300: '#FAD772',
          400: '#F9CB49',
          500: '#F7B500',
          600: '#C69100',
          700: '#946D00',
          800: '#624800',
          900: '#312400',
        },
        dark: {
          DEFAULT: '#0a0a0a',
          50: '#3a3a3a',
          100: '#2a2a2a',
          200: '#1a1a1a',
          300: '#151515',
          400: '#111111',
          500: '#0a0a0a',
          600: '#050505',
          700: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient': 'gradient 8s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-down': 'slide-down 0.5s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(247, 181, 0, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(247, 181, 0, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(247, 181, 0, 0.3)',
        'glow-lg': '0 0 40px rgba(247, 181, 0, 0.4)',
        'glow-xl': '0 0 60px rgba(247, 181, 0, 0.5)',
        'inner-glow': 'inset 0 0 20px rgba(247, 181, 0, 0.2)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
