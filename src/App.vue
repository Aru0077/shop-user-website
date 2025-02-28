<!--  App.vue -->
<template>
  <div id="app" class="w-screen h-screen overflow-hidden flex flex-col">
    <!-- 顶部导航栏 - 固定高度 -->
    <div class="w-full z-20 flex-shrink-0">
      <nav-bar v-if="navBarConfig.show" :title="navBarConfig.title" :left-btn="navBarConfig.leftBtn"
        :right-btn="navBarConfig.rightBtn" :show-background="navBarConfig.showBackground" />
    </div>

    <!-- 中间内容区域 - 可滚动，占据剩余空间 -->
    <div class="flex-1 overflow-auto relative">
      <router-view v-slot="{ Component }">
        <keep-alive>
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
import { onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute } from "vue-router";
import { useWindowSize } from "@/hooks/useWindowSize";
import NavBar from "./components/common/NavBar.vue";
import CustomTabBar from "./components/common/CustomTabBar.vue";

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
    title: "",
    leftBtn: "back",
    rightBtn: "none",
    showBackground: false,
  };

  return {
    ...defaultConfig,
    ...(route.meta.navBar || {}),
  };
});

// 处理导航栏左侧按钮点击
const handleNavLeftClick = () => {
  // 可以在这里添加额外的处理逻辑
  console.log("左侧按钮点击");
};

// 处理导航栏右侧按钮点击
const handleNavRightClick = () => {
  // 可以在这里添加额外的处理逻辑
  console.log("右侧按钮点击");
};

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
});

onBeforeUnmount(() => {
  // 移除网络状态监听
  window.removeEventListener("online", handleNetworkChange);
  window.removeEventListener("offline", handleNetworkChange);
});
</script>

<style>
/* 移动端样式 */
@media (max-width: 767px) {
  .app-container {
    max-width: 100vw;
  }
}

/* PC端样式 */
@media (min-width: 768px) {
  .app-container {
    max-width: 768px;
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    height: 100vh;
  }
}
</style>
