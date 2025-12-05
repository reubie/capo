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
      screens: {
        // Mobile phones (5" to 6.9")
        'xs': '320px',      // Small phones (5")
        'sm': '375px',      // iPhone X, iPhone 11-13 (5.8"-6.1")
        'md': '414px',      // iPhone 14-16, Samsung S series (6.1"-6.9")
        
        // Tablets (11" to 14")
        'tablet': '768px',   // 11" iPad
        'tablet-lg': '1024px', // 12.9" iPad Pro, 14" iPad Pro
        
        // Laptops (13" to 16")
        'laptop': '1280px',  // 13" laptop
        'laptop-lg': '1440px', // 16" laptop
        
        // Desktop monitors
        'desktop-sm': '1366px',  // 14" monitor
        'desktop': '1680px',     // 21" monitor
        'desktop-lg': '1920px',  // 25" monitor
        'desktop-xl': '2560px',  // 32" monitor
        'desktop-2xl': '2880px', // 35" monitor
        'desktop-3xl': '3440px', // 40" monitor
        'desktop-4xl': '3840px', // 50" monitor (4K)
        'desktop-5xl': '4096px', // 55" monitor
        'desktop-6xl': '5120px', // 65" monitor
        'desktop-7xl': '5760px', // 75" monitor
        'desktop-8xl': '6400px', // 85" monitor
        'desktop-9xl': '7680px', // 100" monitor (8K)
      },
    },
  },
  plugins: [],
}

