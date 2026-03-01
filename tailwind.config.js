/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Yapari', 'Outfit', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [require("@heroui/react").heroui()],
}
