/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bg: "#0b1220",
        fg: "#e8eef7",
        muted: "#a6b0c3",
        accent: "#2563eb",
        panel: "#121a2a",
      },
      fontFamily: {
        grotesk: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        inter: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

