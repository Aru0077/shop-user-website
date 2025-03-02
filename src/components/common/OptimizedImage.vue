<!-- src/components/common/OptimizedImage.vue -->
<template>
      <div class="optimized-image-wrapper" :class="{ 'fixed-height': fixedHeight }" :style="containerStyle">
            <!-- 加载状态占位符 -->
            <div v-if="loading" class="image-placeholder"></div>

            <!-- 错误状态提示 -->
            <div v-if="error" class="image-error">
                  <slot name="error">图片加载失败</slot>
            </div>

            <!-- 图片元素 -->
            <img :src="src" :alt="alt" :class="computedImageClass" @load="handleImageLoaded" @error="handleImageError"
                  loading="lazy" decoding="async" :fetchpriority="priority" />
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
      priority: {
            type: String,
            default: 'auto' // high, low, auto
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

// 计算容器样式
const containerStyle = computed(() => {
      if (props.fixedHeight) {
            return {}; // 固定高度模式不需要设置paddingBottom
      } else {
            return { paddingBottom: `${(1 / props.aspectRatio) * 100}%` };
      }
});

// 计算图片类名
const computedImageClass = computed(() => {
      const fitClass = `object-${props.objectFit}`;
      return props.imageClass ? `${props.imageClass} ${fitClass}` : fitClass;
});

// 图片加载完成处理
const handleImageLoaded = () => {
      loading.value = false;
};

// 图片加载错误处理
const handleImageError = () => {
      loading.value = false;
      error.value = true;
};

// 预加载处理在onMounted时进行
if (props.priority === 'high') {
      const preloadImage = new Image();
      preloadImage.src = props.src;
      preloadImage.onload = handleImageLoaded;
      preloadImage.onerror = handleImageError;
}
</script>

<style scoped>
.optimized-image-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      /* 默认高度为0，由paddingBottom控制实际高度 */
      overflow: hidden;
}

/* 固定高度模式样式 */
.optimized-image-wrapper.fixed-height {
      height: 100%;
      /* 使用父容器的100%高度 */
}

.image-placeholder {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: #f3f4f6;
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
}

/* 对象适应方式类 */
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