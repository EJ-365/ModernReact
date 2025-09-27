export default {
  content: ["../*.{html,js}", "../**/*.{html,js}"],
  safelist: [
    'bg-main-color',
    'text-main-color',
    'border-main-color'
  ],
  theme: {
    extend: {
      colors: {
        'main-color': '#f7931e'  // Orange
      }
    },
  },
}