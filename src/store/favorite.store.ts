// src/store/favorite.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
      addFavorite,
      removeFavorite,
      batchRemoveFavorites,
      getFavorites,
      getFavoriteIds
} from '@/api/favorite.api';
import { Favorite, FavoriteState } from '@/types/favorite.type';
import { showNotify, showLoadingToast, closeToast } from 'vant';

export const useFavoriteStore = defineStore('favorite', () => {
      // 状态
      const favoriteIds = ref<number[]>([]);
      const favorites = ref<Favorite[]>([]);
      const total = ref<number>(0);
      const page = ref<number>(1);
      const limit = ref<number>(10);
      const loading = ref<boolean>(false);

      // 计算属性
      const favoriteCount = computed(() => favoriteIds.value.length);
      const hasFavorites = computed(() => favoriteIds.value.length > 0);

      // 判断商品是否已收藏
      const isFavorite = (productId: number): boolean => {
            return favoriteIds.value.includes(productId);
      };

      // 加载收藏ID列表
      const loadFavoriteIds = async () => {
            try {
                  const res = await getFavoriteIds();
                  favoriteIds.value = res.data.data;
                  return res.data.data;
            } catch (error) {
                  console.error('获取收藏ID列表失败:', error);
                  return [];
            }
      };

      // 加载收藏列表
      const loadFavorites = async (pageNum = 1, pageSize = 10) => {
            loading.value = true;
            try {
                  const res = await getFavorites({
                        page: pageNum,
                        limit: pageSize
                  });
                  favorites.value = res.data.data;
                  total.value = res.data.total;
                  page.value = res.data.page;
                  limit.value = res.data.limit;
                  return res.data;
            } catch (error) {
                  console.error('获取收藏列表失败:', error);
                  return null;
            } finally {
                  loading.value = false;
            }
      };

      // 添加收藏
      const addToFavorite = async (productId: number) => {
            showLoadingToast({
                  message: '添加中...',
                  forbidClick: true,
            });

            try {
                  await addFavorite({ productId });
                  // 更新本地状态
                  if (!isFavorite(productId)) {
                        favoriteIds.value.push(productId);
                  }
                  closeToast();
                  showNotify({ type: 'success', message: '收藏成功' });
                  return true;
            } catch (error) {
                  closeToast();
                  console.error('添加收藏失败:', error);
                  return false;
            }
      };

      // 移除收藏
      const removeFromFavorite = async (productId: number) => {
            showLoadingToast({
                  message: '移除中...',
                  forbidClick: true,
            });

            try {
                  await removeFavorite(productId);
                  // 更新本地状态
                  favoriteIds.value = favoriteIds.value.filter(id => id !== productId);
                  favorites.value = favorites.value.filter(item => item.productId !== productId);
                  closeToast();
                  showNotify({ type: 'success', message: '已取消收藏' });
                  return true;
            } catch (error) {
                  closeToast();
                  console.error('取消收藏失败:', error);
                  return false;
            }
      };

      // 批量移除收藏
      const batchRemoveFromFavorites = async (productIds: number[]) => {
            if (productIds.length === 0) return true;

            showLoadingToast({
                  message: '批量移除中...',
                  forbidClick: true,
            });

            try {
                  await batchRemoveFavorites({ productIds });
                  // 更新本地状态
                  favoriteIds.value = favoriteIds.value.filter(id => !productIds.includes(id));
                  favorites.value = favorites.value.filter(item => !productIds.includes(item.productId));
                  closeToast();
                  showNotify({ type: 'success', message: '批量取消收藏成功' });
                  return true;
            } catch (error) {
                  closeToast();
                  console.error('批量取消收藏失败:', error);
                  return false;
            }
      };

      // 切换收藏状态
      const toggleFavorite = async (productId: number) => {
            return isFavorite(productId)
                  ? removeFromFavorite(productId)
                  : addToFavorite(productId);
      };

      // 重置状态
      const resetFavorites = () => {
            favoriteIds.value = [];
            favorites.value = [];
            total.value = 0;
            page.value = 1;
      };

      return {
            // 状态
            favoriteIds,
            favorites,
            total,
            page,
            limit,
            loading,

            // 计算属性
            favoriteCount,
            hasFavorites,

            // 方法
            isFavorite,
            loadFavoriteIds,
            loadFavorites,
            addToFavorite,
            removeFromFavorite,
            batchRemoveFromFavorites,
            toggleFavorite,
            resetFavorites
      };
});