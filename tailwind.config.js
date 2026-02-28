/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Feminine luxury palette
        'primary': '#e8a87c',         // Rose gold
        'primary-light': '#f5d0b5',   // Light rose gold
        'primary-dark': '#c47a50',    // Deep rose gold
        'accent': '#d4a574',          // Champagne
        'surface': '#1a0a1a',         // Deep plum
        'surface-mid': '#2a1428',     // Mid plum
        'surface-light': '#f5e6d3',   // Warm cream
        'card': '#2a1428',            // Card plum
        'card-hover': '#3a1e38',      // Card hover
        'blush': '#f0d0d0',           // Soft blush
        'muted-rose': '#c9a0a0',      // Muted rose
        'glass': 'rgba(255,255,255,0.05)',
        'glass-border': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        display: ['Newsreader', 'serif'],
        sans: ['Noto Sans', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px) translateZ(0)' },
          '100%': { opacity: '1', transform: 'translateY(0) translateZ(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-scale': {
          '0%': { opacity: '0', transform: 'scale(0.95) translateZ(0)' },
          '100%': { opacity: '1', transform: 'scale(1) translateZ(0)' },
        },
        'zoom-slow': {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) translateZ(0)' },
          '50%': { transform: 'translateY(-12px) translateZ(0)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '33%': { transform: 'translateY(-8px) rotate(1deg)' },
          '66%': { transform: 'translateY(-4px) rotate(-1deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232,168,124,0.15)' },
          '50%': { boxShadow: '0 0 40px rgba(232,168,124,0.3)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(40px) translateZ(0)' },
          '100%': { opacity: '1', transform: 'translateX(0) translateZ(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-40px) translateZ(0)' },
          '100%': { opacity: '1', transform: 'translateX(0) translateZ(0)' },
        },
        'fabric-wave': {
          '0%': { transform: 'skewY(0deg) scaleX(1)' },
          '50%': { transform: 'skewY(-0.5deg) scaleX(1.01)' },
          '100%': { transform: 'skewY(0deg) scaleX(1)' },
        },
        'petal-fall': {
          '0%': { transform: 'translateY(-10%) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.6' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
        'depth-breathe': {
          '0%, 100%': { transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)' },
          '50%': { transform: 'perspective(800px) rotateX(1deg) rotateY(-1deg)' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'pan-image': {
          '0%': { objectPosition: '0% 50%' },
          '50%': { objectPosition: '100% 50%' },
          '100%': { objectPosition: '0% 50%' },
        },
        'gentle-tilt': {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%': { transform: 'rotate(1deg)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in': 'fade-in 1s ease-out forwards',
        'fade-in-scale': 'fade-in-scale 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
        'zoom-slow': 'zoom-slow 20s ease-in-out infinite alternate',
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-in-left': 'slide-in-left 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
        'fabric-wave': 'fabric-wave 8s ease-in-out infinite',
        'petal-fall': 'petal-fall 12s linear infinite',
        'depth-breathe': 'depth-breathe 10s ease-in-out infinite',
        'text-shimmer': 'text-shimmer 8s linear infinite',
        'pulse-ring': 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'pan-image': 'pan-image 40s ease-in-out infinite',
        'gentle-tilt': 'gentle-tilt 6s ease-in-out infinite alternate',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
