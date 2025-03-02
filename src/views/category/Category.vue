<template>
    <div class="pageContent">
        <div class="px-[5px]">
          <div class="text-[25px] font-bold leading-4 text-black">Category</div>
        </div>

        <!-- 占位容器 -->
        <div style="height: 18px;"></div>
        
        <van-empty v-if="loading" description="加载中..." />

        <van-collapse v-else v-model="activeNames" accordion>
            <van-collapse-item v-for="category in categories" :key="category.id" :title="category.name"
                :name="category.id">
                <div class="subcategory-container">
                    <div v-for="subCategory in getCategoryChildren(category)" :key="subCategory.id"
                        class="subcategory-item" @click="navigateToProductList(subCategory)">
                        <span class="subcategory-text">{{ subCategory.name }}</span>
                    </div>
                </div>
            </van-collapse-item>
        </van-collapse>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useProductStore } from '@/store/product.store';
import type { Category } from '@/types/product.type';

const router = useRouter();
const productStore = useProductStore();

// 状态定义
const loading = ref(true);
const activeNames = ref('');
const categories = computed(() => productStore.categories.filter(cat => cat.level === 1));

// 获取指定分类的子分类
const getCategoryChildren = (category: Category) => {
    return category.children || [];
};

// 加载分类树数据
const loadCategoryData = async () => {
    try {
        loading.value = true;
        await productStore.loadCategoryTree();
    } catch (error) {
        console.error('Failed to load categories:', error);
        showToast('分类加载失败，请重试');
    } finally {
        loading.value = false;
    }
};

// 跳转到商品列表页（预留方法）
const navigateToProductList = (category: Category) => {
    console.log('Navigate to category products:', category.id);
    // 预留跳转方法，实际实现时取消注释
    // router.push({ name: 'CategoryProducts', params: { categoryId: category.id.toString() } });
};

// 页面加载时获取分类数据
onMounted(() => {
    loadCategoryData();
});
</script>

<style scoped>
:deep(.van-collapse) {
    background-color: transparent;
    border-radius: 8px;
    overflow: hidden;
    
}

:deep(.van-collapse-item) {
    margin-bottom: 12px;
    border-radius: 8px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 加快折叠面板展开速度 */
:deep(.van-collapse-item__wrapper) {
    transition: height 0.15s ease-out !important;
}

/* 去掉一级分类点击时的背景变色效果 */
:deep(.van-cell--clickable:active) {
    background-color: transparent !important;
}

:deep(.van-collapse-item__title) {
    font-size: 15px;
    font-weight: 500;
    color: #333;
    height: 54px;
}

:deep(.van-collapse-item__content) {
    padding: 16px;
}

:deep(.van-cell) {
    padding: 12px 16px;
}

:deep(.van-cell::after) {
    display: none;
}

.subcategory-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.subcategory-item {
    background-color: #f5f5f5;
    border-radius: 6px;
    padding: 14px 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.2s;
    cursor: pointer;
}

.subcategory-item:active {
    background-color: #ebebeb;
    transform: translateY(1px);
}

.subcategory-text {
    font-size: 13px;
    color: #333;
    text-align: center;
    word-break: break-word;
    line-height: 1.4;
}
</style>