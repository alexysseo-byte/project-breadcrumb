/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        capy: {
          50:  '#FDF8F2',
          100: '#F5EAD9',
          200: '#E8D0AC',
          300: '#D4B07A',
          400: '#BE8F4E',
          500: '#A0784A',
          600: '#7B5830',
          700: '#5C3F1E',
          800: '#3D2910',
          900: '#1A0E05',
        },
      },
    },
  },
  plugins: [],
};
