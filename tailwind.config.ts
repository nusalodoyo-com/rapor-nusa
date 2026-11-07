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
          500: '#00ab00', // Logo primary green
          600: '#009600',
          700: '#007800',
          800: '#045e07',
          900: '#064e0a',
          950: '#012b05',
        },
        madrasah: {
          50: '#eafbea',
          100: '#cef7cf',
          200: '#a3efa5',
          300: '#6de271',
          400: '#35d13b',
          500: '#00ab00',
          600: '#009600',
          700: '#007800',
          800: '#045e07',
          900: '#064e0a',
          950: '#012b05',
        },
      },
      screens: {
        print: { raw: 'print' },
      },
    },
  },
  plugins: [],
};
export default config;
