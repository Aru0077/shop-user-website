<!-- src/views/product/ProductList.vue -->
<template>
    <div class="pageContent">
        <div class="px-[5px]">
            <div class="text-[25px] font-bold leading-4 text-black">{{ pageTitle }}</div>
        </div>

        <!-- 占位容器 -->
        <div style="height: 18px;"></div>

        <!-- 加载状态 -->
        <van-loading v-if="loading" type="spinner" size="24px" class="my-4 flex justify-center" />

        <!-- 空状态 -->
        <van-empty v-else-if="formattedProducts.length === 0" description="暂无商品" />

        <!-- 商品列表 -->
        <ProductGrid v-else :products="formattedProducts" :showLoadMore="hasMoreProducts" @load-more="loadMoreProducts"
            @click-product="handleProductClick" />

        <!-- 分页加载状态 -->
        <div v-if="loadingMore" class="py-3 flex justify-center">
            <van-loading type="spinner" size="20px" />
        </div>

        <!-- 没有更多数据提示 -->
        <div v-if="!hasMoreProducts && formattedProducts.length > 0" class="py-3 text-center text-gray-500 text-[16px]">
            没有更多商品了
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onActivated, onDeactivated, onBeforeUnmount, WatchStopHandle } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/store/product.store';
import ProductGrid from '@/components/product/ProductGrid.vue';
import { ProductSortType } from '@/types/product.type';
import { formatPrice } from '@/utils/formatPrice';

// 添加激活状态控制
const isActive = ref(false);
let unwatchRoute: WatchStopHandle | null = null;

// 初始化
const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const rawProducts = ref<any[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const page = ref(1);
const limit = ref(10);

// 从路由查询参数中获取列表类型和其他参数
const sourceType = computed(() => route.query.type as string || 'latest');
const sourceId = computed(() => route.query.id as string);
const sourceKeyword = computed(() => route.query.keyword as string);

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

// 格式化后的商品数据 - 确保所有必需属性存在
const formattedProducts = computed(() => {
    return rawProducts.value.map(product => ({
        id: product.id,
        brand: (product.name ? product.name.split(' ')[0] : '') || 'Brand',
        title: product.name || '商品名称',
        price: product.skus && product.skus.length > 0 && typeof product.skus[0].price === 'number'
            ? product.skus[0].price
            : 0,
        imageUrl: product.mainImage || 'https://img.js.design/assets/img/60f77157d961d24e3cf7493e.png'
    }));
});

// 是否有更多商品可加载
const hasMoreProducts = computed(() => {
    return productStore.paginationInfo.page < productStore.paginationInfo.totalPages;
});

// 标准化参数处理
const normalizeQueryParams = () => {
    return {
        type: sourceType.value || 'latest',
        id: sourceId.value ? Number(sourceId.value) : undefined,
        keyword: sourceKeyword.value || '',
        page: page.value,
        limit: limit.value,
    };
};

// 加载商品数据
const isLoading = ref(false);
const loadProducts = async (replace = true) => {
    // 防止重复请求
    if (isLoading.value) return;

    if (replace) {
        loading.value = true;
    } else {
        loadingMore.value = true;
    }

    isLoading.value = true;

    try {
        const params = normalizeQueryParams();
        const result = await productStore.loadProductsByType(params.type, params);

        if (replace) {
            rawProducts.value = result;
        } else {
            // 追加数据到现有列表
            rawProducts.value = [...rawProducts.value, ...result];
        }
    } catch (error) {
        console.error('加载商品失败:', error);
    } finally {
        loading.value = false;
        loadingMore.value = false;
        isLoading.value = false;
    }
};

// 加载更多商品
const loadMoreProducts = () => {
    if (loadingMore.value || !hasMoreProducts.value) return;

    page.value++;
    loadProducts(false);
};

// 处理商品点击 - 避免使用全局导航工具
const handleProductClick = (product: any) => {
    if (product && product.id) {
        router.push(`/product/detail/${product.id}`);
    }
};



// 清理路由监听
const clearRouteWatch = () => {
    if (unwatchRoute) {
        unwatchRoute();
        unwatchRoute = null;
    }
};

// 生命周期钩子
onMounted(() => {
    // 组件首次挂载时加载数据
    loadProducts(true);
});

onActivated(() => {
    isActive.value = true;

    // 组件被激活时，仅在必要时加载数据
    if (page.value === 1 || rawProducts.value.length === 0) {
        loadProducts(true);
    }

    // 激活时才添加路由监听
    clearRouteWatch(); // 先清理可能存在的监听
    unwatchRoute = watch(() => route.fullPath, () => {
        if (isActive.value) {
            page.value = 1;
            loadProducts(true);
        }
    });
});

onDeactivated(() => {
    isActive.value = false;
    clearRouteWatch();
});

// 组件卸载时的清理逻辑
onBeforeUnmount(() => {
    clearRouteWatch();

    // 重置状态，防止内存泄漏
    rawProducts.value = [];
    page.value = 1;
    loading.value = false;
    loadingMore.value = false;
    isLoading.value = false;
});
</script>

<style scoped></style>