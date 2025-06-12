/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FFF8DC',
          DEFAULT: '#FFD700',
          dark: '#FFC107',
        },
        secondary: {
          light: '#333333',
          DEFAULT: '#000000',
        },
        accent: {
          light: '#FFECB3',
          DEFAULT: '#FFEB3B',
          dark: '#FBC02D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
