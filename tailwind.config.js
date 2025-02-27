/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1989fa',
        'primary-dark': '#0570db',
        'primary-light': '#4dabfc',
        success: '#07c160',
        danger: '#ee0a24',
        warning: '#ff976a',
        info: '#909399',
      },
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      fontSize: {
        'xs': '.75rem',
        'sm': '.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 保留此设置以避免与 Vant 样式冲突
  }
}