/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        slate: {
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
        brand: {
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
        navy: {
          50: '#eaf1f9',
          100: '#d5e3f3',
          200: '#abcdde',
          300: '#82b7c9',
          400: '#58a0b4',
          500: '#234a7d',
          600: '#1b3b64',
          700: '#15325b',
          800: '#0f2442',
          900: '#0A1D37',
          950: '#050f1d',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',
        purple: '#8b5cf6',
      },
      boxShadow: {
        soft: '0 8px 24px rgba(15, 23, 42, 0.08)',
        glow: '0 0 40px rgba(37, 99, 235, 0.15)',
      },
      borderRadius: {
        card: '18px',
      },
    },
  },
  plugins: [],
};
