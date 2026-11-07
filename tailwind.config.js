/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#0F766E',
        navy: '#16324F',
        page: '#F5F8FA',
        card: '#FFFFFF',
        border: '#D9E2E8',
        gold: '#D6A756',
        success: '#15803D',
        danger: '#DC2626',
      },
    },
  },
  plugins: [],
}