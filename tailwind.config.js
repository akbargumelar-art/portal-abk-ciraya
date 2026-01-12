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
          DEFAULT: '#F13B4B',
          dark: '#D92939',
          light: '#FF6B78',
        },
        secondary: {
          DEFAULT: '#1E3A5F',
          dark: '#0F1D30',
          light: '#2E5A8F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
