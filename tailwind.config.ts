import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Silver Maid Brand Colors
        'silver-pink': {
          50: '#fdf7fb',
          100: '#faeef6',
          200: '#f5ddef',
          300: '#f0cce7',
          400: '#eb9dd3',
          500: '#e66db9',
          600: '#ea4c8c',  // Primary Brand Pink
          700: '#e23d7f',
          800: '#c92d6f',
          900: '#b1215f',
        },
        'silver-teal': {
          50: '#f0f7f9',
          100: '#e0eff4',
          200: '#bfe3ec',
          300: '#8fcfd9',
          400: '#4eb3c8',
          500: '#2a95a6',
          600: '#0b7a8e',  // Primary Brand Teal
          700: '#065d73',
          800: '#054757',
          900: '#043a45',
        },
        blue: {
          50: '#f0f9fd',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0b7a8e',
          700: '#0284c7',
          800: '#0369a1',
          900: '#082f49',
        },
      },
    },
  },
  plugins: [],
};

export default config;
