<template>
  <div class="pageContent">
    <div class="px-[5px]">
      <div class="text-[25px] font-bold leading-4 text-black">Welcome,</div>
      <div class="text-[20px] font-bold leading-4 text-gray-600">Uni Mall Website</div>
    </div>

    <!-- 占位容器 -->
    <div style="height: 18px;"></div>

    <!-- 顶部搜索框 -->
    <SearchBar placeholder="Search..." v-model:value="searchValue" @search="onSearch" @clear="onClear" />

    <!-- 占位容器 -->
    <div style="height: 30px;"></div>

    <!-- 加载状态 -->
    <van-loading v-if="loading" type="spinner" size="24px" class="my-4 flex justify-center" />

    <template v-else>
      <!-- banner -->
      <Banner :imageUrl="homeData?.banner?.imageUrl || 'https://img.js.design/assets/img/60f77156d961d24e3cf74934.png'"
        :title="homeData?.banner?.title || '30% Off'" :subtitle="homeData?.banner?.content || 'On everything today'"
        description="Limited time offer" @banner-click="handleBannerClick" @button-click="handleButtonClick" />

      <!-- 占位容器 -->
      <div style="height: 30px;"></div>

      <!-- 新品推荐 -->
      <div class="flex items-end justify-between mb-1.5 mt-1">
        <div class="text-[18px] font-bold text-black">New Arrivals</div>
        <div class="text-[11px] text-gray-700 cursor-pointer" @click="viewAllLatest">View All</div>
      </div>
      <!-- 商品宫格列表 -->
      <ProductGrid :products="formattedLatestProducts" @click-product="navigateToProductDetail" />

      <!-- 占位容器 -->
      <div style="height: 30px;"></div>

      <!-- 热销商品 -->
      <div class="flex items-end justify-between mb-1.5 mt-1">
        <div class="text-[18px] font-bold text-black">Top Selling</div>
        <div class="text-[11px] text-gray-700 cursor-pointer" @click="viewAllTopSelling">View All</div>
      </div>
      <!-- 商品宫格列表 -->
      <ProductGrid :products="formattedTopSellingProducts" @click-product="navigateToProductDetail" />
    </template>

    <!-- 错误提示 -->
    <van-empty v-if="error" description="加载失败，请下拉刷新重试" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showLoadingToast, closeToast } from 'vant';
import SearchBar from '@/components/home/SearchBar.vue';
import Banner from '@/components/home/Banner.vue';
import ProductGrid from '@/components/product/ProductGrid.vue';
import { navigateToProductList, navigateToProductDetail } from '@/utils/navigation';
import { useProductStore } from '@/store/product.store';
import { useFavoriteStore } from '@/store/favorite.store';

import { ProductSortType, HomeData } from '@/types/product.type';

// 初始化路由和状态管理
const router = useRouter();
const productStore = useProductStore();
const favoriteStore = useFavoriteStore();

// 状态定义
const loading = ref(false);
const error = ref(false);
const searchValue = ref('');
const isPageActive = ref(true);

// 首页数据
const homeData = computed<HomeData | null>(() => productStore.getHomeDataValue);


// 格式化最新商品数据
const formattedLatestProducts = computed(() => {
  return (homeData.value?.latestProducts || []).map(product => ({
    id: product.id,
    brand: product.name.split(' ')[0] || 'Brand', // 使用商品名称的第一部分作为品牌名
    title: product.name,
    price: product.skus?.[0]?.price || 0,
    imageUrl: product.mainImage || 'https://img.js.design/assets/img/60f77157d961d24e3cf7493e.png'
  })).slice(0, 4); // 仅显示前4个商品
});

// 格式化热卖商品数据
const formattedTopSellingProducts = computed(() => {
  return (homeData.value?.topSellingProducts || []).map(product => ({
    id: product.id,
    brand: product.name.split(' ')[0] || 'Brand',
    title: product.name,
    price: product.skus?.[0]?.price || 0,
    imageUrl: product.mainImage || 'https://img.js.design/assets/img/60f77157d961d24e3cf74937.png'
  })).slice(0, 4); // 仅显示前4个商品
});

// 搜索按钮点击事件
const onSearch = (value: string) => {
  if (value.trim()) {
    showLoadingToast({ message: '搜索中...', duration: 300 });

    // 使用工具函数导航到搜索结果页
    navigateToProductList(router, {
      type: 'search',
      keyword: value.trim()
    });
  }
};

// 清空搜索框内容
const onClear = () => {
  searchValue.value = '';
};

// 点击banner
const handleBannerClick = () => {
  // 跳转到促销商品页面
  navigateToProductList(router, {
    type: 'promotion'
  });
};

// 点击banner中的按钮
const handleButtonClick = () => {
  // 跳转到促销商品页面，可以传递额外参数
  navigateToProductList(router, {
    type: 'promotion',
    sort: ProductSortType.PRICE_ASC  // 按价格从低到高排序
  });
};

// 查看所有最新商品
const viewAllLatest = () => {
  navigateToProductList(router, {
    type: 'latest'
  });
};

// 查看所有热卖商品
const viewAllTopSelling = () => {
  navigateToProductList(router, {
    type: 'topselling'
  });
};

// 加载首页数据
const loadHomeData = async () => {
  try {
    if (loading.value) return;

    loading.value = true;
    error.value = false;

    // 使用ProductStore获取首页数据，不强制刷新，会优先使用缓存
    await productStore.loadHomeData(false);

  } catch (err) {
    console.error('加载首页数据失败:', err);
    error.value = true;
    showToast({ message: '加载失败，请重试', type: 'fail' });
  } finally {
    loading.value = false;
  }
};


// 组件挂载时加载数据
onMounted(() => {
  // 如果预加载数据已存在，直接使用，不重新加载
  if (homeData.value) {
    loading.value = false;
  } else {
    loadHomeData();
  }
});

// 组件被激活时（从其他页面返回时）
onActivated(() => {
  isPageActive.value = true;
  // 检查是否需要刷新数据，延长到30分钟
  const lastUpdateTime = localStorage.getItem('homeLastUpdate');
  const now = Date.now();

  // 只有超过30分钟才刷新数据
  if (!homeData.value || (!lastUpdateTime || (now - parseInt(lastUpdateTime)) > 30 * 60 * 1000)) {
    loadHomeData();
    localStorage.setItem('homeLastUpdate', now.toString());
  }
});
</script>

<style scoped>
/* 样式保持不变 */
</style>