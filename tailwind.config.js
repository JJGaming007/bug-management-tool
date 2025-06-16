/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lightBg: '#ffffff',
        darkBg:  '#1f2937',
        lightCard: '#f9fafb',
        darkCard:  '#374151',
        lightBorder: '#e5e7eb',
        darkBorder:  '#4b5563',
        text: '#111827',
        subtext: '#6b7280',
        accent: '#fbbf24',
        'accent-hover': '#f59e0b',
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
