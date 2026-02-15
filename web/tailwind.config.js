// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(240, 10%, 4%)',
        foreground: 'hsl(0, 0%, 100%)',
        muted: 'hsl(240, 5%, 20%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        cinzel: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
};
