/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:   'rgb(var(--color-brand) / <alpha-value>)',
        navy:    'rgb(var(--color-navy) / <alpha-value>)',
        page:    'rgb(var(--color-page) / <alpha-value>)',
        card:    'rgb(var(--color-card) / <alpha-value>)',
        border:  'rgb(var(--color-border) / <alpha-value>)',
        gold:    'rgb(var(--color-gold) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        danger:  'rgb(var(--color-danger) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}