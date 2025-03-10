// src/store/favorite.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
      addFavoriteApi,
      removeFavoriteApi,
      batchRemoveFavoritesApi,
      getFavoritesApi,
      getFavoriteIdsApi
} from '@/api/favorite.api';
import { Favorite, FavoriteState } from '@/types/favorite.type';
import { showNotify, showLoadingToast, closeToast } from 'vant';
import storage from '@/utils/storage';

// 添加缓存键和过期时间常量
const CACHE_KEYS = {
      FAVORITE_LIST: 'favorite_list_data',
      FAVORITE_IDS: 'favorite_ids_data'
};

const CACHE_EXPIRY = {
      FAVORITE_LIST: 60 * 10, // 10分钟
      FAVORITE_IDS: 60 * 30   // 30分钟
};

export const useFavoriteStore = defineStore('favorite', () => {
      // 状态
      const favoriteIds = ref<number[]>([]);
      const favorites = ref<Favorite[]>([]);
      const total = ref<number>(0);
      const page = ref<number>(1);
      const limit = ref<number>(10);
      const loading = ref<boolean>(false);
      const lastLoadTime = ref<number>(0); // 添加最后加载时间记录

      // 计算属性
      const favoriteCount = computed(() => favoriteIds.value.length);
      const hasFavorites = computed(() => favoriteIds.value.length > 0);
      const dataIsStale = computed(() => {
            const now = Date.now();
            const staleTime = lastLoadTime.value + (CACHE_EXPIRY.FAVORITE_LIST * 1000);
            return now > staleTime;
      });

      // 判断商品是否已收藏
      const isFavorite = (productId: number): boolean => {
            return favoriteIds.value.includes(productId);
      };

      // 加载收藏ID列表
      // 在 favorite.store.ts 中
      const loadFavoriteIds = async (force = false) => {
            // 如果非强制刷新且已有数据，直接返回
            if (!force && favoriteIds.value.length > 0) {
                  return favoriteIds.value;
            }

            try {
                  const res = await getFavoriteIdsApi();
                  favoriteIds.value = res.data.data;
                  return res.data.data;
            } catch (error) {
                  console.error('获取收藏ID列表失败:', error);
                  return [];
            }
      };

      // 加载收藏列表
      const loadFavorites = async (pageNum = 1, pageSize = 10, force = false) => {
            // 如果不是强制刷新，且是第一页，且已有数据，且数据未过期，直接返回缓存数据
            if (!force && pageNum === 1 && favorites.value.length > 0 && !dataIsStale.value) {
                  return {
                        data: favorites.value,
                        total: total.value,
                        page: page.value,
                        limit: limit.value
                  };
            }

            // 尝试从缓存获取（仅第一页）
            if (!force && pageNum === .1) {
                  const cachedData = storage.get(CACHE_KEYS.FAVORITE_LIST);
                  if (cachedData) {
                        favorites.value = cachedData.data;
                        total.value = cachedData.total;
                        page.value = cachedData.page;
                        limit.value = cachedData.limit;
                        return cachedData;
                  }
            }

            loading.value = true;
            try {
                  const res = await getFavoritesApi({
                        page: pageNum,
                        limit: pageSize
                  });

                  favorites.value = res.data.data;
                  total.value = res.data.total;
                  page.value = res.data.page;
                  limit.value = res.data.limit;
                  lastLoadTime.value = Date.now(); // 更新最后加载时间

                  // 存入缓存（仅第一页）
                  if (pageNum === 1) {
                        storage.set(CACHE_KEYS.FAVORITE_LIST, res.data, CACHE_EXPIRY.FAVORITE_LIST);
                  }

                  return res.data;
            } catch (error) {
                  console.error('获取收藏列表失败:', error);
                  return null;
            } finally {
                  loading.value = false;
            }
      };

      // 添加收藏（保持原有的乐观更新策略）
      const addToFavorite = async (productId: number) => {
            // 先检查商品是否已收藏，避免重复操作
            if (isFavorite(productId)) {
                  return true;
            }

            // 先更新本地状态
            favoriteIds.value.push(productId);
            showNotify({ type: 'success', message: '收藏成功' });

            try {
                  // 后台发送请求，无需展示 loading
                  await addFavoriteApi({ productId });

                  // 更新缓存
                  storage.set(CACHE_KEYS.FAVORITE_IDS, favoriteIds.value, CACHE_EXPIRY.FAVORITE_IDS);

                  // 标记收藏列表需要刷新（通过设置过期时间为0）
                  lastLoadTime.value = 0;

                  return true;
            } catch (error) {
                  // 请求失败，恢复本地状态
                  favoriteIds.value = favoriteIds.value.filter(id => id !== productId);
                  console.error('添加收藏失败:', error);
                  showNotify({ type: 'danger', message: '收藏失败，请稍后重试' });
                  return false;
            }
      };

      // 移除收藏 - 优化后
      const removeFromFavorite = async (productId: number) => {
            // 先检查商品是否在收藏列表中
            if (!isFavorite(productId)) {
                  return true;
            }

            // 保存原始状态，以便在请求失败时恢复
            const originalIds = [...favoriteIds.value];
            const originalFavorites = [...favorites.value];

            // 先更新本地状态
            favoriteIds.value = favoriteIds.value.filter(id => id !== productId);
            favorites.value = favorites.value.filter(item => item.productId !== productId);

            showNotify({ type: 'success', message: '已取消收藏' });

            try {
                  // 后台发送请求，无需展示 loading
                  await removeFavoriteApi(productId);

                  // 更新缓存
                  storage.set(CACHE_KEYS.FAVORITE_IDS, favoriteIds.value, CACHE_EXPIRY.FAVORITE_IDS);
                  storage.set(CACHE_KEYS.FAVORITE_LIST, {
                        data: favorites.value,
                        total: total.value > 0 ? total.value - 1 : 0,
                        page: page.value,
                        limit: limit.value
                  }, CACHE_EXPIRY.FAVORITE_LIST);

                  return true;
            } catch (error) {
                  // 请求失败，恢复本地状态
                  favoriteIds.value = originalIds;
                  favorites.value = originalFavorites;
                  console.error('取消收藏失败:', error);
                  showNotify({ type: 'danger', message: '取消收藏失败，请稍后重试' });
                  return false;
            }
      };

      // 批量移除收藏
      const batchRemoveFromFavorites = async (productIds: number[]) => {
            if (productIds.length === 0) return true;

            // 保存原始状态
            const originalIds = [...favoriteIds.value];
            const originalFavorites = [...favorites.value];

            // 乐观更新本地状态
            favoriteIds.value = favoriteIds.value.filter(id => !productIds.includes(id));
            favorites.value = favorites.value.filter(item => !productIds.includes(item.productId));

            showLoadingToast({
                  message: '批量移除中...',
                  forbidClick: true,
            });

            try {
                  await batchRemoveFavoritesApi({ productIds });

                  // 更新缓存
                  storage.set(CACHE_KEYS.FAVORITE_IDS, favoriteIds.value, CACHE_EXPIRY.FAVORITE_IDS);
                  storage.set(CACHE_KEYS.FAVORITE_LIST, {
                        data: favorites.value,
                        total: total.value > 0 ? total.value - productIds.length : 0,
                        page: page.value,
                        limit: limit.value
                  }, CACHE_EXPIRY.FAVORITE_LIST);

                  closeToast();
                  showNotify({ type: 'success', message: '批量取消收藏成功' });
                  return true;
            } catch (error) {
                  // 恢复原始状态
                  favoriteIds.value = originalIds;
                  favorites.value = originalFavorites;

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
            lastLoadTime.value = 0;

            // 清除缓存
            storage.remove(CACHE_KEYS.FAVORITE_LIST);
            storage.remove(CACHE_KEYS.FAVORITE_IDS);
      };

      // 预加载收藏数据
      const preloadFavoriteData = async () => {
            console.log('预加载收藏数据...');
            try {
                  // 并行加载ID列表和收藏列表
                  await Promise.all([
                        loadFavoriteIds(false),
                        loadFavorites(1, 10, false)
                  ]);
                  return true;
            } catch (error) {
                  console.error('预加载收藏数据失败:', error);
                  return false;
            }
      };

      return {
            // 状态
            favoriteIds,
            favorites,
            total,
            page,
            limit,
            loading,
            lastLoadTime,
            dataIsStale,

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
            resetFavorites,
            preloadFavoriteData
      };
}, {
      persist: true // 添加持久化配置
});