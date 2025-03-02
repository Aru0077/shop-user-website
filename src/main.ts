import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { Lazyload } from 'vant';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { Icon } from "@iconify/vue";

// 导入全局样式
import './assets/styles/tailwind.css'
import './assets/styles/index.css'

// 移动端适配
import 'amfe-flexible'

// 创建应用实例
const app = createApp(App)

// 注册icon
app.component('Icon', Icon);

// 注册 Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

//使用pinia
app.use(pinia)

// 注册路由
app.use(router)

// 注册 Vant 懒加载
app.use(Lazyload, {
      lazyComponent: true,
      loading: '/src/assets/images/loading-placeholder.png',
      error: '/src/assets/images/error-placeholder.png',
})

// 注册全局属性
app.config.globalProperties.$filters = {
      // 价格格式化
      formatPrice(price: number | string): string {
            return `¥${Number(price).toFixed(2)}`
      },
}

// 性能监控
if (process.env.NODE_ENV !== 'production') {
      app.config.performance = true
}

// 挂载应用
app.mount('#app')

// 注册Service Worker (只在生产环境和支持Service Worker的浏览器中)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
      window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                  .then(registration => {
                        console.log('SW registered: ', registration.scope);
                  })
                  .catch(error => {
                        console.log('SW registration failed: ', error);
                  });
      });
}