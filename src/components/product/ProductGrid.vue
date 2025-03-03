<!-- src/components/home/ProductGrid.vue -->
<template>
      <div class="product-grid">
            <!-- 使用v-memo以避免不必要的重渲染 -->
            <div class="grid grid-cols-2 gap-3">
                  <div v-for="(product, index) in products" :key="product.id" v-memo="[product.id, product.price]"
                        class="product-card" @click="handleProductClick(product)">
                        <!-- 图片容器 -->
                        <div class="relative overflow-hidden mb-0.5">
                              <OptimizedImage :src="product.imageUrl" :alt="product.title" :aspect-ratio="1"
                                    image-class="rounded-md" objectFit="cover" />
                        </div>

                        <!-- 产品信息 -->
                        <div class="px-1 flex flex-col items-center">
                              <div class="text-[14px] font-semibold text-black mb-0.5">{{ product.brand }}</div>
                              <div class="text-[14px] font-bold">{{ formatPrice(product.price) }}</div>
                        </div>
                  </div>
            </div>
      </div>
</template>

<script setup lang="ts">
import OptimizedImage from '@/components/common/OptimizedImage.vue';
import { formatPrice } from '@/utils/formatPrice'; // 导入价格格式化工具
import { useRouter } from 'vue-router';

// 设置
const router = useRouter();


// 定义商品类型
interface Product {
      id: string | number;
      brand: string;
      title: string;
      price: number;
      imageUrl: string;
}

// 设置默认值
const props = withDefaults(defineProps<{
      products: Product[];
      showLoadMore?: boolean;
}>(), {
      products: () => [],
      showLoadMore: false
});

// 定义事件
const emit = defineEmits(['load-more', 'click-product']);

// 商品点击事件 
const handleProductClick = (product: Product) => {
  // 先导航到产品详情页
  if (product && product.id) {
    router.push(`/product/detail/${product.id}`);
  }
  
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