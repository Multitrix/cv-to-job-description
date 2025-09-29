/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design palette colors
        primary: '#0D3B66', // Yale blue - professional & trustworthy
        accent: '#06B6D4', // Teal/Cyan - modern, fresh highlight
        background: '#FAF0CA', // Lemon Chiffon - clean and neutral
        'text-body': '#1E293B', // Dark gray for body text
        'text-header': '#0F172A', // Black for headers
        success: '#16A34A', // Green for positive messages

        // Additional shades for flexibility
        'primary-light': '#1f4b7d',
        'primary-dark': '#062955',
        'accent-light': '#22d3ee',
        'accent-dark': '#0891b2',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

