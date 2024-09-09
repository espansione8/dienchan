/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

// do not use "export default { }" in guides https://tailwindcss.com/docs/guides/sveltekit define "module.exports = {}"
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      zIndex: {
        '9999': '9999',
      }
    },
  },
  plugins: [
    daisyui,
  ],
  daisyui: {
    //base: false, // uncomment to fix black background issue
    //themes: true,
    themes: [
      // {
      //   jobspronto: {
      //     // "primary": "#0F8C80",
      //     // "secondary": "#21A698",
      //     // "accent": "#6BBFB7",
      //     "primary": "#008080",
      //     "secondary": "#279E9D",
      //     "accent": "#4EBCBA",
      //     "neutral": "#1b263a",
      //     "base-100": "#fcfcff",
      //     "info": "#9BF6FF",
      //     "success": "#CAFFBF",
      //     "warning": "#FFD6A5",
      //     "error": "#FFADAD",
      //   },
      // },
      // "light",
      // "dark",
      // "cupcake",
      // "bumblebee",
      // "emerald",
      "corporate",
      // "synthwave",
      // "retro",
      // "cyberpunk",
      // "valentine",
      // "halloween",
      // "garden",
      // "forest",
      // "aqua",
      // "lofi",
      // "pastel",
      // "fantasy",
      // "wireframe",
      // "black",
      // "luxury",
      // "dracula",
      // "cmyk",
      // "autumn",
      // "business",
      // "acid",
      // "lemonade",
      // "night",
      // "coffee",
      // "winter",
      // "dim",
      // "nord",
      // "sunset",
    ],
  },
};
