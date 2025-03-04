<!-- src/views/favorite/FavoriteList.vue -->
<template>
    <div class="pageContent">
        <!-- 顶部标题 -->
        <div class="flex justify-between items-center mb-4">
            <div class="text-[20px] font-bold">我的收藏</div>
            <div @click="toggleEditMode" class="text-[14px] text-blue-600">
                {{ isEditMode ? '完成' : '编辑' }}
            </div>
        </div>

        <!-- 使用列表组件 -->
        <ListProductView :items="favoriteItems" :is-edit-mode="isEditMode" :show-quantity="false" empty-text="暂无收藏商品"
            @item-click="handleItemClick" @delete="handleDelete" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showSuccessToast } from 'vant';
import { useFavoriteStore } from '@/store/favorite.store';
import ListProductView from '@/components/product/ListProductView.vue';

// 初始化
const router = useRouter();
const favoriteStore = useFavoriteStore();
const isEditMode = ref(false);

// 获取收藏数据
const favoriteItems = ref<any[]>([]);
const loading = ref(false);

// 加载收藏列表
const loadFavorites = async () => {
    try {
        loading.value = true;
        const result = await favoriteStore.loadFavorites();

        if (result && result.data) {
            favoriteItems.value = result.data.map(item => ({
                id: item.productId,
                brand: item.product?.name || '未知商品',
                name: item.product?.category?.name || '未分类',
                price: item.product?.skus?.[0]?.price || 0,
                image: item.product?.mainImage || '',
                quantity: 1,
                selected: false
            }));
        }
    } catch (error) {
        console.error('加载收藏列表失败:', error);
        showToast('加载收藏列表失败');
    } finally {
        loading.value = false;
    }
};

// 切换编辑模式
const toggleEditMode = () => {
    isEditMode.value = !isEditMode.value;

    // 退出编辑模式时，重置选择状态
    if (!isEditMode.value) {
        favoriteItems.value.forEach(item => {
            item.selected = false;
        });
    }
};

// 处理商品点击
const handleItemClick = (item: any) => {
    router.push(`/product/detail/${item.id}`);
};

// 处理删除操作
const handleDelete = async (itemIds: (string | number)[]) => {
    try {
        if (itemIds.length === 1) {
            // 删除单个商品
            const result = await favoriteStore.removeFromFavorite(Number(itemIds[0]));
            if (result) {
                favoriteItems.value = favoriteItems.value.filter(item => item.id !== itemIds[0]);
                showSuccessToast('删除成功');
            }
        } else if (itemIds.length > 1) {
            // 批量删除商品
            const result = await favoriteStore.batchRemoveFromFavorites(itemIds.map(id => Number(id)));
            if (result) {
                favoriteItems.value = favoriteItems.value.filter(item => !itemIds.includes(item.id));
                showSuccessToast('批量删除成功');
            }
        }

        // 如果没有收藏商品了，退出编辑模式
        if (favoriteItems.value.length === 0) {
            isEditMode.value = false;
        }
    } catch (error) {
        console.error('删除收藏失败:', error);
        showToast('删除失败，请稍后重试');
    }
};

// 页面加载时获取收藏列表
onMounted(() => {
    loadFavorites();
});
</script>