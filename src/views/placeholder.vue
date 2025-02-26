<template>
      <div class="placeholder-page">
            <van-empty image="search" description="这是页面占位组件">
                  <template #bottom>
                        <van-button round type="primary" class="bottom-button">创建内容</van-button>
                  </template>
            </van-empty>
      </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Empty, Button } from 'vant'

export default defineComponent({
      name: 'PlaceholderPage',
      components: {
            [Empty.name]: Empty,
            [Button.name]: Button,
      },
})
</script>

<style scoped>
.placeholder-page {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      padding: 0 16px;
}

.bottom-button {
      width: 160px;
      margin-top: 16px;
}
</style>