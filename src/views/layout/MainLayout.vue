<template>
      <div class="main-layout">
            <!-- 内容区域 -->
            <div class="content-container" @scroll="handleScroll" ref="contentRef">
                  <router-view v-slot="{ Component }">
                        <keep-alive>
                              <component :is="Component" />
                        </keep-alive>
                  </router-view>
            </div>

            <!-- 底部导航栏 -->
            <CustomTabBar />
      </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import CustomTabBar from '@/components/layout/CustomTabBar.vue';
import { Tabbar, TabbarItem } from 'vant'
import { useWindowSize } from '@/hooks/useWindowSize'

export default defineComponent({
      name: 'MainLayout',
      components: {
            'van-tabbar': Tabbar,
            'van-tabbar-item': TabbarItem,
      },
      setup() {
            const active = ref(0)
            const { isMobile } = useWindowSize()
            const isHidden = ref(false)
            const contentRef = ref<HTMLElement | null>(null)
            let lastScrollTop = 0

            const handleScroll = (event: Event) => {
                  const target = event.target as HTMLElement
                  const scrollTop = target.scrollTop
                  
                  // 判断滚动方向
                  if (scrollTop > lastScrollTop) {
                        // 向上滚动，隐藏TabBar
                        isHidden.value = true
                  } else {
                        // 向下滚动，显示TabBar
                        isHidden.value = false
                  }
                  
                  lastScrollTop = scrollTop
            }

            return {
                  active,
                  isMobile,
                  isHidden,
                  contentRef,
                  handleScroll
            }
      },
})
</script>

<style scoped>
.main-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
}

.content-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      /* 适配底部安全区域 */
      padding-bottom: 50px;
}

/* 自定义TabBar样式 */
.custom-tabbar {
      border-radius: 30px 30px 0 0;
      background: rgba(255, 255, 255, 1);
      box-shadow: 0px -2px 7px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
}

/* TabBar隐藏时的样式 */
.tabbar-hidden {
      transform: translateY(100%);
}

/* TabBar内部样式 - 需用:deep才能影响到子组件 */
:deep(.van-tabbar-item--active) {
      color: white;
}

:deep(.van-tabbar-item--active .van-icon) {
      background-color: #1989fa;
      border-radius: 50%;
      padding: 4px;
      margin-bottom: 4px;
      color: white;
}

:deep(.van-tabbar-item) {
      color: #000;
}

/* PC 端样式 */
@media (min-width: 768px) {
      .main-layout {
            max-width: 768px;
            margin: 0 auto;
            border-left: 1px solid #ebedf0;
            border-right: 1px solid #ebedf0;
      }
}
</style>