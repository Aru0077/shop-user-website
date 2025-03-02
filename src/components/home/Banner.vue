<!-- src/components/home/Banner.vue -->
<template>
      <div class="relative h-[160px] rounded-[20px] overflow-hidden cursor-pointer" @click="handleBannerClick">
            <!-- 背景图片 -->
            <OptimizedImage :src="imageUrl" :alt="title" priority="high" image-class="w-full h-full" objectFit="cover"
                  :fixedHeight="true" />

            <!-- 内容层 -->
            <div
                  class="absolute top-0 left-0 p-[15px_15px_17px_15px] h-[130px] flex flex-col items-start justify-between">
                  <!-- 文本区域 -->
                  <div class="flex flex-col h-full items-start justify-around pb-1.5">
                        <!-- 主标题 -->
                        <div class="text-[25px] font-bold text-black">{{ title }}</div>

                        <!-- 副标题 -->
                        <div class="text-[16px] font-normal text-black">{{ subtitle }}</div>

                        <!-- 描述文本 -->
                        <div class="text-[11px] font-semibold text-[#666666]">{{ description }}</div>
                  </div>

                  <!-- 按钮 -->
                  <button class="w-[70px] h-[25px] bg-black rounded-[30px] flex items-center justify-center"
                        @click.stop="handleButtonClick">
                        <span class="text-[10px] font-bold leading-[15px] text-white">Get Now</span>
                  </button>
            </div>
      </div>
</template>

<script setup lang="ts">
import OptimizedImage from '@/components/common/OptimizedImage.vue';

// 定义属性
const props = defineProps({
      // 背景图片URL
      imageUrl: {
            type: String,
            default: 'https://picsum.photos/800/160'  // 使用随机图片作为默认值
      },
      // 主标题
      title: {
            type: String,
            default: '限时优惠'
      },
      // 副标题
      subtitle: {
            type: String,
            default: '新人专享优惠券'
      },
      // 描述文本
      description: {
            type: String,
            default: '有效期至2025年3月31日'
      }
});

// 定义事件
const emit = defineEmits(['banner-click', 'button-click']);

// 处理整个banner的点击事件
const handleBannerClick = () => {
      emit('banner-click');
};

// 处理按钮的点击事件
const handleButtonClick = (event) => {
      emit('button-click');
      // 阻止事件冒泡，避免触发banner的点击事件
      event.stopPropagation();
};
</script>