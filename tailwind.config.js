/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{vue,js,ts,jsx,tsx}",
];
export const theme = {
  extend: {
    colors: {
      primary: '#1989fa', // 直接定义基础颜色
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
};
export const plugins = [];
export const corePlugins = {
  preflight: false,
};