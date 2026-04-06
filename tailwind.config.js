/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {"50":"#f2f0ff","100":"#e0dbff","200":"#cdc5ff","300":"#bbb0ff","400":"#a99bff","500":"#9785ff","600":"#8570ff","700":"#735bff","800":"#6150ff","900":"#4f44ff","950":"#4237ff"},
        secondary: {"50":"#fff0f3","100":"#ffdde1","200":"#ffc1cc","300":"#ff9aa7","400":"#ff728b","500":"#ff49a6","600":"#e62b8c","700":"#cc1c73","800":"#b30c5a","900":"#990040","950":"#800033"},
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        serif: ['"Merriweather"', 'serif'],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
