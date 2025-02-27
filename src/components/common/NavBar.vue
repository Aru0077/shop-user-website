<!-- src/components/common/NavBar.vue -->
<template>
      <div class="fixed top-0 left-0 right-0 flex items-center justify-between z-100 px-5 pt-5 pb-0 box-border"
            :class="{ 'bg-white backdrop-blur-md': showBackground, 'bg-transparent': !showBackground }">
            <!-- 左侧按钮 -->
            <div class="flex items-center">
                  <template v-if="leftBtn === 'back'">
                        <ChevronLeft :size="20" @click="handleBack"
                              class="bg-black text-white p-2.5 rounded-full w-5 h-5 box-content cursor-pointer" />
                  </template>
                  <template v-else-if="leftBtn === 'home'">
                        <Home :size="20" @click="handleHome"
                              class="bg-black text-white p-2.5 rounded-full w-5 h-5 box-content cursor-pointer" />
                  </template>
                  <template v-else-if="leftBtn === 'close'">
                        <X :size="20" @click="handleClose"
                              class="bg-black text-white p-2.5 rounded-full w-5 h-5 box-content cursor-pointer" />
                  </template>
                  <template v-else-if="leftBtn === 'custom'">
                        <slot name="left"></slot>
                  </template>
            </div>

            <!-- 标题 -->
            <div class="text-lg font-medium text-center flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ title
                  }}</div>

            <!-- 右侧按钮 -->
            <div class="flex items-center">
                  <template v-if="rightBtn === 'more'">
                        <MoreHorizontal :size="20" @click="handleMore"
                              class="bg-black text-white p-2.5 rounded-full w-5 h-5 box-content cursor-pointer" />
                  </template>
                  <template v-else-if="rightBtn === 'search'">
                        <Search :size="20" @click="handleSearch"
                              class="bg-black text-white p-2.5 rounded-full w-5 h-5 box-content cursor-pointer" />
                  </template>
                  <template v-else-if="rightBtn === 'share'">
                        <Share2 :size="20" @click="handleShare"
                              class="bg-black text-white p-2.5 rounded-full w-5 h-5 box-content cursor-pointer" />
                  </template>
                  <template v-else-if="rightBtn === 'custom'">
                        <slot name="right"></slot>
                  </template>
            </div>
      </div>
</template>

<script lang="ts">
// 用于定义组件名称
export default {
      name: 'NavBar'
}
</script>

<script lang="ts" setup>
import { Home, X, MoreHorizontal, Search, Share2, ChevronLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

// 定义属性
defineProps({
      title: {
            type: String,
            default: ''
      },
      leftBtn: {
            type: String,
            default: 'back' // 'back', 'home', 'close', 'custom', 'none'
      },
      rightBtn: {
            type: String,
            default: 'none' // 'more', 'search', 'share', 'custom', 'none'
      },
      showBackground: {
            type: Boolean,
            default: false
      }
})

// 定义事件
const emit = defineEmits(['left-click', 'right-click'])

const router = useRouter()

// 处理返回按钮点击
const handleBack = () => {
      emit('left-click')
      router.back()
}

// 处理首页按钮点击
const handleHome = () => {
      emit('left-click')
      router.push('/')
}

// 处理关闭按钮点击
const handleClose = () => {
      emit('left-click')
      router.back()
}

// 处理更多按钮点击
const handleMore = () => {
      emit('right-click')
}

// 处理搜索按钮点击
const handleSearch = () => {
      emit('right-click')
}

// 处理分享按钮点击
const handleShare = () => {
      emit('right-click')
}
</script>