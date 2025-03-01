// src/store/index.ts
import { createPinia } from 'pinia';

// 导出 Store 模块
export * from './modules/user'; 

// 创建 pinia 实例
const pinia = createPinia();

export default pinia;