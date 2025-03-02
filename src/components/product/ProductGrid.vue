<!-- src/components/home/ProductGrid.vue -->
<template>
      <div class="product-grid">
            <!-- 商品网格列表 -->
            <div class="grid grid-cols-2 gap-3">
                  <div v-for="(product, index) in products" :key="index" class="product-card">
                        <!-- 商品图片容器 -->
                        <div class="relative overflow-hidden mb-0.5">
                              <OptimizedImage :src="product.imageUrl" :alt="product.title" :aspect-ratio="1"
                                    image-class="rounded-md" objectFit="cover" />
                        </div>

                        <!-- 商品信息 -->
                        <div class="px-1">
                              <!-- 品牌名称 -->
                              <div class="text-[14px] font-semibold text-black mb-0.5">{{ product.brand }}</div>

                              <!-- 商品名称 -->
                              <!-- <div class="text-[10px] text-gray-600 mb-0.5">{{ product.title }}</div> -->

                              <!-- 商品价格 -->
                              <div class="text-[14px] font-bold">${{ product.price.toFixed(2) }}</div>
                        </div>
                  </div>
            </div>
      </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, withDefaults } from 'vue';
import OptimizedImage from '@/components/common/OptimizedImage.vue';

// 定义商品类型
interface Product {
      id: string | number;
      brand: string;
      title: string;
      price: number;
      imageUrl: string;
}

// 定义组件属性
interface Props {
      products: Product[];
      showLoadMore?: boolean;
}

// 设置默认值
const props = withDefaults(defineProps<Props>(), {
      products: () => [],
      showLoadMore: false
});

// 定义事件
const emit = defineEmits(['load-more', 'click-product']);

// 加载更多商品
const loadMore = () => {
      emit('load-more');
};

// 商品点击事件
const handleProductClick = (product: Product) => {
      emit('click-product', product);
};
</script>

<style scoped>
.product-grid {
      width: 100%;
}

.product-card {
      display: flex;
      flex-direction: column;
      cursor: pointer;
      transition: transform 0.2s ease;
}

.product-card:active {
      transform: scale(0.98);
}
</style>