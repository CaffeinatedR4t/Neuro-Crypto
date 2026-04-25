/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Barlow'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
        cond: ["'Barlow Condensed'", "sans-serif"],
      },
    },
  },
  plugins: [],
};
