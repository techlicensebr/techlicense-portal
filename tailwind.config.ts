import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1e40af',
        'primary-light': '#3b82f6',
        gold: {
          50: '#FFF9E6',
          100: '#FFF0BF',
          200: '#FFE699',
          300: '#E8C860',
          400: '#D4A843',
          500: '#C9982E',
          600: '#B8860B',
          700: '#8B6914',
          800: '#6B4F10',
          900: '#4A370B',
        },
        silver: {
          50: '#F8F8F8',
          100: '#F0F0F0',
          200: '#E0E0E0',
          300: '#D0D0D0',
          400: '#C0C0C0',
          500: '#A8A8A8',
          600: '#909090',
          700: '#787878',
          800: '#606060',
          900: '#484848',
        },
        sidebar: '#0a0a0a',
        'sidebar-hover': '#1a1a1a',
        accent: '#D4A843',
        'accent-dark': '#B8860B',
        warning: '#f59e0b',
        error: '#ef4444',
        success: '#10b981',
      },
      backgroundColor: {
        body: '#ffffff',
        'sidebar-bg': '#0a0a0a',
        'card': '#f8fafc',
      },
      textColor: {
        muted: '#64748b',
        'sidebar-text': '#C0C0C0',
      },
      borderColor: {
        light: '#e2e8f0',
      },
    },
  },
  plugins: [],
};

export default config;
