<!-- src/views/product/ProductList.vue -->
<template>
    <div class="pageContent">
        <!-- 标题显示 -->
        <div class="flex justify-between items-center mb-4">
            <div class="text-[20px] font-bold">{{ pageTitle }}</div>
        </div>

        <!-- 排序筛选区域 -->
        <div class="sort-filters mb-4" v-if="showSortOptions">
            <van-dropdown-menu>
                <van-dropdown-item v-model="sortType" :options="sortOptions" @change="handleSortChange" />
            </van-dropdown-menu>
        </div>

        <!-- 加载状态 -->
        <van-loading v-if="loading" type="spinner" size="24px" class="my-4 flex justify-center" />

        <!-- 空状态 -->
        <van-empty v-else-if="products.length === 0" description="暂无商品" />

        <!-- 商品列表 -->
        <ProductGrid 
            v-else 
            :products="products" 
            :showLoadMore="hasMoreProducts" 
            @load-more="loadMoreProducts"
            @click-product="navigateToProductDetail" 
        />

        <!-- 分页加载状态 -->
        <div v-if="loadingMore" class="py-3 flex justify-center">
            <van-loading type="spinner" size="20px" />
        </div>

        <!-- 没有更多数据提示 -->
        <div v-if="!hasMoreProducts && products.length > 0" class="py-3 text-center text-gray-500 text-sm">
            没有更多商品了
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/store/product.store';
import ProductGrid from '@/components/product/ProductGrid.vue';
import { ProductSortType } from '@/types/product.type';

// 初始化
const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const products = ref<any[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const page = ref(1);
const limit = ref(10);

// 从路由查询参数中获取列表类型和其他参数
const sourceType = computed(() => route.query.type as string || 'latest');
const sourceId = computed(() => route.query.id as string);
const sourceKeyword = computed(() => route.query.keyword as string);

// 排序相关
const sortType = ref(ProductSortType.NEWEST);
const showSortOptions = computed(() => 
    ['category', 'search'].includes(sourceType.value)
);

// 排序选项
const sortOptions = [
    { text: '最新上架', value: ProductSortType.NEWEST },
    { text: '价格从低到高', value: ProductSortType.PRICE_ASC },
    { text: '价格从高到低', value: ProductSortType.PRICE_DESC },
    { text: '销量优先', value: ProductSortType.SALES }
];

// 页面标题
const pageTitle = computed(() => {
    switch (sourceType.value) {
        case 'category':
            const category = productStore.getCategoryById(Number(sourceId.value));
            return category ? category.name : '分类商品';
        case 'latest':
            return '最新上架';
        case 'topselling':
            return '热卖商品';
        case 'promotion':
            return '促销商品';
        case 'search':
            return `搜索：${sourceKeyword.value}`;
        default:
            return '商品列表';
    }
});

// 是否有更多商品可加载
const hasMoreProducts = computed(() => {
    return productStore.paginationInfo.page < productStore.paginationInfo.totalPages;
});

// 处理排序变化
const handleSortChange = () => {
    // 重置页码并重新加载
    page.value = 1;
    loadProducts(true);
};

// 加载商品数据
const loadProducts = async (replace = true) => {
    if (replace) {
        loading.value = true;
    } else {
        loadingMore.value = true;
    }

    try {
        const params = {
            id: sourceId.value,
            keyword: sourceKeyword.value,
            page: page.value,
            limit: limit.value,
            sort: sortType.value
        };

        const result = await productStore.loadProductsByType(sourceType.value, params);
        
        if (replace) {
            products.value = result;
        } else {
            // 追加数据到现有列表
            products.value = [...products.value, ...result];
        }
    } finally {
        loading.value = false;
        loadingMore.value = false;
    }
};

// 加载更多商品
const loadMoreProducts = () => {
    if (loadingMore.value || !hasMoreProducts.value) return;
    
    page.value++;
    loadProducts(false);
};

// 导航到商品详情
const navigateToProductDetail = (product: any) => {
    router.push(`/product/detail/${product.id}`);
};

// 监听路由变化，处理不同来源
watch(
    () => route.fullPath,
    () => {
        // 重置状态
        page.value = 1;
        sortType.value = ProductSortType.NEWEST;
        // 重新加载数据
        loadProducts(true);
    }
);

// 组件挂载时加载数据
onMounted(() => {
    loadProducts(true);
});

// // 从首页搜索跳转
// router.push({ 
//     path: '/product/list', 
//     query: { type: 'search', keyword: searchValue } 
// });

// // 从分类页跳转
// router.push({ 
//     path: '/product/list', 
//     query: { type: 'category', id: category.id } 
// });

// // 从新品点击更多跳转
// router.push({ path: '/product/list', query: { type: 'latest' } });

// // 从热卖点击更多跳转
// router.push({ path: '/product/list', query: { type: 'topselling' } });

// // 从促销banner跳转
// router.push({ path: '/product/list', query: { type: 'promotion' } });


</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>