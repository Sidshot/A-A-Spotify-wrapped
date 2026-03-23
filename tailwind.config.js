/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'San Francisco', 'sans-serif'],
      },
      colors: {
        theme: {
          bg: '#000000',
          text: '#FFFFFF',
          card: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
  },
  plugins: [],
}
