<!--  App.vue -->
<template>
  <div id="app" class="w-screen h-screen overflow-hidden flex flex-col">
    <!-- 顶部导航栏 - 固定高度 -->
    <div class="w-full z-20 flex-shrink-0">
      <nav-bar v-if="navBarConfig.show" :left-btn="navBarConfig.leftBtn" :right-btn="navBarConfig.rightBtn"
        :show-background="navBarConfig.showBackground" />
    </div>

    <!-- 中间内容区域 - 可滚动，占据剩余空间 -->
    <div class="flex-1 overflow-auto relative">
      <router-view v-slot="{ Component }">
        <keep-alive :include="['Home', 'Category', 'Cart', 'User']">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>

    <!-- 底部TabBar - 固定高度 -->
    <div v-if="showTabBar" class="w-full flex-shrink-0 z-20">
      <CustomTabBar />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useWindowSize } from "@/hooks/useWindowSize";
import NavBar from "./components/common/NavBar.vue";
import CustomTabBar from "./components/common/CustomTabBar.vue";
import { getOptimizationLevel, isFacebookBrowser } from "@/utils/browser";

// 优化级别
const optimizationLevel = ref(getOptimizationLevel());
const isFB = ref(isFacebookBrowser());

// 监听窗口大小变化，用于响应式设计
const { width } = useWindowSize();
const route = useRoute();

// 监听网络状态变化
const handleNetworkChange = () => {
  if (!navigator.onLine) {
    // 网络离线处理
    console.log("网络已断开");
  } else {
    // 网络恢复处理
    console.log("网络已连接");
  }
};

// 获取当前路由的导航栏配置
const navBarConfig = computed(() => {
  const defaultConfig = {
    show: false,
    leftBtn: "back",
    rightBtn: "none",
    showBackground: false,
  };

  return {
    ...defaultConfig,
    ...(route.meta.navBar || {}),
  };
});

// 获取当前路由的TabBar显示状态
const showTabBar = computed(() => {
  return route.meta.tabBar?.show ?? false;
});

onMounted(() => {
  // 添加网络状态监听
  window.addEventListener("online", handleNetworkChange);
  window.addEventListener("offline", handleNetworkChange);

  // 禁用浏览器默认的下拉刷新行为
  document.body.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  // 为Facebook浏览器添加特殊类
  if (isFB.value) {
    document.body.classList.add('fb-webview');
  }

  // 针对高优化级别减少动画
  if (optimizationLevel.value === 'high') {
    document.body.classList.add('reduce-animations');
  }

  const setupPerformanceOptimizations = () => {
    // 获取优化级别
    if (optimizationLevel.value === 'high') {
      // 针对高优化（低性能设备）完全禁用过渡动画
      document.body.classList.add('disable-animations');
    } else if (optimizationLevel.value === 'medium') {
      // 针对中等优化级别减少动画时间
      document.body.classList.add('reduce-animations');
    }
  };

  // 调用此函数
  setupPerformanceOptimizations();

});

onBeforeUnmount(() => {
  // 移除网络状态监听
  window.removeEventListener("online", handleNetworkChange);
  window.removeEventListener("offline", handleNetworkChange);
});
</script>


<style>
.fb-webview .fade-enter-active,
.fb-webview .fade-leave-active,
.fb-webview .slide-right-enter-active,
.fb-webview .slide-right-leave-active,
.reduce-animations .fade-enter-active,
.reduce-animations .fade-leave-active,
.reduce-animations .slide-right-enter-active,
.reduce-animations .slide-right-leave-active {
  transition: all 0.15s linear;
}

.disable-animations .fade-enter-active,
.disable-animations .fade-leave-active,
.disable-animations .slide-right-enter-active,
.disable-animations .slide-right-leave-active {
  transition: none !important;
}

.disable-animations .icon-wrapper,
.disable-animations .icon-wrapper::after {
  transition: none !important;
}
</style>