// src/store/favorite.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
      addFavorite as addFavoriteApi,
      removeFavorite as removeFavoriteApi,
      batchRemoveFavorites as batchRemoveFavoritesApi,
      getFavorites as getFavoritesApi
} from '@/api/favorite.api';
import { Product } from '@/types/product.type';
import { useUserStore } from './user.store';

export const useFavoriteStore = defineStore('favorite', () => {
      // 状态
      const favorites = ref<Product[]>([]);
      const loading = ref<boolean>(false);
      const paginationInfo = ref({
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0
      });

      // 计算属性
      const getFavorites = computed(() => favorites.value);
      const isProductFavorited = computed(() => (productId: number) => {
            return favorites.value.some(item => item.id === productId);
      });
      const favoriteCount = computed(() => paginationInfo.value.total);

      // 方法: 加载收藏列表
      async function loadFavorites(page = 1, limit = 10) {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return [];

            try {
                  loading.value = true;
                  const res = await getFavoritesApi(page, limit);
                  const data = res.data;

                  favorites.value = data.data.map((item: any) => item.product);

                  paginationInfo.value = {
                        total: data.total,
                        page: data.page,
                        limit: data.limit,
                        totalPages: Math.ceil(data.total / data.limit)
                  };

                  return favorites.value;
            } catch (error) {
                  console.error('Failed to load favorites:', error);
                  return [];
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 添加收藏
      async function addFavorite(productId: number) {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return false;

            try {
                  loading.value = true;
                  await addFavoriteApi(productId);

                  // 更新收藏总数
                  paginationInfo.value.total += 1;

                  return true;
            } catch (error) {
                  console.error('Failed to add favorite:', error);
                  return false;
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 移除收藏
      async function removeFavorite(productId: number) {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return false;

            try {
                  loading.value = true;
                  await removeFavoriteApi(productId);

                  // 从列表中移除
                  favorites.value = favorites.value.filter(item => item.id !== productId);

                  // 更新收藏总数
                  if (paginationInfo.value.total > 0) {
                        paginationInfo.value.total -= 1;
                  }

                  return true;
            } catch (error) {
                  console.error('Failed to remove favorite:', error);
                  return false;
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 批量移除收藏
      async function batchRemoveFavorites(productIds: number[]) {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return false;

            try {
                  loading.value = true;
                  await batchRemoveFavoritesApi(productIds);

                  // 从列表中移除
                  favorites.value = favorites.value.filter(item => !productIds.includes(item.id));

                  // 更新收藏总数
                  paginationInfo.value.total -= productIds.length;
                  if (paginationInfo.value.total < 0) {
                        paginationInfo.value.total = 0;
                  }

                  return true;
            } catch (error) {
                  console.error('Failed to batch remove favorites:', error);
                  return false;
            } finally {
                  loading.value = false;
            }
      }

      // 方法: 切换收藏状态
      async function toggleFavorite(productId: number) {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return false;

            const isFavorited = isProductFavorited.value(productId);

            if (isFavorited) {
                  return await removeFavorite(productId);
            } else {
                  return await addFavorite(productId);
            }
      }

      // 方法: 清空收藏数据（用户登出时调用）
      function clearFavorites() {
            favorites.value = [];
            paginationInfo.value = {
                  total: 0,
                  page: 1,
                  limit: 10,
                  totalPages: 0
            };
      }

      return {
            // 状态
            favorites,
            loading,
            paginationInfo,

            // 计算属性
            getFavorites,
            isProductFavorited,
            favoriteCount,

            // 方法
            loadFavorites,
            addFavorite,
            removeFavorite,
            batchRemoveFavorites,
            toggleFavorite,
            clearFavorites
      };
}, {
      persist: true  // 添加持久化配置
});