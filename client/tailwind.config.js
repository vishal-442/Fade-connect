/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0F172A',
          light: '#16213A',
        },
        charcoal: '#1E293B',
        gold: {
          DEFAULT: '#D4AF37',
          glow: '#F5D580',
          deep: '#A8842A',
        },
        warmwhite: '#F8F7F4',
        slate: {
          soft: '#94A3B8',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
      },
      backgroundImage: {
        'fade-bar': 'linear-gradient(90deg, #0F172A 0%, #1E293B 35%, #A8842A 70%, #D4AF37 100%)',
        'fade-radial': 'radial-gradient(circle at 20% 20%, rgba(212,175,55,0.15), transparent 45%)',
      },
      boxShadow: {
        gold: '0 0 0 1px rgba(212,175,55,0.4), 0 8px 30px -8px rgba(212,175,55,0.25)',
        glass: '0 8px 32px 0 rgba(0,0,0,0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeSweep: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '100% 50%' },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        sweep: 'fadeSweep 6s ease infinite',
        fadeInUp: 'fadeInUp 0.5s ease forwards',
      },
    },
  },
  plugins: [],
}

