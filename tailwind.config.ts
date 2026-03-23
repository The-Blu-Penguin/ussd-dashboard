import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './app/**/*.{vue,js,ts}',
    './nuxt.config.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        vibes: {
          DEFAULT: '#005686',
          50: '#e5f3fa',
          100: '#cce6f4',
          200: '#99ceea',
          300: '#66b5df',
          400: '#339dd5',
          500: '#0084ca',
          600: '#006a9e',
          700: '#005686', // Primary brand color
          800: '#004064',
          900: '#002a43',
          950: '#001a2a',
        }
      }
    }
  }
}
