<template>
      <div class="custom-tabbar">
            <router-link v-for="item in tabItems" :key="item.path" :to="item.path" class="tabbar-item"
                  :class="{ active: route.path === item.path }">
                  <div class="icon-wrapper">
                        <component :is="item.icon" :size="24"
                              :color="route.path === item.path ? '#ffffff' : '#333333'" />
                  </div>
            </router-link>
      </div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-vue-next';

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
            text: '购物车',
            path: '/cart',
            icon: ShoppingCart
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
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 70px;
      border-radius: 30px 30px 0 0;
      background: rgba(255, 255, 255, 1);
      box-shadow: 0px -2px 7px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding-bottom: env(safe-area-inset-bottom);
      z-index: 100;
}

.tabbar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 25%;
      height: 100%;
      color: #333;
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
  transition: all 0.3s ease;
  overflow: hidden;
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
  transition: width 0.3s ease, height 0.3s ease;
  z-index: -1;
}

.tabbar-item.active .icon-wrapper::after {
  width: 100%;
  height: 100%;
}
.tabbar-item.active .icon-wrapper {
  border-radius: 50%;
}

/* 适配 PC 端 */
/* @media (min-width: 768px) {
      .custom-tabbar {
            max-width: 768px;
            margin: 0 auto;
            left: 50%;
            transform: translateX(-50%);
      }
} */
</style>