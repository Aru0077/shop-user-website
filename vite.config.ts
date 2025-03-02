import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 自动导入组件
    Components({
      resolvers: [
        VantResolver({
          importStyle: true, // 自动导入对应的样式
        }),
      ],
      dts: true,
    }),
    // 构建分析 (添加命令行参数 --analyze 时启用)
    process.env.ANALYZE === 'true'
      ? visualizer({ open: true, brotliSize: true, filename: 'stats.html' })
      : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  css: {
    // 确保 PostCSS 配置被正确加载
    postcss: './postcss.config.mjs',
    // 提取CSS
    modules: {
      scopeBehaviour: 'local',
    },
  },
  server: {
    port: 5173,
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
    // 压缩选项
    minify: 'terser',
    // 构建时移除 console 和 debugger
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
    // 分块策略
    rollupOptions: {
      output: {
        // 更合理的代码分割策略
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vant')) return 'vendor-vant';
            if (id.includes('vue') || id.includes('@vue')) return 'vendor-vue';
            if (id.includes('pinia')) return 'vendor-pinia';
            return 'vendor'; // 所有其他依赖
          }
        },
        // 静态资源分类打包 
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'images/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // 启用 gzip 压缩
    reportCompressedSize: false,
    // chunk 大小警告的限制
    chunkSizeWarningLimit: 2000,
  },
})