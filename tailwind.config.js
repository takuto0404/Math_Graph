/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Avenir Next", "Hiragino Sans", "Yu Gothic", "sans-serif"],
        serif: ["Iowan Old Style", "Georgia", "serif"],
      },
      boxShadow: {
        panel: "0 24px 70px rgba(15, 23, 42, 0.16)",
      },
      colors: {
        ink: {
          50: "#f7fbff",
          100: "#edf5ff",
          200: "#d9e8ff",
          300: "#b6d0ff",
          400: "#7caaf7",
          500: "#3f7ce8",
          600: "#275dd0",
          700: "#1d469f",
          800: "#1a376f",
          900: "#172b51",
        },
      },
    },
  },
  plugins: [],
};
