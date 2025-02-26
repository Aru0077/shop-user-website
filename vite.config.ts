import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { createStyleImportPlugin, VantResolve } from 'vite-plugin-style-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 自动导入组件
    Components({
      resolvers: [VantResolver()],
    }),
    // 按需导入样式
    createStyleImportPlugin({
      resolves: [VantResolve()],
      libs: [
        {
          libraryName: 'vant',
          esModule: true,
          resolveStyle: (name) => `vant/es/${name}/style/index`,
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  css: {
    // 确保 PostCSS 配置被正确加载
    postcss: './postcss.config.mjs',
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://your-api-server.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // 构建优化
  build: {
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 构建时移除 console 和 debugger
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 分块策略
    rollupOptions: {
      output: {
        // 将依赖拆分成不同的块
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          vant: ['vant'],
          utils: ['axios', 'lodash-es', 'dayjs'],
        },
        // 静态资源分类打包
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 启用 gzip 压缩
    reportCompressedSize: false,
    // chunk 大小警告的限制
    chunkSizeWarningLimit: 2000,
  },
})