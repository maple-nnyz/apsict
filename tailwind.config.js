/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
	  "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans Thai", "Kanit", "ui-sans-serif", "system-ui", "Arial"],
        heading: ["Kanit", "Noto Sans Thai", "ui-sans-serif", "system-ui"],
      }
    },
  },
  plugins: [require('daisyui')],
}

