<!-- src/views/product/ProductDetail.vue -->
<template>
    <div class="relative w-full overflow-hidden h-screen">

        <!-- 顶部 Navbar -->
        <div class="fixed top-0 left-0 right-0 w-full h-[60px] bg-transparent z-50">
            <div class="nav-bar flex items-center justify-between box-border h-[60px] px-2 w-full">
                <div class="bg-black text-white p-1 flex items-center justify-center rounded-full">
                    <ChevronLeft />
                </div>
                <div class="bg-black text-white p-1 flex items-center justify-center rounded-full">
                    <Share2 />
                </div>
            </div>
        </div>

        <!-- 上下滚动内容区 -->
        <div class="absolute top-0 left-0 right-0 overflow-y-auto h-full">
            <!-- 主图 -->
            <div class=" z-10 relative">
                <van-image v-if="productDetail && productDetail.mainImage" :src="productDetail.mainImage" fit="cover"
                    class="w-full aspect-square rounded-lg" />
            </div>

            <!-- 详情内容 -->
            <div v-if="productDetail"
                class="absolute w-full h-auto bg-white -mt-2 z-20 rounded-t-lg py-2 px-2 box-border">
                <div class="text-[20px] font-bold">{{ productDetail.name }}</div>

                <!-- SKU选择组件 -->
                <SkuSelector v-if="productDetail.specs && productDetail.skus" :specs="productDetail.specs"
                    :skus="productDetail.skus" v-model:selection="selectedSpecs" @sku-change="handleSkuChange" />

            </div>
        </div>



    </div>

</template>

<script setup lang="ts">
import { Share2, ChevronLeft } from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showSuccessToast } from 'vant';
import { useProductStore } from '@/store/product.store';
import { useFavoriteStore } from '@/store/favorite.store';
import { useUserStore } from '@/store/user.store';
import { formatPrice } from '@/utils/formatPrice';
import type { ProductDetail as ProductDetailType, Sku } from '@/types/product.type';
import SkuSelector from '@/components/product/SkuSelector.vue';

// Initialize
const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const favoriteStore = useFavoriteStore();
const userStore = useUserStore();

// State variables
const loading = ref(true);
const productId = computed(() => Number(route.params.id));
const productDetail = computed(() => productStore.currentProduct);
const quantity = ref(1);
const selectedSpecs = ref<Record<number, number>>({});
const isFavorited = computed(() => favoriteStore.isFavorite(productId.value));

// 处理SKU变更
const handleSkuChange = (sku) => {
  console.log('选中的SKU:', sku);
  // 更新价格、库存等信息
};

// Process detail images
const processedDetailImages = computed(() => {
    if (!productDetail.value || !productDetail.value.detailImages) return [];

    try {
        // Attempt to parse detail images if they're stored as JSON string
        if (typeof productDetail.value.detailImages === 'string') {
            const parsed = JSON.parse(productDetail.value.detailImages);
            return Array.isArray(parsed) ? parsed : [];
        }

        // If it's already an array
        if (Array.isArray(productDetail.value.detailImages)) {
            return productDetail.value.detailImages;
        }

        return [];
    } catch (e) {
        console.error('Error processing detail images:', e);
        return [];
    }
});

// Category name
const categoryName = computed(() => {
    if (!productDetail.value || !productDetail.value.category) return '未分类';
    return productDetail.value.category.name || '未分类';
});

// Get selected SKU
const selectedSku = computed<Sku | null>(() => {
    if (!productDetail.value || !productDetail.value.skus || productDetail.value.skus.length === 0) {
        return null;
    }

    // If no specs or specs not selected, return first SKU
    if (!productDetail.value.specs || productDetail.value.specs.length === 0 ||
        Object.keys(selectedSpecs.value).length === 0) {
        return productDetail.value.skus[0];
    }

    // Find matching SKU based on selected specs
    const matchingSku = productDetail.value.skus.find(sku => {
        if (!sku.sku_specs || sku.sku_specs.length === 0) return false;

        // Check if all selected specs match this SKU
        return sku.sku_specs.every(spec =>
            selectedSpecs.value[spec.specId] === spec.specValueId
        );
    });

    return matchingSku || productDetail.value.skus[0];
});

// Display price
const displayPrice = computed(() => {
    if (selectedSku.value) {
        return selectedSku.value.promotion_price !== undefined && selectedSku.value.promotion_price > 0
            ? selectedSku.value.promotion_price
            : selectedSku.value.price;
    }
    return 0;
});

// Original price
const originalPrice = computed(() => {
    if (selectedSku.value && selectedSku.value.price) {
        return selectedSku.value.price;
    }
    return 0;
});

