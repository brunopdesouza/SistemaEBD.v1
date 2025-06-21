// tailwind.config.js - Configuração personalizada para Sistema EBD
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Cores personalizadas da Igreja Cristã Maranata
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        church: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        serif: [
          'Georgia',
          'Cambria',
          '"Times New Roman"',
          'Times',
          'serif',
        ],
        mono: [
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xs': '0.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-out': 'slideOut 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'outline-primary': '0 0 0 2px rgba(59, 130, 246, 0.5)',
        'outline-success': '0 0 0 2px rgba(34, 197, 94, 0.5)',
        'outline-error': '0 0 0 2px rgba(239, 68, 68, 0.5)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionProperty: {
        'spacing': 'margin, padding',
        'layout': 'width, height, top, right, bottom, left',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    // Plugin para formulários
    function({ addUtilities }) {
      const newUtilities = {
        '.form-input': {
          '@apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors': {},
        },
        '.form-select': {
          '@apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white': {},
        },
        '.form-textarea': {
          '@apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none': {},
        },
        '.btn-primary': {
          '@apply bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2': {},
        },
        '.btn-secondary': {
          '@apply bg-secondary-100 hover:bg-secondary-200 text-secondary-800 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2': {},
        },
        '.btn-success': {
          '@apply bg-success-600 hover:bg-success-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2': {},
        },
        '.btn-warning': {
          '@apply bg-warning-600 hover:bg-warning-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-warning-500 focus:ring-offset-2': {},
        },
        '.btn-error': {
          '@apply bg-error-600 hover:bg-error-700 text-white px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2': {},
        },
        '.card': {
          '@apply bg-white rounded-lg shadow-md p-6': {},
        },
        '.card-header': {
          '@apply border-b border-gray-200 pb-4 mb-4': {},
        },
        '.badge': {
          '@apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': {},
        },
        '.badge-primary': {
          '@apply bg-primary-100 text-primary-800': {},
        },
        '.badge-success': {
          '@apply bg-success-100 text-success-800': {},
        },
        '.badge-warning': {
          '@apply bg-warning-100 text-warning-800': {},
        },
        '.badge-error': {
          '@apply bg-error-100 text-error-800': {},
        },
        '.loading': {
          '@apply pointer-events-none opacity-70': {},
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#cbd5e1 #f1f5f9',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '8px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: '#f1f5f9',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          'background-color': '#cbd5e1',
          'border-radius': '4px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          'background-color': '#94a3b8',
        },
      };
      
      addUtilities(newUtilities);
    },
    
    // Plugin para estados de focus
    function({ addUtilities }) {
      addUtilities({
        '.focus-ring': {
          '@apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2': {},
        },
        '.focus-ring-error': {
          '@apply focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2': {},
        },
        '.focus-ring-success': {
          '@apply focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2': {},
        },
      });
    },
  ],
  variants: {
    extend: {
      opacity: ['disabled'],
      cursor: ['disabled'],
      backgroundColor: ['active', 'group-focus'],
      borderColor: ['active', 'group-focus'],
      textColor: ['active', 'group-focus'],
    },
  },
  corePlugins: {
    // Remover plugins não utilizados para reduzir tamanho do bundle
    container: false,
  },
};
