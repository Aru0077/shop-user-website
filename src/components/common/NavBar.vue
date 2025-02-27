<!-- src/components/common/NavBar.vue -->
<template>
      <div class="nav-bar" :class="{ 'with-background': showBackground }">
            <!-- 左侧按钮 -->
            <div class="left-btn">
                  <template v-if="leftBtn === 'back'">
                        <van-icon name="arrow-left" size="20" @click="handleBack" />
                  </template>
                  <template v-else-if="leftBtn === 'home'">
                        <van-icon name="wap-home" size="20" @click="handleHome" />
                  </template>
                  <template v-else-if="leftBtn === 'close'">
                        <van-icon name="cross" size="20" @click="handleClose" />
                  </template>
                  <template v-else-if="leftBtn === 'custom'">
                        <slot name="left"></slot>
                  </template>
            </div>

            <!-- 标题 -->
            <div class="title">{{ title }}</div>

            <!-- 右侧按钮 -->
            <div class="right-btn">
                  <template v-if="rightBtn === 'more'">
                        <van-icon name="ellipsis" size="20" @click="handleMore" />
                  </template>
                  <template v-else-if="rightBtn === 'search'">
                        <van-icon name="search" size="20" @click="handleSearch" />
                  </template>
                  <template v-else-if="rightBtn === 'share'">
                        <van-icon name="share" size="20" @click="handleShare" />
                  </template>
                  <template v-else-if="rightBtn === 'custom'">
                        <slot name="right"></slot>
                  </template>
            </div>
      </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Icon } from 'vant'
import { useRouter } from 'vue-router'

export default defineComponent({
      name: 'NavBar',
      components: {
            'van-icon': Icon
      },
      props: {
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
      },
      emits: ['left-click', 'right-click'],
      setup(props, { emit }) {
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

            return {
                  handleBack,
                  handleHome,
                  handleClose,
                  handleMore,
                  handleSearch,
                  handleShare
            }
      }
})
</script>

<style scoped>
.nav-bar {
      position: fixed;
      top: 44px;
      left: 0;
      right: 0;
      height: 53px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 100;
      padding: 0 25px;
      box-sizing: border-box;
      background-color: transparent;
}

.nav-bar.with-background {
      background-color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
}

.title {
      font-size: 18px;
      font-weight: 500;
      text-align: center;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
}

.left-btn,
.right-btn {
      min-width: 24px;
      display: flex;
      align-items: center;
}
</style>