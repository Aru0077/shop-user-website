<!-- src/views/product/ProductDetail.vue -->
<template>
    <div class="flex flex-col h-full">
        <!-- 顶部固定区 -->
        <div class="flex-1 relative overflow-hidden">
            <!-- 顶部固定 Navbar -->
            <div class="absolute top-0 left-0 right-0 w-full h-[60px] bg-transparent z-50">
                <div class="nav-bar flex items-center justify-between box-border h-[60px] px-2 w-full">
                    <div
                        class=" bg-slate-300 text-black bg-transparent  p-1 flex items-center justify-center rounded-full">
                        <ChevronLeft @click="goBack" />
                    </div>
                    <div class="bg-slate-300 text-black p-1 flex items-center justify-center rounded-full"
                        @click="navigatorToCart">
                        <ShoppingCart />
                        <!-- 购物车数量角标 -->
                        <div v-if="uniqueItemCount > 0"
                            class="absolute top-0.5 right-0.5 w-1 h-2 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full">
                            {{ uniqueItemCount > 99 ? '99+' : uniqueItemCount }}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 上下滚动内容区 -->
            <div class="h-full overflow-y-auto">
                <!-- 主图 -->
                <div class=" z-10 relative">
                    <van-image v-if="productDetail && productDetail.mainImage" :src="productDetail.mainImage"
                        fit="cover" class="w-full aspect-square rounded-lg" />
                </div>

                <!-- 详情内容 -->
                <div v-if="productDetail"
                    class="absolute w-full h-auto bg-white -mt-2 z-20 rounded-t-lg py-3 px-2 box-border">

                    <div class="flex items-center justify-between">
                        <div class="text-[20px] font-bold">{{ productDetail.name }}</div>
                        <div class="text-[16px] text-gray-500">sales: {{ productDetail.salesCount }}</div>
                    </div>

                    <div class="text-[16px] text-gray-500 mt-2 formatted-content">{{ productDetail.content }}</div>

                    <div v-for="(item, index) in processedDetailImages" :key="index">
                        <van-image :src="item" fit="cover" />
                    </div>

                </div>
            </div>


        </div>

        <!-- 底部操作区 -->
        <div class="h-[70px] box-border pb-1 px-2 flex items-center justify-between">
            <div class="flex items-center justify-around gap-1">
                <div class=" bg-gray-200 text-black h-[50px] w-[50px] rounded-md box-border flex items-center justify-center"
                    @click="handleToggleFavorite">
                    <Heart :color="isProductFavorited ? '#FF4D4F' : 'black'"
                        :fill="isProductFavorited ? '#FF4D4F' : 'none'" />
                </div>
                <div class=" bg-gray-200 text-black h-[50px] w-[50px] rounded-md box-border flex items-center justify-center"
                    @click="handleToggleShare">
                    <Share2 />
                </div>

            </div>

            <div class="bg-black text-white flex justify-around items-center w-3/5 rounded-md h-[50px] px-2 box-border"
                @click="openSkuSelector">
                <ShoppingCart />
                <div class="text-[20px] ">Add to cart</div>
            </div>

        </div>


        <!-- SKU 选择器弹窗 -->
        <SkuPopupSelector v-if="productDetail" v-model:visible="skuPopupVisible" :product="productDetail"
            :initialSkuId="initialSkuId" @close="handlePopupClose" />



    </div>

</template>

<script setup lang="ts">
import { Share2, ChevronLeft, ShoppingCart, Heart } from 'lucide-vue-next'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showSuccessToast } from 'vant';
import { useProductStore } from '@/store/product.store';
import { useFavoriteStore } from '@/store/favorite.store';
import { useCartStore } from '@/store/cart.store';
import { storeToRefs } from 'pinia'
import SkuPopupSelector from '@/components/product/SkuPopupSelector.vue';

// 获取购物车store
const cartStore = useCartStore()
const { uniqueItemCount } = storeToRefs(cartStore);

// 初始化
const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const favoriteStore = useFavoriteStore();

// State variables
const loading = ref(true);
const productId = computed(() => Number(route.params.id));
const productDetail = computed(() => productStore.currentProduct);

// 弹窗组件状态 
const skuPopupVisible = ref(false);
const initialSkuId = ref<number | undefined>(undefined);

// 添加收藏状态计算属性
const isProductFavorited = computed(() => {
    return favoriteStore.isFavorite(productId.value);
});

// 添加收藏切换方法
const handleToggleFavorite = async () => {
    if (!productId.value) return;

    try {
        await favoriteStore.toggleFavorite(productId.value);
    } catch (error) {
        console.error('切换收藏状态失败:', error);
        showToast('操作失败，请稍后重试');
    }
};

// 处理分享
const handleToggleShare = () => {
    console.log('分享商品');
};

// 打开SKU选择器
const openSkuSelector = () => {
    skuPopupVisible.value = true;
};

// 处理弹窗关闭
const handlePopupClose = () => {
    console.log('SKU选择弹窗已关闭');
};


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
onMounted(async () => {
    document.title = '商品详情';
    // 如果用户已登录但尚未加载收藏列表，则加载
    if (favoriteStore.favoriteIds.length === 0) {
        await favoriteStore.loadFavoriteIds();
    }
    loadProductDetail(false); // 默认不强制刷新，优先使用缓存 
});

onUnmounted(() => {
    productStore.clearCurrentProduct();
});

// 返回上一页
const goBack = () => {
    router.back();
};


// 格式化 详情图片
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

// 跳转购物车
const navigatorToCart = () => {
    router.push('/cart');
};

</script>

<style scoped>
.formatted-content {
    white-space: pre-line;
    line-height: 1.5;
    word-wrap: break-word;
}

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