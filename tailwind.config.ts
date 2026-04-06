import type { Config } from 'tailwindcss';

const config: Config = {
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
        sidebar: '#0f172a',
        'sidebar-hover': '#1e293b',
        accent: '#10b981',
        'accent-dark': '#059669',
        warning: '#f59e0b',
        error: '#ef4444',
        success: '#10b981',
      },
      backgroundColor: {
        body: '#ffffff',
        'sidebar-bg': '#0f172a',
        'card': '#f8fafc',
      },
      textColor: {
        muted: '#64748b',
        'sidebar-text': '#e2e8f0',
      },
      borderColor: {
        light: '#e2e8f0',
      },
    },
  },
  plugins: [],
};

export default config;
