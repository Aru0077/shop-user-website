<!-- src/components/common/NavBar.vue -->
<template>
      <div class="nav-bar flex items-center justify-between box-border h-[60px] px-2 w-full shadow-sm"
            :class="{ 'bg-white backdrop-blur-md shadow-sm': showBackground, 'bg-transparent': !showBackground }">
            <!-- 左侧按钮 -->
            <div class="flex items-center">

                  <!-- 显示logo -->
                  <template v-if="leftBtn === 'logo'">
                        <div
                              class="flex items-center justify-center rounded-full w-[40px] h-[40px] shadow-lg bg-gray-100">
                              <van-image :src="logoImg" fit="cover" width="30px" height="30px" />
                        </div>
                  </template>

                  <!-- 显示返回按钮 -->
                  <template v-if="leftBtn === 'back'">
                        <div class="bg-black text-white p-1 flex items-center justify-center rounded-full">
                              <ChevronLeft @click="handleLeftClick('back')" />
                        </div>
                  </template>

            </div>

            <!-- 右侧按钮 -->
            <div class="flex items-center">

                  <!-- 显示购物车 -->
                  <template v-if="rightBtn === 'cart'">
                        <div
                              class="flex items-center justify-center rounded-full w-[40px] h-[40px] shadow-lg bg-gray-100">
                              <ShoppingCart @click="handleShoppingCart" />
                              <!-- 购物车数量角标 -->
                              <div v-if="uniqueItemCount > 0"
                                    class="absolute top-0.5 right-0.5 w-1 h-2 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full">
                                    {{ uniqueItemCount > 99 ? '99+' : uniqueItemCount }}
                              </div>
                        </div>
                  </template>


                  <!-- 显示添加按钮 -->
                  <template v-else-if="rightBtn === 'add'">
                        <div class="bg-black text-white p-1 flex items-center justify-center rounded-full">
                              <Plus @click="handleRightClick('back')" />
                        </div>
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
import logoImg from '@/assets/images/unimall.png'
import { Plus, ChevronLeft, ShoppingCart } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/store/cart.store'
import { storeToRefs } from 'pinia'

// 获取购物车store
const cartStore = useCartStore()
const { uniqueItemCount } = storeToRefs(cartStore)

// 定义属性
defineProps({
      title: {
            type: String,
            default: ''
      },
      leftBtn: {
            type: String,
            default: 'logo' // 'back', 'logo', 
      },
      rightBtn: {
            type: String,
            default: 'none' // 'cart', 'add', 'none'
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


const handleShoppingCart = () => {
      router.push('/cart')
}


</script>

<style scoped>
.nav-bar {
      /* 处理iOS安全区 */
      padding-top: env(safe-area-inset-top);
}

.logo {
      width: 40px;
      height: 40px;
      /* border: 1px solid gray; */
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
}
</style>