/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c4ff',
          300: '#a0a0ff',
          400: '#7c7cff',
          500: '#6c63ff',
          600: '#5a50e6',
          700: '#4840cc',
          800: '#3630b3',
          900: '#242099',
        },
      },
    },
  },
  plugins: [],
};
