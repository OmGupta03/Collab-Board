/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["DM Sans", "system-ui", "sans-serif"],
        nunito:  ["Nunito", "sans-serif"],
        caveat:  ["Caveat", "cursive"],
      },
      colors: {
        brand: {
          50:  "#F5F0FF",
          100: "#EDE9FE",
          500: "#8B5CF6",
          600: "#7C3AED",
          700: "#6D28D9",
        },
        board: {
          bg:     "#F5F0EB",
          card:   "#FFFDE7",
          dot:    "#C8B8A2",
        },
      },
    },
  },
  plugins: [],
};