/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        sand: {
          50: '#fdfcfa',
          100: '#f7f4ef',
          200: '#efe9de',
          300: '#e4d9c6',
          400: '#d4c4a8',
          500: '#c4ae8a',
          600: '#a8906a',
          700: '#8c7555',
          800: '#735f46',
          900: '#5f4e3a',
        },
        desert: {
          50: '#fef7ed',
          100: '#fcecd5',
          200: '#f8d5ab',
          300: '#f3b875',
          400: '#ed913d',
          500: '#e97316',
          600: '#da5a0c',
          700: '#b5420c',
          800: '#903512',
          900: '#752e12',
        },
      },
      fontFamily: {
        display: ['Plus Jakarta Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
