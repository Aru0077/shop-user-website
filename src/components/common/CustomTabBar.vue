<template>
      <div class="custom-tabbar safe-area-bottom">
            <router-link v-for="item in tabItems" :key="item.path" :to="item.path" class="tabbar-item"
                  :class="{ active: route.path === item.path }">
                  <div class="icon-wrapper">
                        <component :is="item.icon" :size="24"
                              :color="route.path === item.path ? '#ffffff' : '#000'" />
                  </div>
            </router-link>
      </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { Home, LayoutGrid, Heart, User } from 'lucide-vue-next';

const route = useRoute();

const tabItems = [
      {
            text: '首页',
            path: '/home',
            icon: Home
      },
      {
            text: '分类',
            path: '/category',
            icon: LayoutGrid
      },
      {
            text: '收藏',
            path: '/favorite',
            icon: Heart
      },
      {
            text: '我的',
            path: '/user',
            icon: User
      }
];
</script>

<style scoped>
.custom-tabbar {
      height: 70px;
      border-radius: 30px 30px 0 0;
      background: rgba(255, 255, 255, 1);
      box-shadow: 0px -2px 7px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-around;
      align-items: center;
      width: 100%;
      z-index: 100;
      position: relative; /* 添加相对定位，创建定位上下文 */
      transform: translateZ(0); /* 创建层叠上下文 */
}

.tabbar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 25%;
      height: 100%;
      color: #000;
      text-decoration: none;
      position: relative;
}

.icon-wrapper {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all 0.15s ease;
      overflow: hidden;
      z-index: 1;
      will-change: transform; /* 告知浏览器此元素将变化，启用GPU加速 */
}

.icon-wrapper::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background-color: #000;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.15s ease, height 0.15s ease;
      z-index: -1;
      will-change: width, height; /* 优化渲染 */
}

.tabbar-item.active .icon-wrapper::after {
      width: 100%;
      height: 100%;
}

.tabbar-item.active .icon-wrapper {
      border-radius: 50%;
}
</style>