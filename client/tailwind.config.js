/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export default {
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [ 
      "light",
      "dark",
      "garden",
      "dim",
    ],
    darkTheme: "light",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
    themeRoot: ":root",
  }
}

