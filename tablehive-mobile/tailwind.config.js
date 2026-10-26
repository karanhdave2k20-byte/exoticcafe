/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          500: '#8b5e3c',
          600: '#6f4e37',
          700: '#543d2b',
          800: '#3c2b1e',
          900: '#261b13',
        }
      }
    },
  },
  plugins: [],
}
