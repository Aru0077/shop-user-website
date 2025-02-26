export default {
  plugins: {
    'postcss-import': {},
    '@tailwindcss/postcss': {},
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*'],
      selectorBlackList: ['.norem']
    },
    'autoprefixer': {}
  }
}