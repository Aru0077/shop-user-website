<template>
  <div id="app" class="app-container">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onBeforeUnmount } from 'vue'
import { useWindowSize } from '@/hooks/useWindowSize'

export default defineComponent({
  name: 'App',
  setup() {
    // 监听窗口大小变化，用于响应式设计
    const { width } = useWindowSize()

    // 监听网络状态变化
    const handleNetworkChange = () => {
      if (!navigator.onLine) {
        // 网络离线处理
        console.log('网络已断开')
      } else {
        // 网络恢复处理
        console.log('网络已连接')
      }
    }

    onMounted(() => {
      // 添加网络状态监听
      window.addEventListener('online', handleNetworkChange)
      window.addEventListener('offline', handleNetworkChange)

      // 禁用浏览器默认的下拉刷新行为
      document.body.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault()
        }
      }, { passive: false })
    })

    onBeforeUnmount(() => {
      // 移除网络状态监听
      window.removeEventListener('online', handleNetworkChange)
      window.removeEventListener('offline', handleNetworkChange)
    })

    return {
      width
    }
  }
})
</script>

<style>
.app-container {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  background-color: #f7f8fa;
}

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