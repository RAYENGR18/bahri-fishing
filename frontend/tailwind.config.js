/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", /* <--- C'est la ligne MAGIQUE */
  ],
  theme: {
    extend: {
      colors: {
        'bahri-blue': '#005f73',
        'bahri-light': '#e0fbfc',
      }
    },
  },
  plugins: [],
}