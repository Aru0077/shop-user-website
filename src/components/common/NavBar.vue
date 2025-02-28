<!-- src/components/common/NavBar.vue -->
<template>
      <div class="nav-bar flex items-center justify-between box-border h-[60px] px-2 w-full"
            :class="{ 'bg-white backdrop-blur-md shadow-sm': showBackground, 'bg-transparent': !showBackground }">
            <!-- 左侧按钮 -->
            <div class="flex items-center">
                  <template v-if="leftBtn === 'back'">
                        <ChevronLeft @click="handleLeftClick('back')"
                              class="bg-black text-white p-1 rounded-full w-2 h-2 flex items-center justify-center cursor-pointer" />
                  </template>
                  <template v-else-if="leftBtn === 'home'">
                        <Home @click="handleLeftClick('home')"
                              class="bg-black text-white p-1 rounded-full w-2 h-2 flex items-center justify-center cursor-pointer" />
                  </template>
                  <template v-else-if="leftBtn === 'close'">
                        <X  @click="handleLeftClick('close')"
                              class="bg-black text-white p-1 rounded-full w-2 h-2 flex items-center justify-center cursor-pointer" />
                  </template>
                  <template v-else-if="leftBtn === 'custom'">
                        <slot name="left"></slot>
                  </template>
            </div>

            <!-- 右侧按钮 -->
            <div class="flex items-center">
                  <template v-if="rightBtn === 'more'">
                        <MoreHorizontal @click="handleRightClick('more')"
                              class="bg-black text-white p-1 rounded-full w-2 h-2 flex items-center justify-center cursor-pointer" />
                  </template>
                  <template v-else-if="rightBtn === 'search'">
                        <Search @click="handleRightClick('search')"
                              class="bg-black text-white p-1 rounded-full w-2 h-2 flex items-center justify-center cursor-pointer" />
                  </template>
                  <template v-else-if="rightBtn === 'share'">
                        <Share2 @click="handleRightClick('share')"
                              class="bg-black text-white p-1 rounded-full w-2 h-2 flex items-center justify-center cursor-pointer" />
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

// 处理左侧按钮点击 - 发送事件并根据按钮类型执行默认行为
const handleLeftClick = (type) => {
      // 先触发事件，允许父组件捕获并可能阻止默认行为
      emit('left-click', { type, preventDefault: false })
      
      // 执行默认行为
      if (type === 'back' || type === 'close') {
            router.back()
      } else if (type === 'home') {
            router.push('/')
      }
}

// 处理右侧按钮点击 - 只发送事件，不执行默认行为
const handleRightClick = (type) => {
      emit('right-click', { type })
}
</script>

<style scoped>
.nav-bar {
      /* 处理iOS安全区 */
      padding-top: env(safe-area-inset-top);
}
</style>