// postcss.config.mjs
export default {
  plugins: {
    'postcss-import': {},
    'tailwindcss': {},
    'postcss-pxtorem': {
      rootValue: 37.5,
      propList: ['*'],
      selectorBlackList: ['.norem', '.van-']  // 添加 van- 前缀避免处理 Vant 组件
    },
    'autoprefixer': {}
  }
}