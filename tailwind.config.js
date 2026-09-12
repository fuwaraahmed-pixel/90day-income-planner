/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Anek Bangla"', 'Inter', 'sans-serif'],
        bengali: ['"Anek Bangla"', 'sans-serif'],
      },
      colors: {
        page: '#f8fafc',
        card: '#ffffff',
        subtle: '#f1f5f9',
        border: '#e2e8f0',
      }
    },
  },
  plugins: [],
}
