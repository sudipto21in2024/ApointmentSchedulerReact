/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          main: '#2563EB',
          dark: '#1D4ED8',
          light: '#DBEAFE'
        },
        secondary: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6'
        },
        neutral: {
          black: '#000000',
          gray900: '#111827',
          gray700: '#374151',
          gray500: '#6B7280',
          gray300: '#D1D5DB',
          gray100: '#F3F4F6',
          gray50: '#F9FAFB',
          white: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      fontSize: {
        'heading1': ['32px', { lineHeight: '100%', letterSpacing: '-0.125rem' }],
        'heading2': ['24px', { lineHeight: '100%', letterSpacing: '-0.125rem' }],
        'heading3': ['20px', { lineHeight: '100%', letterSpacing: '-0.125rem' }],
        'bodyLarge': ['16px', { lineHeight: '150%' }],
        'bodyMedium': ['14px', { lineHeight: '150%' }],
        'bodySmall': ['12px', { lineHeight: '150%' }],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        'xxl': '48px',
        'xxxl': '64px',
      },
      borderRadius: {
        'card': '8px',
        'button': '6px',
        'input': '6px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      transitionDuration: {
        'fast': '0.15s',
        'normal': '0.2s',
        'slow': '0.3s',
      },
      screens: {
        'mobile': '0px',
        'tablet': '768px',
        'desktop': '1024px',
        'wideScreen': '1400px',
      },
      animation: {
        'loading-shimmer': 'loading-shimmer 1.5s infinite',
        'btn-spin': 'btn-spin 1s linear infinite',
        'slideInUp': 'slideInUp 0.2s ease-out',
      },
      keyframes: {
        'loading-shimmer': {
          '0%': { left: '-100%' },
          '100%': { left: '100%' },
        },
        'btn-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'slideInUp': {
          'from': {
            opacity: '0',
            transform: 'translateY(-4px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}