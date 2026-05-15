import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        mint: '#14b8a6'
      },
      boxShadow: {
        fintech: '0 24px 60px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
