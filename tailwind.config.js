/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'wind-left': 'wind-left 1.5s linear infinite',
        shake: 'shake 0.3s infinite',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
      },
      keyframes: {
        'wind-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100vw)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '50%': { transform: 'translateX(5px)' },
          '75%': { transform: 'translateX(-5px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      }
    }

  },
  plugins: [],
}

