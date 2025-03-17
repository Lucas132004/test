/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#eaefeb',
          100: '#d5dfd7',
          200: '#b1c0b4',
          300: '#8da192',
          400: '#69816f',
          500: '#45624c',  // Muted Forest Green
          600: '#334939',  // Dark Muted Forest
          700: '#223026',  // Very Dark Forest
          800: '#111813',
          900: '#080c09'
        },
        ocean: {
          50: '#e6eef1',
          100: '#ccdde3',
          200: '#99bbc7',
          300: '#6699ab',
          400: '#33778f',
          500: '#1a5161',  // Muted Ocean Blue
          600: '#133d48',  // Dark Muted Ocean
          700: '#0d2930',  // Very Dark Ocean
          800: '#061418',
          900: '#030a0c'
        },
        sand: {
          50: '#f7f3ed',
          100: '#efe7db',
          200: '#dfcfb7',
          300: '#cfb793',
          400: '#bf9f6f',
          500: '#a3855c',  // Muted Sand
          600: '#7a6445',  // Dark Muted Sand
          700: '#52432e',  // Very Dark Sand
          800: '#292117',
          900: '#14110c'
        },
        navy: {
          600: '#1a2f66',
          700: '#111f44',
          800: '#091022'
        }
      },
      fontFamily: {
        sans: ['Roboto Slab', 'serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Amatic SC', 'cursive']
      }
    },
  },
  plugins: [],
};