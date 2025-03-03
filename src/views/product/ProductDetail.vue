<!-- src/views/product/ProductDetail.vue -->
<template>
    <div class="product-detail">
        <!-- Product Gallery Section -->
        <div class="product-gallery">
            <van-image v-if="productDetail && productDetail.mainImage" :src="productDetail.mainImage" fit="cover"
                class="w-full h-full rounded-lg" />
            <div v-else class="placeholder-image w-full h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                <van-loading type="spinner" size="24px" v-if="loading" />
                <span v-else class="text-gray-500">商品图片加载失败</span>
            </div>

            <!-- Additional Images Gallery (if available) -->
            <div v-if="productDetail && productDetail.detailImages"
                class="additional-images mt-2 grid grid-cols-4 gap-2">
                <div v-for="(image, index) in processedDetailImages" :key="index"
                    class="h-20 w-full bg-gray-100 rounded-md overflow-hidden">
                    <van-image :src="image" fit="cover" class="w-full h-full" />
                </div>
            </div>
        </div>

        <!-- Product Info Section -->
        <div class="product-info card my-3 p-4 rounded-lg shadow-sm">
            <!-- Loading State -->
            <van-loading v-if="loading" type="spinner" size="24px" class="my-4 flex justify-center" />

            <!-- Product Not Found -->
            <van-empty v-else-if="!productDetail" description="商品不存在或已下架" />

            <!-- Product Information -->
            <template v-else>
                <!-- Product Name -->
                <h1 class="text-xl font-bold mb-1">{{ productDetail.name }}</h1>

                <!-- Product Code -->
                <div class="text-gray-500 text-sm mb-2">
                    商品编码: {{ productDetail.productCode || '暂无' }}
                </div>

                <!-- Product Price -->
                <div class="price-container flex items-center mb-3 mt-2">
                    <span class="text-2xl font-bold text-red-500">{{ formatPrice(displayPrice) }}</span>
                    <span v-if="hasPromotion" class="ml-2 text-sm line-through text-gray-500">
                        {{ formatPrice(originalPrice) }}
                    </span>
                </div>

                <!-- Product Stock -->
                <div class="stock-info text-sm text-gray-600 mb-3">
                    库存: {{ availableStock }} 件
                </div>

                <!-- Specs Selection -->
                <div v-if="productDetail.specs && productDetail.specs.length > 0" class="specs-container mb-4">
                    <div v-for="spec in productDetail.specs" :key="spec.id" class="spec-group mb-3">
                        <div class="spec-title text-gray-700 mb-2">{{ spec.name }}</div>
                        <div class="spec-options flex flex-wrap gap-2">
                            <span v-for="value in spec.values" :key="value.id"
                                class="spec-option px-3 py-1 border rounded-full text-sm"
                                :class="selectedSpecs[spec.id] === value.id ? 'border-primary text-primary bg-primary-light' : 'border-gray-300'"
                                @click="selectSpec(spec.id, value.id)">
                                {{ value.value }}
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Quantity Selector -->
                <div class="quantity-container flex items-center justify-between mb-4 bg-gray-50 p-3 rounded-lg">
                    <span class="text-gray-700">购买数量</span>
                    <div class="flex items-center">
                        <van-button icon="minus" size="small" class="h-8 w-8 flex items-center justify-center"
                            :disabled="quantity <= 1" @click="quantity > 1 && quantity--" />
                        <span class="mx-4 text-lg min-w-8 text-center">{{ quantity }}</span>
                        <van-button icon="plus" size="small" class="h-8 w-8 flex items-center justify-center"
                            :disabled="quantity >= availableStock" @click="quantity < availableStock && quantity++" />
                    </div>
                </div>
            </template>
        </div>

        <!-- Product Details Section -->
        <div v-if="productDetail && !loading" class="product-details card p-4 rounded-lg shadow-sm">
            <h2 class="text-lg font-bold mb-3 pb-2 border-b border-gray-100">商品详情</h2>

            <!-- Category -->
            <div class="detail-item flex justify-between py-2 border-b border-gray-50">
                <span class="text-gray-500">分类</span>
                <span>{{ categoryName }}</span>
            </div>

            <!-- Sales Count -->
            <div class="detail-item flex justify-between py-2 border-b border-gray-50">
                <span class="text-gray-500">销量</span>
                <span>{{ productDetail.salesCount || 0 }}</span>
            </div>

            <!-- Content -->
            <div class="content-section mt-4">
                <div class="content text-gray-700" v-html="productDetail.content || '暂无详细描述'"></div>
            </div>

            <!-- Detail Images -->
            <div v-if="productDetail.detailImages" class="detail-images mt-4">
                <van-image v-for="(image, index) in processedDetailImages" :key="`detail-${index}`" :src="image"
                    fit="cover" class="w-full mb-2 rounded" />
            </div>
        </div>

        <!-- Bottom Action Bar -->
        <div v-if="productDetail"
            class="action-bar fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex items-center justify-between safe-area-bottom z-50">
            <div class="action-icons flex space-x-4 px-4">
                <div class="flex flex-col items-center justify-center py-2" @click="toggleFavorite">
                    <van-icon :name="isFavorited ? 'star' : 'star-o'" :color="isFavorited ? '#f2994a' : '#333'"
                        size="24" />
                    <span class="text-xs mt-1">收藏</span>
                </div>
                <div class="flex flex-col items-center justify-center py-2" @click="goToCart">
                    <van-icon name="cart-o" size="24" />
                    <span class="text-xs mt-1">购物车</span>
                </div>
            </div>
            <div class="action-buttons flex p-2">
                <van-button type="warning" block class="mr-2" @click="addToCart">加入购物车</van-button>
                <van-button type="danger" block @click="buyNow">立即购买</van-button>
            </div>
        </div>

        <!-- Spacer for Bottom Bar -->
        <div class="h-16"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showSuccessToast } from 'vant';
import { useProductStore } from '@/store/product.store';
import { useFavoriteStore } from '@/store/favorite.store';
import { useUserStore } from '@/store/user.store';
import { formatPrice } from '@/utils/formatPrice';
import type { ProductDetail as ProductDetailType, Sku } from '@/types/product.type';

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
const isFavorited = computed(() => favoriteStore.isProductFavorited(productId.value));

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
const loadProductDetail = async () => {
    try {
        loading.value = true;
        await productStore.loadProductDetail(productId.value);

        // Initialize spec selection
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
    loadProductDetail();

    // Initialize favorite status
    if (userStore.isLoggedIn) {
        favoriteStore.loadFavorites();
    }
});

onUnmounted(() => {
    productStore.clearCurrentProduct();
});
</script>

<style scoped>
.product-detail {
    /* padding-bottom: 60px; */
margin-top: -70px;
}

.product-gallery {
    width: 100%;
    background-color: white;
    overflow: hidden;
}

.card {
    background: white;
}

/* Primary color */
.text-primary {
    color: #ee0a24;
}

.bg-primary-light {
    background-color: rgba(238, 10, 36, 0.05);
}

.border-primary {
    border-color: #ee0a24;
}

/* Spec selection */
.spec-option {
    cursor: pointer;
    transition: all 0.2s;
}

.spec-option:active {
    transform: scale(0.98);
}

/* Product description */
.product-description .content {
    line-height: 1.6;
}

/* Action bar */
.action-bar {
    z-index: 100;
}

.action-buttons {
    flex: 1;
}
</style>