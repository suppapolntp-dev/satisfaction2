import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        'figma-navbar': '0px 1px 3px 0px rgba(15,23,42,0.03), 0px 6px 16px 0px rgba(15,23,42,0.04)',
        'figma-dropdown': '0px 16px 24px -4px rgba(15,23,42,0.14), 0px 4px 12px -2px rgba(15,23,42,0.06)',
        'spotlight': '0px 25px 50px -12px rgba(15, 23, 42, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'pop-in': 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        popIn: {
          'from': {
            opacity: '0',
            transform: 'scale(0.9) translateY(10px)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1) translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
