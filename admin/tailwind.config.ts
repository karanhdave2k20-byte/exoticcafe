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
        crema: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
        },
        roast: {
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
        },
        caramel: {
          300: '#A78BFA',
          400: '#8B5CF6',
          500: '#7C3AED',
          600: '#6D28D9',
          700: '#5B21B6',
        },
        champagne: {
          300: '#38BDF8',
          400: '#0EA5E9',
          500: '#0284C7',
        },
        obsidian: {
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        muted: {
          DEFAULT: '#64748B',
          light: '#94A3B8',
          dark: '#475569',
        },
        warm: {
          white: '#FFFFFF',
          cream: '#F8FAFC',
          subtle: '#F1F5F9',
          border: '#E2E8F0',
          borderHover: '#CBD5E1',
        },
        veg: '#10B981',
        nonveg: '#F43F5E',
      },
      fontFamily: {
        serif: ['var(--font-sans)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 4px 20px rgba(124, 58, 237, 0.08)',
        glow: '0 0 25px rgba(124, 58, 237, 0.3)',
        gold: '0 4px 16px rgba(124, 58, 237, 0.25)',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
