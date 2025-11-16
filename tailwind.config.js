/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          background: '#0b0b0d',
          cardDark: '#111113',
          purplePrimary: '#6a1bff',
          purpleLight: '#9b4dff',
          purpleGlow: '#b44bff',
          bluePrimary: '#3bb8ff',
          blueGlow: '#46eaff',
          textPrimary: '#ffffff',
          textSecondary: '#cfcfcf',
        },
      },
    },
  },
  plugins: [],
}

