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
        'magic-purple': '#9D4EDD',
        'magic-lavender': '#C77DFF',
        'magic-peach': '#FFB4A2',
        'magic-gold': '#FFD93D',
      },
      fontFamily: {
        sans: ['var(--font-nunito)', 'sans-serif'],
        magic: ['var(--font-fredoka)', 'var(--font-nunito)', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'sparkle-delayed': 'sparkle 2s ease-in-out 0.5s infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'wave': 'wave 2.5s ease-in-out infinite',
        'confetti-fall': 'confettiFall 3s ease-out forwards',
        'star-burst': 'starBurst 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 107, 157, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 107, 157, 0.8), 0 0 60px rgba(157, 78, 221, 0.4)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        wave: {
          '0%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-100vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        starBurst: {
          '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.5) rotate(180deg)', opacity: '1' },
          '100%': { transform: 'scale(2) rotate(360deg)', opacity: '0' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
      backgroundImage: {
        'magic-gradient': 'linear-gradient(135deg, #FFE2EF 0%, #E8D5F2 50%, #FFB5D4 100%)',
        'sparkle-overlay': 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 60%)',
      },
    },
  },
  plugins: [],
} 