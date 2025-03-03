<!-- 简化版 src/components/common/OptimizedImage.vue -->
<template>
      <div class="optimized-image-wrapper" :class="{ 'fixed-height': fixedHeight }" :style="containerStyle">
            <!-- 只在加载中时显示占位符 -->
            <div v-if="loading" class="image-placeholder"></div>

            <!-- 图片元素 -->
            <img :src="src" :alt="alt" :class="[imageClass, `object-${objectFit}`]" @load="loading = false"
                  @error="handleImageError" loading="lazy" decoding="async" />
      </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 组件属性定义
const props = defineProps({
      src: {
            type: String,
            required: true
      },
      alt: {
            type: String,
            default: ''
      },
      aspectRatio: {
            type: Number,
            default: 1 // 默认1:1
      },
      imageClass: {
            type: String,
            default: ''
      },
      objectFit: {
            type: String,
            default: 'cover' // cover, contain, fill
      },
      fixedHeight: {
            type: Boolean,
            default: false // 是否使用固定高度模式
      }
});

// 状态变量
const loading = ref(true);
const error = ref(false);

// 计算容器样式 - 简化
const containerStyle = computed(() =>
      props.fixedHeight ? null : { paddingBottom: `${(1 / props.aspectRatio) * 100}%` }
);

// 图片加载错误处理
const handleImageError = () => {
      loading.value = false;
      error.value = true;
};
</script>

<style scoped>
.optimized-image-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      overflow: hidden;
}

.fixed-height {
      height: 100%;
}

.image-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
}

.loading-pulse {
      width: 30%;
      height: 30%;
      background-color: #e5e7eb;
      border-radius: 50%;
      animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
      0% {
            opacity: 0.3;
            transform: scale(0.8);
      }

      50% {
            opacity: 0.5;
            transform: scale(1);
      }

      100% {
            opacity: 0.3;
            transform: scale(0.8);
      }
}

.image-error {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f3f4f6;
      color: #6b7280;
      font-size: 12px;
}

img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      transition: opacity 0.2s ease-in-out;
}

.object-cover {
      object-fit: cover;
}

.object-contain {
      object-fit: contain;
}

.object-fill {
      object-fit: fill;
}
</style>