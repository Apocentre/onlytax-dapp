/** @type {import("tailwindcss").Config} */
export default {
  content: {
    files: ["./index.html", "./src/view/**/*.jsx"],
  },
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui"),
  ],
  daisyui: {
    themes: ["winter"],
  }
}

