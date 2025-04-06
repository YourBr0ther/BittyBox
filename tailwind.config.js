/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pink-primary': '#FF6B9D',
        'pink-secondary': '#FFB5D4',
        'pink-accent': '#FF3A7A',
        'pink-light': '#FFE2EF',
        'pink-dark': '#D43F6A',
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s linear infinite',
      },
    },
  },
  plugins: [],
} 