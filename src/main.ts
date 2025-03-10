// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'vant/lib/index.css';

// 导入工具和服务
import appInitializer from '@/utils/appInitializer';
import networkService from '@/utils/networkService';
import { useUserStore } from '@/store/user.store';

// 创建应用实例
const app = createApp(App);

// 创建Pinia实例
const pinia = createPinia();

// 挂载Pinia
app.use(pinia);

// 挂载路由
app.use(router);

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err);
  console.log('组件实例:', instance);
  console.log('错误信息:', info);
  
  // 在生产环境可以将错误发送到监控服务
  if (import.meta.env.PROD) {
    // 发送到错误监控服务
    // sendToErrorMonitoring(err, info);
  }
};

// 启动应用前的初始化
async function initializeApp() {
  console.log('🚀 启动应用中...');
  
  try {
    // 启动网络监控
    networkService.startActiveChecking();
    
    // 初始化应用数据
    await appInitializer.initialize();
    
    // 设置网络状态监听
    appInitializer.setupNetworkListeners();
    
    // 如果用户已登录，检查并初始化用户数据
    const userStore = useUserStore();
    if (userStore.isLoggedIn && !userStore.isInitialized) {
      console.log('用户已登录，初始化用户数据...');
      await userStore.initUserData();
    }
    
    console.log('✅ 应用初始化成功');
  } catch (error) {
    console.error('❌ 应用初始化失败:', error);
    // 应用初始化失败不阻止应用挂载，但可能影响用户体验
  } finally {
    // 挂载应用
    app.mount('#app');
    console.log('✅ 应用已挂载');
  }
}

// 启动应用初始化
initializeApp();

// 定期检查和刷新数据
setInterval(() => {
  // 静默初始化 - 用于后台刷新数据
  appInitializer.silentInitialize();
}, 30 * 60 * 1000); // 30分钟