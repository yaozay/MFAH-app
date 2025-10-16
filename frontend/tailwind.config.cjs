/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        mfah: {
          bg: "#0f0f12",
          card: "#16161b",
          accent: "#7c3aed",
        },
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(0,0,0,.35)",
      },
    },
  },
  plugins: [],
};
