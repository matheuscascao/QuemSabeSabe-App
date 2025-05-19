/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary application color
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Category colors
        category: {
          science: {
            50: '#f0fdf4',
            100: '#dcfce7',
            500: '#22c55e',
            700: '#15803d',
            900: '#14532d',
          },
          mathematics: {
            50: '#eff6ff',
            100: '#dbeafe',
            500: '#3b82f6',
            700: '#1d4ed8',
            900: '#1e3a8a',
          },
          history: {
            50: '#fffbeb',
            100: '#fef3c7',
            500: '#f59e0b',
            700: '#b45309',
            900: '#78350f',
          },
          sports: {
            50: '#fff7ed',
            100: '#ffedd5',
            500: '#f97316',
            700: '#c2410c',
            900: '#7c2d12',
          },
          arts: {
            50: '#faf5ff',
            100: '#f3e8ff',
            500: '#a855f7',
            700: '#7e22ce',
            900: '#581c87',
          },
          geography: {
            50: '#f5f5f4',
            100: '#e7e5e4',
            500: '#78716c',
            700: '#44403c',
            900: '#1c1917',
          },
          cinema: {
            50: '#ecfdf5',
            100: '#d1fae5',
            500: '#10b981',
            700: '#047857',
            900: '#064e3b',
          },
          technology: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            500: '#0ea5e9',
            700: '#0369a1',
            900: '#0c4a6e',
          },
        },
        // UI colors
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          700: '#b91c1c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '80%': { transform: 'scale(1.05)', opacity: '0.8' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};