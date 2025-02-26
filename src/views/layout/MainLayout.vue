<template>
      <div class="main-layout">
            <!-- 内容区域 -->
            <div class="content-container">
                  <router-view v-slot="{ Component }">
                        <keep-alive>
                              <component :is="Component" />
                        </keep-alive>
                  </router-view>
            </div>

            <!-- 底部导航栏 -->
            <van-tabbar v-model="active" route safe-area-inset-bottom>
                  <van-tabbar-item icon="home-o" to="/placeholder">首页</van-tabbar-item>
                  <van-tabbar-item icon="apps-o" to="/placeholder">分类</van-tabbar-item>
                  <van-tabbar-item icon="cart-o" to="/placeholder">购物车</van-tabbar-item>
                  <van-tabbar-item icon="user-o" to="/placeholder">我的</van-tabbar-item>
            </van-tabbar>
      </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { Tabbar, TabbarItem } from 'vant'
import { useWindowSize } from '@/hooks/useWindowSize'

export default defineComponent({
      name: 'MainLayout',
      components: {
            [Tabbar.name]: Tabbar,
            [TabbarItem.name]: TabbarItem,
      },
      setup() {
            const active = ref(0)
            const { isMobile } = useWindowSize()

            return {
                  active,
                  isMobile,
            }
      },
})
</script>

<style scoped>
.main-layout {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: #f7f8fa;
}

.content-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      /* 适配底部安全区域 */
      padding-bottom: 50px;
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