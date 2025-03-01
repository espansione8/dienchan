/** @type {import('tailwindcss').Config} */

// do not use "export default { }" in guides https://tailwindcss.com/docs/guides/sveltekit define "module.exports = {}"
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      zIndex: {
        '9999': '9999',
      },
      keyframes: {
        colorFade: {
          '0%, 100%': { backgroundColor: 'rgba(26, 147, 220, 0.5)' }, // Very light primary
          '25%': { backgroundColor: 'rgba(41, 47, 167, 0.5)' }, // Very light accent
          '50%': { backgroundColor: 'rgba(26, 147, 220, 0.5)' }, // Light primary
          '75%': { backgroundColor: 'rgba(41, 47, 167, 0.5)' }, // Light accent
        },
      },
      animation: {
        'color-fade': 'colorFade 25s ease-in-out infinite',
      },
    },
  },

};
