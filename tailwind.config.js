// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  darkMode: 'class',              // ← enable class-based dark mode
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#ebf5ff', 100: '#e1effe', 200: '#c3ddfd',
          300: '#a4cbfb', 400: '#66a9f8', 500: '#2e88f4',
          600: '#2069c7', 700: '#184e99', 800: '#10376a',
          900: '#091e3c',
        },
        gray: {
          50:  '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7',
          300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a',
          600: '#52525b', 700: '#3f3f46', 800: '#27272a',
          900: '#18181b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}
