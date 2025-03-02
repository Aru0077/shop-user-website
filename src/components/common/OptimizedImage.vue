<!-- 修改 src/components/common/OptimizedImage.vue -->
<template>
      <div class="optimized-image-wrapper" :class="{ 'fixed-height': fixedHeight }" :style="containerStyle">
            <!-- 加载状态占位符 -->
            <div v-if="loading" class="image-placeholder">
                  <div class="loading-pulse"></div>
            </div>

            <!-- 错误状态提示 -->
            <div v-if="error" class="image-error">
                  <slot name="error">图片加载失败</slot>
            </div>

            <!-- 图片元素 -->
            <img :src="imageSrc" :srcset="generateSrcSet" :alt="alt" :class="computedImageClass"
                  @load="handleImageLoaded" @error="handleImageError" loading="lazy" decoding="async"
                  :fetchpriority="priority" />
      </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

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
      },
      sizes: {
            type: String,
            default: '100vw' // 响应式图片尺寸
      }
});

// 状态变量
const loading = ref(true);
const error = ref(false);

// 计算容器样式，使用will-change提升为合成层
const containerStyle = computed(() => {
      const style = props.fixedHeight
            ? { willChange: 'transform' }
            : { paddingBottom: `${(1 / props.aspectRatio) * 100}%`, willChange: 'transform' };
      return style;
});

// 使用WebP格式（如果浏览器支持）
const imageSrc = computed(() => {
      // 如果支持WebP，优先使用WebP格式
      const supportsWebP = navigator.userAgent.indexOf('Safari') === -1 ||
            navigator.userAgent.indexOf('Chrome') > -1;
      const webpParam = supportsWebP && !props.src.includes('.svg') ? '&format=webp' : '';

      // 添加宽度参数，实现响应式图片
      return `${props.src}?width=${window.innerWidth}${webpParam}`;
});

// 生成响应式图片srcset
const generateSrcSet = computed(() => {
      if (!props.src) return '';
      const supportsWebP = navigator.userAgent.indexOf('Safari') === -1 ||
            navigator.userAgent.indexOf('Chrome') > -1;
      const webpParam = supportsWebP && !props.src.includes('.svg') ? '&format=webp' : '';

      // 返回多种尺寸的图片，支持各种屏幕密度
      return `
    ${props.src}?width=480${webpParam} 480w,
    ${props.src}?width=800${webpParam} 800w,
    ${props.src}?width=1200${webpParam} 1200w
  `;
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

// 高优先级图片预加载
onMounted(() => {
      if (props.priority === 'high') {
            const preloadImage = new Image();
            preloadImage.src = props.src;
            preloadImage.onload = handleImageLoaded;
            preloadImage.onerror = handleImageError;
      }
});
</script>

<style scoped>
.optimized-image-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      overflow: hidden;
      transform: translateZ(0);
      /* 创建硬件加速层 */
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