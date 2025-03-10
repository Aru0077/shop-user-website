// src/store/favorite.store.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import {
    addFavoriteApi,
    removeFavoriteApi,
    batchRemoveFavoritesApi,
    getFavoritesApi,
    getFavoriteIdsApi
} from '@/api/favorite.api';
import { Favorite } from '@/types/favorite.type';
import { showNotify, showLoadingToast, closeToast,showConfirmDialog } from 'vant';
import storage, { STORAGE_KEYS, DEFAULT_EXPIRY } from '@/utils/storage';
import { useUserStore } from './user.store';

// 定义离线收藏项类型
interface OfflineFavorite extends Favorite {
    offline: boolean;
    pendingSync: boolean;
    action: 'add' | 'remove';
}

export const useFavoriteStore = defineStore('favorite', () => {
    // 状态
    const favoriteIds = ref<number[]>([]);
    const favorites = ref<Favorite[]>([]);
    const total = ref<number>(0);
    const page = ref<number>(1);
    const limit = ref<number>(10);
    const loading = ref<boolean>(false);
    const lastSyncTime = ref<number>(0);
    const hasOfflineChanges = ref<boolean>(false);
    const offlineQueue = ref<Array<{ productId: number, action: 'add' | 'remove' }>>([]);
    const offlineMode = ref<boolean>(false);

    // 初始化时从本地存储加载收藏数据
    const initFromStorage = () => {
        // 加载收藏ID列表
        const storedIds = storage.get<{
            ids: number[];
            lastSync: number;
            hasOfflineChanges: boolean;
        }>(STORAGE_KEYS.FAVORITES + '_ids', null);
        
        if (storedIds) {
            favoriteIds.value = storedIds.ids;
            lastSyncTime.value = storedIds.lastSync;
            hasOfflineChanges.value = storedIds.hasOfflineChanges || false;
        }
        
        // 加载收藏项列表
        const storedFavorites = storage.get<{
            items: Favorite[];
            total: number;
            page: number;
            limit: number;
        }>(STORAGE_KEYS.FAVORITES, null);
        
        if (storedFavorites) {
            favorites.value = storedFavorites.items;
            total.value = storedFavorites.total;
            page.value = storedFavorites.page;
            limit.value = storedFavorites.limit;
        }
        
        // 加载离线队列
        const storedQueue = storage.get<Array<{ productId: number, action: 'add' | 'remove' }>>(
            STORAGE_KEYS.FAVORITES + '_queue', 
            []
        );
        
        if (storedQueue) {
            offlineQueue.value = storedQueue;
        }
    };

    // 初始化
    initFromStorage();

    // 保存收藏ID列表到本地存储
    const saveIdsToStorage = () => {
        storage.set(
            STORAGE_KEYS.FAVORITES + '_ids',
            {
                ids: favoriteIds.value,
                lastSync: lastSyncTime.value,
                hasOfflineChanges: hasOfflineChanges.value
            },
            DEFAULT_EXPIRY.FAVORITES
        );
    };

    // 保存收藏列表到本地存储
    const saveFavoritesToStorage = () => {
        storage.set(
            STORAGE_KEYS.FAVORITES,
            {
                items: favorites.value,
                total: total.value,
                page: page.value,
                limit: limit.value
            },
            DEFAULT_EXPIRY.FAVORITES
        );
    };

    // 保存离线队列到本地存储
    const saveQueueToStorage = () => {
        storage.set(
            STORAGE_KEYS.FAVORITES + '_queue',
            offlineQueue.value,
            DEFAULT_EXPIRY.FAVORITES
        );
    };

    // 监听收藏数据变化，保存到本地存储
    watch(
        [favoriteIds, lastSyncTime, hasOfflineChanges],
        () => {
            saveIdsToStorage();
        },
        { deep: true }
    );
    
    watch(
        [favorites, total, page, limit],
        () => {
            saveFavoritesToStorage();
        },
        { deep: true }
    );
    
    watch(
        offlineQueue,
        () => {
            saveQueueToStorage();
        },
        { deep: true }
    );

    // 计算属性
    const favoriteCount = computed(() => favoriteIds.value.length);
    const hasFavorites = computed(() => favoriteIds.value.length > 0);
    
    // 计算同步状态
    const syncStatus = computed(() => {
        if (hasOfflineChanges.value) return '有未同步的更改';
        if (!lastSyncTime.value) return '未同步';
        
        const now = Date.now();
        const diffMinutes = Math.floor((now - lastSyncTime.value) / (1000 * 60));
        
        if (diffMinutes < 1) return '刚刚同步';
        if (diffMinutes < 60) return `${diffMinutes}分钟前同步`;
        
        const diffHours = Math.floor(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}小时前同步`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}天前同步`;
    });

    // 判断商品是否已收藏
    const isFavorite = (productId: number): boolean => {
        return favoriteIds.value.includes(productId);
    };

    // 检测网络状态
    const checkNetworkStatus = () => {
        // 在真实应用中，这应当基于navigator.onLine和网络请求测试
        return navigator.onLine;
    };

    // 同步离线更改到服务器
    const syncOfflineChanges = async () => {
        if (offlineQueue.value.length === 0 || !checkNetworkStatus()) return;
        
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return;
        
        showLoadingToast({ message: '正在同步收藏列表...' });
        
        try {
            // 处理离线队列
            const addsQueue = offlineQueue.value.filter(item => item.action === 'add');
            const removesQueue = offlineQueue.value.filter(item => item.action === 'remove');
            
            // 批量处理删除
            if (removesQueue.length > 0) {
                const productIds = removesQueue.map(item => item.productId);
                if (productIds.length > 0) {
                    await batchRemoveFavoritesApi({ productIds });
                }
            }
            
            // 逐个处理添加
            for (const item of addsQueue) {
                await addFavoriteApi({ productId: item.productId });
            }
            
            // 同步成功后更新状态
            closeToast();
            offlineQueue.value = [];
            hasOfflineChanges.value = false;
            
            // 重新加载收藏数据
            await Promise.all([
                loadFavoriteIds(true),
                loadFavorites(1, 10, true)
            ]);
            
            lastSyncTime.value = Date.now();
            saveIdsToStorage();
            saveFavoritesToStorage();
            saveQueueToStorage();
            
            showNotify({ type: 'success', message: '收藏列表已同步' });
        } catch (error) {
            closeToast();
            console.error('同步收藏列表失败:', error);
            showNotify({ type: 'warning', message: '同步收藏列表失败，将稍后重试' });
        }
    };

    // 加载收藏ID列表
    const loadFavoriteIds = async (force = false) => {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return [];
        
        // 如果非强制刷新且已有数据，直接返回
        if (!force && favoriteIds.value.length > 0) {
            return favoriteIds.value;
        }

        // 如果离线模式，使用本地数据
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            return favoriteIds.value;
        }

        try {
            const res = await getFavoriteIdsApi();
            favoriteIds.value = res.data.data;
            lastSyncTime.value = Date.now();
            offlineMode.value = false;
            
            // 如果有离线更改，应用它们
            if (hasOfflineChanges.value && offlineQueue.value.length > 0) {
                // 应用离线队列中的更改到本地数据
                offlineQueue.value.forEach(item => {
                    if (item.action === 'add' && !favoriteIds.value.includes(item.productId)) {
                        favoriteIds.value.push(item.productId);
                    } else if (item.action === 'remove') {
                        favoriteIds.value = favoriteIds.value.filter(id => id !== item.productId);
                    }
                });
            }
            
            saveIdsToStorage();
            return favoriteIds.value;
        } catch (error) {
            console.error('获取收藏ID列表失败:', error);
            offlineMode.value = true;
            return favoriteIds.value;
        }
    };

    // 加载收藏列表
    const loadFavorites = async (pageNum = 1, pageSize = 10, force = false) => {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return null;
        
        // 如果不是强制刷新，且是第一页，且已有数据，直接返回缓存数据
        if (!force && pageNum === 1 && favorites.value.length > 0) {
            return {
                data: favorites.value,
                total: total.value,
                page: page.value,
                limit: limit.value
            };
        }

        // 如果离线模式，使用本地数据
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            showNotify({ type: 'warning', message: '当前处于离线模式，显示本地收藏数据' });
            
            return {
                data: favorites.value,
                total: total.value,
                page: 1,
                limit: pageSize
            };
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
            lastSyncTime.value = Date.now();
            offlineMode.value = false;
            
            // 如果有离线更改，应用它们
            if (hasOfflineChanges.value && offlineQueue.value.length > 0) {
                // 检查是否应该同步离线更改
                const shouldSync = await showConfirmDialog({
                    title: '发现未同步的收藏更改',
                    message: '是否要同步这些更改？',
                    confirmButtonText: '同步',
                    cancelButtonText: '稍后再说'
                });
                
                if (shouldSync) {
                    await syncOfflineChanges();
                }
            }
            
            saveFavoritesToStorage();
            return res.data;
        } catch (error) {
            console.error('获取收藏列表失败:', error);
            offlineMode.value = true;
            
            showNotify({ 
                type: 'warning', 
                message: '无法连接服务器，使用本地收藏数据' 
            });
            
            return {
                data: favorites.value,
                total: total.value,
                page: 1,
                limit: pageSize
            };
        } finally {
            loading.value = false;
        }
    };

    // 添加收藏
    const addToFavorite = async (productId: number) => {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return false;
        
        // 先检查商品是否已收藏，避免重复操作
        if (isFavorite(productId)) {
            return true;
        }

        // 先更新本地状态
        favoriteIds.value.push(productId);
        showNotify({ type: 'success', message: '收藏成功' });
        
        // 如果离线，添加到离线队列
        if (!checkNetworkStatus()) {
            offlineQueue.value.push({ productId, action: 'add' });
            hasOfflineChanges.value = true;
            saveIdsToStorage();
            saveQueueToStorage();
            return true;
        }

        try {
            // 发送请求到服务器
            await addFavoriteApi({ productId });
            lastSyncTime.value = Date.now();
            saveIdsToStorage();
            return true;
        } catch (error) {
            console.error('添加收藏失败:', error);
            
            // 添加到离线队列，稍后同步
            offlineQueue.value.push({ productId, action: 'add' });
            hasOfflineChanges.value = true;
            saveIdsToStorage();
            saveQueueToStorage();
            
            showNotify({ 
                type: 'warning', 
                message: '网络问题，收藏已保存到本地' 
            });
            
            return true;
        }
    };

    // 移除收藏
    const removeFromFavorite = async (productId: number) => {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return false;
        
        // 先检查商品是否在收藏列表中
        if (!isFavorite(productId)) {
            return true;
        }

        // 先更新本地状态
        favoriteIds.value = favoriteIds.value.filter(id => id !== productId);
        favorites.value = favorites.value.filter(item => item.productId !== productId);
        
        showNotify({ type: 'success', message: '已取消收藏' });
        
        // 如果离线，添加到离线队列
        if (!checkNetworkStatus()) {
            offlineQueue.value.push({ productId, action: 'remove' });
            hasOfflineChanges.value = true;
            saveIdsToStorage();
            saveFavoritesToStorage();
            saveQueueToStorage();
            return true;
        }

        try {
            // 发送请求到服务器
            await removeFavoriteApi(productId);
            lastSyncTime.value = Date.now();
            saveIdsToStorage();
            saveFavoritesToStorage();
            return true;
        } catch (error) {
            console.error('取消收藏失败:', error);
            
            // 添加到离线队列，稍后同步
            offlineQueue.value.push({ productId, action: 'remove' });
            hasOfflineChanges.value = true;
            saveIdsToStorage();
            saveFavoritesToStorage();
            saveQueueToStorage();
            
            showNotify({ 
                type: 'warning', 
                message: '网络问题，更改已保存到本地' 
            });
            
            return true;
        }
    };

    // 批量移除收藏
    const batchRemoveFromFavorites = async (productIds: number[]) => {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return false;
        
        if (productIds.length === 0) return true;

        // 更新本地状态
        favoriteIds.value = favoriteIds.value.filter(id => !productIds.includes(id));
        favorites.value = favorites.value.filter(item => !productIds.includes(item.productId));
        
        showLoadingToast({
            message: '批量移除中...',
            forbidClick: true,
        });
        
        // 如果离线，添加到离线队列
        if (!checkNetworkStatus()) {
            productIds.forEach(productId => {
                offlineQueue.value.push({ productId, action: 'remove' });
            });
            
            hasOfflineChanges.value = true;
            saveIdsToStorage();
            saveFavoritesToStorage();
            saveQueueToStorage();
            
            closeToast();
            showNotify({ 
                type: 'warning', 
                message: '网络问题，更改已保存到本地' 
            });
            
            return true;
        }

        try {
            await batchRemoveFavoritesApi({ productIds });
            lastSyncTime.value = Date.now();
            saveIdsToStorage();
            saveFavoritesToStorage();
            
            closeToast();
            showNotify({ type: 'success', message: '批量取消收藏成功' });
            return true;
        } catch (error) {
            console.error('批量取消收藏失败:', error);
            
            // 添加到离线队列，稍后同步
            productIds.forEach(productId => {
                offlineQueue.value.push({ productId, action: 'remove' });
            });
            
            hasOfflineChanges.value = true;
            saveIdsToStorage();
            saveFavoritesToStorage();
            saveQueueToStorage();
            
            closeToast();
            showNotify({ 
                type: 'warning', 
                message: '网络问题，更改已保存到本地' 
            });
            
            return true;
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
        lastSyncTime.value = 0;
        hasOfflineChanges.value = false;
        offlineQueue.value = [];
        offlineMode.value = false;
        
        // 清除本地存储
        storage.remove(STORAGE_KEYS.FAVORITES);
        storage.remove(STORAGE_KEYS.FAVORITES + '_ids');
        storage.remove(STORAGE_KEYS.FAVORITES + '_queue');
    };

    // 预加载收藏数据
    const preloadFavoriteData = async () => {
        console.log('预加载收藏数据...');
        
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return false;
        
        try {
            // 如果有离线更改，尝试同步
            if (hasOfflineChanges.value && checkNetworkStatus()) {
                await syncOfflineChanges();
            }
            
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
        lastSyncTime,
        hasOfflineChanges,
        offlineQueue,
        offlineMode,

        // 计算属性
        favoriteCount,
        hasFavorites,
        syncStatus,

        // 方法
        isFavorite,
        loadFavoriteIds,
        loadFavorites,
        addToFavorite,
        removeFromFavorite,
        batchRemoveFromFavorites,
        toggleFavorite,
        resetFavorites,
        preloadFavoriteData,
        syncOfflineChanges,
        checkNetworkStatus,
        saveIdsToStorage,
        saveFavoritesToStorage
    };
});