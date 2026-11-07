import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eafbea',
          100: '#cef7cf',
          200: '#a3efa5',
          300: '#6de271',
          400: '#35d13b',
          500: '#00ab00', // Kufic logo primary
          600: '#009600',
          700: '#007800',
          800: '#045e07',
          900: '#064e0a',
          950: '#012b05',
        },
        retro: {
          bg: '#f4f3ec',
          card: '#ffffff',
          dark: '#0e1511',
          black: '#121814',
          yellow: '#ffc83b',
          orange: '#ff5e36',
          teal: '#008b8b',
          blue: '#1b6ca8',
          cream: '#fdfbf7',
          border: '#121814',
        },
      },
      boxShadow: {
        'retro-sm': '2px 2px 0px 0px #121814',
        'retro': '4px 4px 0px 0px #121814',
        'retro-lg': '6px 6px 0px 0px #121814',
        'retro-xl': '8px 8px 0px 0px #121814',
        'retro-brand': '4px 4px 0px 0px #00ab00',
        'retro-yellow': '4px 4px 0px 0px #ffc83b',
        'retro-white': '4px 4px 0px 0px #ffffff',
        'retro-white-lg': '6px 6px 0px 0px #ffffff',
      },
      screens: {
        xs: '475px',
        print: { raw: 'print' },
      },
    },
  },
  plugins: [],
};
export default config;
