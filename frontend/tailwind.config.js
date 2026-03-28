/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          600: '#1e3a5f',
          700: '#1e3a5f',
          800: '#1e3a5f',
        }
      }
    },
  },
  plugins: [],
}
