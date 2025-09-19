/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        coral: {
          400: '#DB5461',
          500: '#DB5461',
          600: '#c44752',
        },
        sage: {
          400: '#8AA29E',
          500: '#8AA29E',
          600: '#7a928e',
        },
        navy: {
          700: '#3D5467',
          800: '#3D5467',
          900: '#2d3e4f',
        },
        cream: {
          50: '#F1EDEE',
          100: '#F1EDEE',
          200: '#ede8ea',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}