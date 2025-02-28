<template>
    <div class="pageContent">
        <div class="px-[5px]">
            <div class="homeTitle">Welcome,</div>
            <div class="homeTitle2">Uni Mall Website</div>
        </div>

        <!-- 占位容器 -->
        <div style="height: 18px;"></div>

        <!-- 顶部搜索框 -->
        <SearchBar placeholder="Search..." v-model:value="searchValue" @search="onSearch" @clear="onClear" />

        <!-- 占位容器 -->
        <div style="height: 30px;"></div>

        <!-- banner -->
        <Banner imageUrl="https://img.js.design/assets/img/60f77156d961d24e3cf74934.png" title="30% Off"
            subtitle="On everything today" description="Updated on 2025-2-3" @banner-click="handleBannerClick"
            @button-click="handleButtonClick" />

            <!-- 占位容器 -->
        <div style="height: 30px;"></div>

        <!-- 商品宫格列表 -->
        <ProductGrid :products="productList" :showLoadMore="hasMoreProducts" @load-more="loadMoreProducts"
            @click-product="navigateToProductDetail" />
    </div>
</template>

<script lang="ts" setup> 
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SearchBar from '@/components/home/SearchBar.vue';
import Banner from '@/components/home/Banner.vue';
import ProductGrid from '@/components/product/ProductGrid.vue';

const router = useRouter()
const hasMoreProducts = ref(true);

// 搜索值
const searchValue = ref('');

// 搜索按钮点击事件
const onSearch = (value) => {
    console.log('搜索内容:', value);
    // 这里可以添加搜索逻辑，如跳转到搜索结果页或调用搜索API
};

// 清空搜索框内容
const onClear = () => {
    console.log('清空搜索');
    // 清空搜索相关处理
};

// 点击banner
const handleBannerClick = () => {
    console.log('点击banner');
    // 清空搜索相关处理
};

// 点击banner 中的按钮
const handleButtonClick = () => {
    console.log('点击banner');
    // 清空搜索相关处理
};

// 商品数据示例
const productList = ref([
  {
    id: 1,
    brand: 'The Marc Jacobs',
    title: 'Traveler Tote',
    price: 195.00,
    imageUrl: 'https://img.js.design/assets/img/60f77157d961d24e3cf7493e.png'
  },
  {
    id: 2,
    brand: 'Axel Arigato',
    title: 'Clean 90 Triple Sneakers',
    price: 245.00,
    imageUrl: 'https://img.js.design/assets/img/60f77157d961d24e3cf74937.png'
  },
  {
    id: 3,
    brand: 'Axel Arigato',
    title: 'Clean 90 Triple Sneakers',
    price: 245.00,
    imageUrl: 'https://img.js.design/assets/img/60f77157d961d24e3cf7493e.png'
  },
  {
    id: 4,
    brand: 'Axel Arigato',
    title: 'Clean 90 Triple Sneakers',
    price: 245.00,
    imageUrl: 'https://img.js.design/assets/img/60f77157d961d24e3cf74937.png'
  },
  // 更多商品...
]);

// 加载更多商品函数
const loadMoreProducts = () => {
  // 实现加载更多商品的逻辑
  // 例如调用API获取更多商品
};

// 点击商品跳转到详情页
const navigateToProductDetail = (product) => {
  router.push(`/product/detail/${product.id}`);
};


</script>

<style scoped>
.spacing {
    height: 20px;
}

.homeLogo {
    color: #fff;
    background-color: #000;
    padding: 10px;
    border-radius: 50%;
}

.homeTitle {
    /** 文本1 */
    font-size: 25px;
    font-weight: 700;
    letter-spacing: 0px;
    line-height: 40px;
    color: rgba(0, 0, 0, 1);
}

.homeTitle2 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0px;
    line-height: 32px;
    color: rgba(102, 102, 102, 1);
}
</style>