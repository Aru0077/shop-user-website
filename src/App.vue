<!-- src/App.vue -->
<template>
  <div class="app-container">
    <!-- 离线模式提示条 -->
    <div v-if="offlineMode" class="offline-bar">
      <van-icon name="warning-o" />
      <span>当前处于离线模式，部分功能可能受限</span>
      <van-button v-if="isOnline" size="mini" type="primary" @click="syncOfflineData">
        同步数据
      </van-button>
    </div>
    
    <!-- 应用内容 -->
    <router-view />
    
    <!-- 全局加载指示器 -->
    <van-overlay :show="globalLoading" z-index="9999">
      <div class="global-loading">
        <van-loading type="spinner" color="#1989fa" size="36px" />
        <p>加载中...</p>
      </div>
    </van-overlay>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Overlay, Loading, Icon, Button, showNotify } from 'vant';
import networkService from '@/utils/networkService';
import useDataAccess from '@/composables/useDataAccess';
import { useUserStore } from '@/store/user.store';
import appInitializer from '@/utils/appInitializer';

// 引入组件
const VanOverlay = Overlay;
const VanLoading = Loading;
const VanIcon = Icon;
const VanButton = Button;

// 路由实例
const router = useRouter();

// 数据访问API
const dataAccess = useDataAccess();

// 用户存储
const userStore = useUserStore();

// 全局加载状态
const globalLoading = ref(false);

// 网络状态
const isOnline = computed(() => networkService.isOnline.value);

// 离线模式状态
const offlineMode = computed(() => 
  dataAccess.cartStore.offlineMode || 
  dataAccess.favoriteStore.offlineMode || 
  dataAccess.productStore.offlineMode
);

// 监听数据同步状态变化
watch([
  () => dataAccess.cartStore.hasOfflineChanges,
  () => dataAccess.favoriteStore.hasOfflineChanges
], () => {
  // 检查是否有未同步的数据
  const hasOfflineChanges = 
    dataAccess.cartStore.hasOfflineChanges || 
    dataAccess.favoriteStore.hasOfflineChanges;
  
  // 如果有未同步的数据且网络已恢复，提示用户同步
  if (hasOfflineChanges && isOnline.value) {
    showNotify({ 
      type: 'primary', 
      message: '检测到未同步的本地更改，点击顶部横幅进行同步' 
    });
  }
});

// 同步离线数据
const syncOfflineData = async () => {
  if (!isOnline.value) {
    showNotify({ 
      type: 'warning', 
      message: '网络连接不可用，请稍后再试' 
    });
    return;
  }
  
  globalLoading.value = true;
  
  try {
    // 使用统一数据访问API同步数据
    const success = await dataAccess.syncAllOfflineData();
    
    if (success) {
      showNotify({ 
        type: 'success', 
        message: '数据同步成功' 
      });
    }
  } catch (error) {
    console.error('同步离线数据失败:', error);
    showNotify({ 
      type: 'danger', 
      message: '数据同步失败，请稍后再试' 
    });
  } finally {
    globalLoading.value = false;
  }
};

// 监听路由变化
router.beforeEach((to, from, next) => {
  // 需要登录的路由
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth && !userStore.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

// 挂载时
onMounted(() => {
  // 初始化应用
  // main.ts中已处理初始化，这里只是为了确保组件特定的初始化
  
  // 检查网络状态
  networkService.checkNetworkStatus();
});
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.offline-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background-color: #fffbe8;
  color: #ed6a0c;
  font-size: 14px;
  border-bottom: 1px solid #ffe58f;
}

.offline-bar span {
  flex: 1;
  margin: 0 12px;
}

.global-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: white;
}

.global-loading p {
  margin-top: 12px;
  font-size: 14px;
}
</style>