// Check if product has promotion
const hasPromotion = computed(() => {
    return selectedSku.value &&
        selectedSku.value.promotion_price !== undefined &&
        selectedSku.value.promotion_price > 0 &&
        selectedSku.value.promotion_price < selectedSku.value.price;
});

// Available stock
const availableStock = computed(() => {
    if (selectedSku.value && selectedSku.value.stock !== undefined) {
        const stock = selectedSku.value.stock;
        const lockedStock = selectedSku.value.lockedStock || 0;
        return Math.max(0, stock - lockedStock);
    }
    return 0;
});

// Select specification
const selectSpec = (specId: number, valueId: number) => {
    selectedSpecs.value = { ...selectedSpecs.value, [specId]: valueId };
};

// Add to cart
const addToCart = () => {
    if (!userStore.isLoggedIn) {
        showToast('请先登录');
        router.push({ path: '/login', query: { redirect: route.fullPath } });
        return;
    }

    if (!selectedSku.value) {
        showToast('请选择商品规格');
        return;
    }

    if (availableStock.value <= 0) {
        showToast('商品库存不足');
        return;
    }

    // Call add to cart API (placeholder)
    showSuccessToast('已加入购物车');
};

// Buy now
const buyNow = () => {
    if (!userStore.isLoggedIn) {
        showToast('请先登录');
        router.push({ path: '/login', query: { redirect: route.fullPath } });
        return;
    }

    if (!selectedSku.value) {
        showToast('请选择商品规格');
        return;
    }

    if (availableStock.value <= 0) {
        showToast('商品库存不足');
        return;
    }

    // Navigate to checkout (placeholder)
    router.push('/payment');
};

// Toggle favorite
const toggleFavorite = async () => {
    if (!userStore.isLoggedIn) {
        showToast('请先登录');
        router.push({ path: '/login', query: { redirect: route.fullPath } });
        return;
    }

    try {
        const result = await favoriteStore.toggleFavorite(productId.value);
        if (result) {
            showSuccessToast(isFavorited.value ? '已取消收藏' : '已加入收藏');
        }
    } catch (error) {
        console.error('收藏操作失败:', error);
        showToast('操作失败，请稍后重试');
    }
};

// Go to cart
const goToCart = () => {
    router.push('/cart');
};

// Load product detail
// 加载商品详情
const loadProductDetail = async (forceRefresh = false) => {
    try {
        loading.value = true;

        // 判断是否已有数据且无需强制刷新
        if (!forceRefresh && productDetail.value && productDetail.value.id === productId.value) {
            loading.value = false;
            return;
        }

        await productStore.loadProductDetail(productId.value);

        // 初始化规格选择
        if (productDetail.value && productDetail.value.specs) {
            productDetail.value.specs.forEach(spec => {
                if (spec.values && spec.values.length > 0) {
                    selectedSpecs.value[spec.id] = spec.values[0].id;
                }
            });
        }
    } catch (error) {
        console.error('获取商品详情失败:', error);
        showToast('获取商品详情失败，请稍后重试');
    } finally {
        loading.value = false;
    }
};

// Watch for product ID changes
watch(() => productId.value, (newVal, oldVal) => {
    if (newVal !== oldVal) {
        loadProductDetail();
    }
}, { immediate: false });

// Lifecycle hooks
onMounted(() => {
    document.title = '商品详情';
    loadProductDetail(false); // 默认不强制刷新，优先使用缓存 
});

onUnmounted(() => {
    productStore.clearCurrentProduct();
});
</script>

<style scoped>
.nav-bar {
    /* 处理iOS安全区 */
    padding-top: env(safe-area-inset-top);
}





.product-detail {
    padding-bottom: 10px;
}

.product-gallery {
    width: 100%;
    background-color: white;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 规格选择样式 */
.spec-option {
    cursor: pointer;
    transition: all 0.2s ease;
}

.spec-option:active {
    transform: scale(0.98);
}

/* 操作按钮 */
.action-buttons button {
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.action-buttons button:active {
    transform: scale(0.98);
    opacity: 0.9;
}

/* 自定义数量控制按钮样式 */
.quantity-controls button {
    transition: all 0.2s;
}

.quantity-controls button:active {
    transform: scale(0.95);
    background-color: #f5f5f5;
}

.quantity-controls button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

/* 商品内容样式 */
.content {
    line-height: 1.8;
}

.content img {
    max-width: 100%;
    border-radius: 8px;
    margin: 10px 0;
}

/* 动画效果 */
.info-card,
.detail-card {
    transition: transform 0.3s ease;
}

/* 详情图片间距 */
.detail-images {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>