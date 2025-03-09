<!-- 收藏列表页面 -->
<template>
    <div class="pageContent">
        <!-- 顶部标题 -->
        <div class="px-[5px]">
            <div class="text-[25px] font-bold leading-4 text-black">My Favorites</div>
        </div>

        <!-- 空状态展示 -->
        <div v-if="favoriteStore.favorites.length === 0 && !favoriteStore.loading"
            class="flex flex-col items-center justify-center h-[300px]">
            <HeartOff :size="48" class="text-gray-300 mb-4" />
            <div class="text-gray-400">暂无收藏商品</div>
            <div class="mt-4">
                <van-button type="primary" size="small" @click="goToHome">去逛逛</van-button>
            </div>
        </div>

        <!-- 单个收藏商品 -->
        <van-grid :column-num="2" gutter="1" :border="false" v-if="favoriteStore.favorites.length > 0"
            :loading="favoriteStore.loading">
            <van-grid-item v-for="(item, index) in favoriteStore.favorites" :key="index" class="relativ"
                @click="goToProductDetail(String(item.product?.id))">
                <van-image :src="item.product?.mainImage" fit="cover" radius="20px" />
                <div class="text-[16px] font-bold mt-1">{{ item.product?.name }}</div>
                <div class="text-[14px] font-medium mt-0.5">{{ formatPrice(getLowestPrice(item.product)) }}</div>
                <Trash2 @click="removeItem(item)" :size="20"
                    class=" absolute top-2 right-1 bg-black text-white p-0.5 rounded-sm" />

            </van-grid-item>
        </van-grid>

        <!-- 加载更多 -->
        <div v-if="favoriteStore.favorites.length > 0 && favoriteStore.favorites.length < favoriteStore.total"
            class="flex justify-center py-4">
            <van-button plain type="primary" size="small" @click="loadMore" :loading="loadingMore">加载更多</van-button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useFavoriteStore } from '@/store/favorite.store';
import { useCartStore } from '@/store/cart.store';
import { useRouter } from 'vue-router';
import { showNotify, showToast } from 'vant';
import { Trash2, HeartOff } from 'lucide-vue-next';
import { formatPrice } from '@/utils/formatPrice';

const favoriteStore = useFavoriteStore();
const cartStore = useCartStore();
const router = useRouter();
const loadingMore = ref(false);

// 获取商品最低价格
const getLowestPrice = (product: any): number => {
    // 检查product和skus是否存在
    if (!product || !product.skus || !Array.isArray(product.skus) || product.skus.length === 0) {
        return 0; // 无有效sku时返回0
    }

    // 提取最低价格：比较所有sku的常规价格和促销价格
    return Math.min(
        ...product.skus.map((sku) => {
            // 如果有促销价且不为null，使用促销价；否则使用常规价格
            const effectivePrice = sku.promotion_price !== null && sku.promotion_price !== undefined
                ? sku.promotion_price
                : sku.price;

            return effectivePrice;
        })
    );
};

// 移除收藏项
const removeItem = async (item: any) => {
    const success = await favoriteStore.removeFromFavorite(item.productId);
    if (success) {
        showNotify({ type: 'success', message: '已移除收藏' });
    }
};



// 加载更多
const loadMore = async () => {
    if (loadingMore.value) return;

    loadingMore.value = true;
    try {
        const nextPage = favoriteStore.page + 1;
        await favoriteStore.loadFavorites(nextPage, favoriteStore.limit);
    } catch (error) {
        showToast('加载失败，请稍后再试');
    } finally {
        loadingMore.value = false;
    }
};

// 跳转到首页
const goToHome = () => {
    router.push('/');
};

// 跳转到商品详情页
const goToProductDetail = (productId: string) => {
    router.push(`/product/detail/${productId}`);
};

// 初始化加载
onMounted(async () => {
    await favoriteStore.preloadFavoriteData();
});
</script>

<style scoped>
.favoriteItem:last-child {
    border-bottom: none;
}

.add-to-cart-btn {
    border: none;
}

::v-deep .van-grid-item__content {
    background-color: #FAFAFA;
}
</style>