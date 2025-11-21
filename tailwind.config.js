/** @type {import('tailwindcss').Config} */
export default {
  // A linha 'content' é a mais importante
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Garanta que isso inclua .jsx
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}