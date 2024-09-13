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
      {
        dienchan: {
          "primary": "#1a93dc",
          "secondary": "#f50101",
          "accent": "#292fa7",
          // "neutral": "#1b263a",
          // "base-100": "#fcfcff",
          "info": "#66d1ff",
          "success": "#48c78e",
          "warning": "#ffb70f",
          "error": "#ff6685",
        },
      },
      // "light",
      // "dark",
      // "cupcake",
      // "bumblebee",
      // "emerald",
      //  "corporate",
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
