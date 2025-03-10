// src/store/cart.store.ts
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import {
    addToCartApi,
    updateCartItemApi,
    deleteCartItemApi,
    getCartListApi,
    clearCartApi,
    previewOrderAmountApi
} from '@/api/cart.api';
import { CartItem, AddCartItemParams, UpdateCartItemParams } from '@/types/cart.type';
import { useUserStore } from './user.store';
import { showNotify, showLoadingToast, closeToast } from 'vant';
import storage, { STORAGE_KEYS, DEFAULT_EXPIRY } from '@/utils/storage';

// 定义更新队列类型
interface UpdateQueueItem {
    quantity: number;
    pending: boolean;
    timer?: number;
}

// 定义防抖延迟常量
const DEBOUNCE_DELAY = 800; // 800毫秒

// 定义离线购物车项类型
interface OfflineCartItem extends CartItem {
    offline: boolean;
    pendingSync: boolean;
}

export const useCartStore = defineStore('cart', () => {
    // 状态
    const cartItems = ref<CartItem[]>([]);
    const total = ref<number>(0);
    const page = ref<number>(1);
    const limit = ref<number>(10);
    const loading = ref<boolean>(false);
    const lastSyncTime = ref<number>(0);
    const offlineMode = ref<boolean>(false);
    const hasOfflineChanges = ref<boolean>(false);
    // 添加队列处理更新请求
    const updateQueue = ref<Record<number, UpdateQueueItem>>({});

    // 初始化时从本地存储加载购物车
    const initFromStorage = () => {
        const storedCart = storage.get<{
            items: CartItem[];
            total: number;
            lastSync: number;
            hasOfflineChanges: boolean;
        }>(STORAGE_KEYS.CART, null);
        
        if (storedCart) {
            cartItems.value = storedCart.items;
            total.value = storedCart.total;
            lastSyncTime.value = storedCart.lastSync;
            hasOfflineChanges.value = storedCart.hasOfflineChanges || false;
        }
    };

    // 初始化
    initFromStorage();

    // 保存购物车到本地存储
    const saveToStorage = () => {
        storage.set(
            STORAGE_KEYS.CART,
            {
                items: cartItems.value,
                total: total.value,
                lastSync: lastSyncTime.value,
                hasOfflineChanges: hasOfflineChanges.value
            },
            DEFAULT_EXPIRY.CART
        );
    };

    // 监听购物车变化，保存到本地存储
    watch(
        [cartItems, total, lastSyncTime, hasOfflineChanges],
        () => {
            saveToStorage();
        },
        { deep: true }
    );

    // 计算所有购物车商品数量
    const cartItemCount = computed(() => {
        return cartItems.value.reduce((count, item) => count + item.quantity, 0);
    });

    // 计算购物车中不同商品的种类数量
    const uniqueItemCount = computed(() => {
        return cartItems.value.length;
    });

    // 计算购物车商品总金额
    const totalAmount = computed(() => {
        return cartItems.value.reduce((amount, item) => {
            if (item.sku && item.isAvailable) {
                const price = item.sku.promotion_price || item.sku.price;
                return amount + price * item.quantity;
            }
            return amount;
        }, 0);
    });

    // 计算可用商品
    const availableItems = computed(() => {
        return cartItems.value.filter(item => item.isAvailable);
    });

    // 是否有可用商品
    const hasAvailableItems = computed(() => availableItems.value.length > 0);

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

    // 检测网络状态
    const checkNetworkStatus = () => {
        // 在真实应用中，这应当基于navigator.onLine和网络请求测试
        return navigator.onLine;
    };

    // 将离线变更标记为待同步
    const markOfflineChangesForSync = () => {
        if (hasOfflineChanges.value && checkNetworkStatus()) {
            // 标记所有离线项为待同步
            cartItems.value = cartItems.value.map(item => {
                if ((item as OfflineCartItem).offline) {
                    return {
                        ...item,
                        pendingSync: true
                    } as OfflineCartItem;
                }
                return item;
            });
            
            // 触发同步
            syncOfflineChanges();
        }
    };

    // 同步离线变更到服务器
    const syncOfflineChanges = async () => {
        if (!checkNetworkStatus() || !hasOfflineChanges.value) return;
        
        const offlineItems = cartItems.value.filter(
            item => (item as OfflineCartItem).offline && (item as OfflineCartItem).pendingSync
        ) as OfflineCartItem[];
        
        if (offlineItems.length === 0) return;
        
        try {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return;
            
            // 为每个离线项创建同步请求
            const syncPromises = offlineItems.map(async (item) => {
                try {
                    if (item.id < 0) {
                        // 新添加的项，调用添加API
                        const res = await addToCartApi({
                            productId: item.productId,
                            skuId: item.skuId,
                            quantity: item.quantity
                        });
                        return { success: true, oldId: item.id, newItem: res.data };
                    } else {
                        // 更新的项，调用更新API
                        await updateCartItemApi(item.id, { quantity: item.quantity });
                        return { success: true, oldId: item.id, updated: true };
                    }
                } catch (error) {
                    console.error(`同步购物车项 ${item.id} 失败:`, error);
                    return { success: false, oldId: item.id, error };
                }
            });
            
            // 等待所有同步请求完成
            const results = await Promise.allSettled(syncPromises);
            
            // 计算成功同步的项数
            const successCount = results.filter(
                r => r.status === 'fulfilled' && (r.value as any).success
            ).length;
            
            if (successCount > 0) {
                // 至少有一项同步成功，重新加载购物车
                await loadCartList();
                showNotify({ type: 'success', message: `已同步${successCount}项到服务器` });
                hasOfflineChanges.value = false;
            } else {
                showNotify({ type: 'warning', message: '同步购物车失败，将在恢复网络后重试' });
            }
        } catch (error) {
            console.error('同步离线购物车失败:', error);
            showNotify({ type: 'danger', message: '同步购物车失败' });
        }
    };

    // 加载购物车列表
    const loadCartList = async (pageNum = 1, pageSize = 10) => {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return null;

        // 检查网络连接
        if (!checkNetworkStatus()) {
            offlineMode.value = true;
            showNotify({ type: 'warning', message: '当前处于离线模式，显示本地购物车数据' });
            return { data: cartItems.value, total: total.value, page: 1, limit: pageSize };
        }

        loading.value = true;
        try {
            const res = await getCartListApi({
                page: pageNum,
                limit: pageSize
            });
            
            cartItems.value = res.data.data;
            total.value = res.data.total;
            page.value = res.data.page;
            limit.value = res.data.limit;
            lastSyncTime.value = Date.now();
            offlineMode.value = false;
            
            // 保存到本地存储
            saveToStorage();
            
            return res.data;
        } catch (error) {
            console.error('获取购物车列表失败:', error);
            offlineMode.value = true;
            
            // 使用本地缓存数据
            showNotify({ 
                type: 'warning', 
                message: '无法连接服务器，使用本地购物车数据' 
            });
            
            return { 
                data: cartItems.value, 
                total: total.value, 
                page: 1, 
                limit: pageSize 
            };
        } finally {
            loading.value = false;
        }
    };

    // 添加商品到购物车
    const addToCart = async (data: AddCartItemParams) => {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return false;

        // 生成临时ID（使用负数避免与服务器ID冲突）
        const tempId = -Date.now();

        // 创建临时购物车项
        const tempItem: OfflineCartItem = {
            id: tempId,
            userId: userStore.userInfo?.id || '',
            productId: data.productId,
            skuId: data.skuId,
            quantity: data.quantity || 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isAvailable: true,
            offline: !checkNetworkStatus(),
            pendingSync: false
        };

        // 立即更新本地购物车状态
        cartItems.value.unshift(tempItem);
        total.value += 1;

        // 立即显示轻量级成功提示
        showNotify({ type: 'success', message: '已加入购物车' });

        // 如果离线，标记有未同步的更改并返回
        if (!checkNetworkStatus()) {
            hasOfflineChanges.value = true;
            saveToStorage();
            return true;
        }

        try {
            const res = await addToCartApi(data);
            
            // 用服务器返回的项替换临时项
            cartItems.value = cartItems.value.map(item => {
                if (item.id === tempId) {
                    return res.data;
                }
                return item;
            });
            
            lastSyncTime.value = Date.now();
            saveToStorage();
            
            return true;
        } catch (error) {
            console.error('添加到购物车失败:', error);

            // 请求失败但保留本地添加，标记为离线项
            cartItems.value = cartItems.value.map(item => {
                if (item.id === tempId) {
                    return { ...item, offline: true } as OfflineCartItem;
                }
                return item;
            });
            
            hasOfflineChanges.value = true;
            saveToStorage();
            
            showNotify({ 
                type: 'warning', 
                message: '网络问题，商品已添加到本地购物车' 
            });
            
            return true;
        }
    };

    // 更新购物车商品数量 
    const updateCartItem = async (id: number, data: UpdateCartItemParams) => {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return false;

        // 立即更新本地状态（保证UI响应）
        cartItems.value = cartItems.value.map(item => {
            if (item.id === id) {
                return { ...item, quantity: data.quantity };
            }
            return item;
        });
        
        // 保存到本地存储
        saveToStorage();

        // 如果离线，标记有未同步的更改并返回
        if (!checkNetworkStatus()) {
            cartItems.value = cartItems.value.map(item => {
                if (item.id === id) {
                    return { 
                        ...item, 
                        quantity: data.quantity,
                        offline: true,
                        pendingSync: false
                    } as OfflineCartItem;
                }
                return item;
            });
            
            hasOfflineChanges.value = true;
            saveToStorage();
            return true;
        }

        // 处理更新队列
        if (!updateQueue.value[id]) {
            updateQueue.value[id] = {
                quantity: data.quantity,
                pending: false,
                timer: undefined
            };
        } else {
            // 清除之前的计时器
            if (updateQueue.value[id].timer) {
                clearTimeout(updateQueue.value[id].timer);
            }
            // 更新最新数量
            updateQueue.value[id].quantity = data.quantity;
        }

        // 设置新的延迟同步计时器
        updateQueue.value[id].timer = window.setTimeout(() => {
            // 只有在没有进行中的请求时才同步
            if (!updateQueue.value[id].pending) {
                syncCartItem(id);
            }
        }, DEBOUNCE_DELAY);

        return true;
    };

    // 同步购物车项到服务器的函数
    const syncCartItem = async (id: number) => {
        if (!updateQueue.value[id]) return;

        // 清除计时器
        if (updateQueue.value[id].timer) {
            clearTimeout(updateQueue.value[id].timer);
            updateQueue.value[id].timer = undefined;
        }

        // 检查网络连接
        if (!checkNetworkStatus()) {
            // 如果离线，标记为待同步
            cartItems.value = cartItems.value.map(item => {
                if (item.id === id) {
                    return { 
                        ...item, 
                        offline: true,
                        pendingSync: false
                    } as OfflineCartItem;
                }
                return item;
            });
            
            hasOfflineChanges.value = true;
            delete updateQueue.value[id];
            saveToStorage();
            return;
        }

        // 标记为正在处理
        updateQueue.value[id].pending = true;

        try {
            // 发送最新数量到服务器
            await updateCartItemApi(id, { quantity: updateQueue.value[id].quantity });

            // 同步完成，从队列中移除
            delete updateQueue.value[id];
            lastSyncTime.value = Date.now();
            saveToStorage();
        } catch (error) {
            console.error('购物车同步失败:', error);

            // 失败后标记为离线项
            cartItems.value = cartItems.value.map(item => {
                if (item.id === id) {
                    return { 
                        ...item, 
                        offline: true,
                        pendingSync: false
                    } as OfflineCartItem;
                }
                return item;
            });
            
            hasOfflineChanges.value = true;
            delete updateQueue.value[id];
            saveToStorage();

            // 显示离线模式提示
            showNotify({ 
                type: 'warning', 
                message: '网络问题，更改已保存到本地' 
            });
        }
    };

    // 删除购物车商品 
    const removeCartItem = async (id: number) => {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return false;

        // 保存要删除的商品，以便在失败时回滚
        const removedItem = cartItems.value.find(item => item.id === id);
        const originalIndex = cartItems.value.findIndex(item => item.id === id);

        // 立即从本地购物车中移除（乐观更新）
        cartItems.value = cartItems.value.filter(item => item.id !== id);
        total.value -= 1;

        // 显示轻量级成功提示
        showNotify({ type: 'success', message: '已移除商品' });
        
        // 保存到本地存储
        saveToStorage();

        // 如果离线或是本地临时项，直接返回成功
        if (!checkNetworkStatus() || id < 0) {
            if (!checkNetworkStatus()) {
                hasOfflineChanges.value = true;
                saveToStorage();
            }
            return true;
        }

        try {
            // 后台静默发送删除请求
            await deleteCartItemApi(id);
            lastSyncTime.value = Date.now();
            saveToStorage();
            return true;
        } catch (error) {
            console.error('删除购物车商品失败:', error);

            // 显示错误提示
            showNotify({ type: 'warning', message: '网络问题，商品已在本地移除' });

            // 不回滚本地状态，但标记有离线更改
            hasOfflineChanges.value = true;
            saveToStorage();
            return true;
        }
    };

    // 清空购物车 
    const clearAllCart = async () => {
        const userStore = useUserStore();
        if (!userStore.isLoggedIn) return false;

        // 保存当前购物车状态，以便在失败时回滚
        const originalItems = [...cartItems.value];
        const originalTotal = total.value;

        // 立即清空本地购物车（乐观更新）
        cartItems.value = [];
        total.value = 0;

        // 显示轻量级成功提示
        showNotify({ type: 'success', message: '购物车已清空' });
        
        // 保存到本地存储
        saveToStorage();

        // 如果离线，标记有未同步的更改并返回
        if (!checkNetworkStatus()) {
            hasOfflineChanges.value = true;
            saveToStorage();
            return true;
        }

        try {
            // 后台静默发送清空请求
            await clearCartApi();
            lastSyncTime.value = Date.now();
            hasOfflineChanges.value = false;
            saveToStorage();
            return true;
        } catch (error) {
            console.error('清空购物车失败:', error);

            // 显示错误提示
            showNotify({ 
                type: 'warning', 
                message: '网络问题，购物车已在本地清空' 
            });

            // 不回滚本地状态，但标记有离线更改
            hasOfflineChanges.value = true;
            saveToStorage();
            return true;
        }
    };

    // 重置购物车状态
    const resetCart = () => {
        cartItems.value = [];
        total.value = 0;
        page.value = 1;
        lastSyncTime.value = 0;
        hasOfflineChanges.value = false;
        offlineMode.value = false;
        updateQueue.value = {};
        
        // 清除本地存储
        storage.remove(STORAGE_KEYS.CART);
    };

    // 在订单创建前同步购物车
    const syncCartBeforeCheckout = async () => {
        // 先同步所有离线更改
        if (hasOfflineChanges.value) {
            if (!checkNetworkStatus()) {
                showNotify({ 
                    type: 'warning', 
                    message: '请连接网络后再结算' 
                });
                return false;
            }
            
            await syncOfflineChanges();
        }
        
        // 检查是否有待同步项
        const pendingUpdates = Object.keys(updateQueue.value).length;

        if (pendingUpdates === 0) {
            return true; // 无需同步
        }

        // 显示加载提示
        const toast = showLoadingToast({ message: '正在同步购物车...' });

        try {
            // 创建所有待同步项的同步请求数组
            const syncPromises = Object.entries(updateQueue.value).map(([idStr, queueItem]) => {
                const id = parseInt(idStr);
                // 立即发送同步请求，不等待之前的状态
                return updateCartItemApi(id, { quantity: queueItem.quantity });
            });

            // 等待所有同步请求完成
            if (syncPromises.length > 0) {
                await Promise.all(syncPromises);
            }

            // 清空同步队列
            updateQueue.value = {};
            lastSyncTime.value = Date.now();
            saveToStorage();

            closeToast();
            return true;
        } catch (error) {
            console.error('结算前同步购物车失败:', error);
            closeToast();
            showNotify({ type: 'warning', message: '部分商品数量未能同步，请重试' });
            return false;
        }
    };

    // 在结算前预览订单金额（包含满减优惠） 
    const previewOrderAmount = async (cartItemIds: number[]) => {
        if (cartItemIds.length === 0) {
            return {
                totalAmount: 0,
                discountAmount: 0,
                paymentAmount: 0,
                promotion: null,
                items: []
            };
        }

        // 检查网络连接
        if (!checkNetworkStatus()) {
            showNotify({ 
                type: 'warning', 
                message: '请连接网络后再计算订单金额' 
            });
            return null;
        }

        // 显示加载状态
        showLoadingToast({ message: '计算中...' });

        try {
            // 先同步购物车以确保数据最新
            await syncCartBeforeCheckout();

            // 调用预览API
            const res = await previewOrderAmountApi({ cartItemIds });
            closeToast();
            return res.data;
        } catch (error) {
            closeToast();
            console.error('获取订单预览失败:', error);
            showNotify({ type: 'warning', message: '计算订单金额失败' });
            return null;
        }
    };

    // 为快速购买添加新方法
    const previewDirectOrderAmount = async (productInfo: {
        productId: number;
        skuId: number;
        quantity: number;
    }) => {
        // 检查网络连接
        if (!checkNetworkStatus()) {
            showNotify({ 
                type: 'warning', 
                message: '请连接网络后再计算订单金额' 
            });
            return null;
        }

        showLoadingToast({ message: '计算中...' });

        try {
            const res = await previewOrderAmountApi({ productInfo });
            closeToast();
            return res.data;
        } catch (error) {
            closeToast();
            console.error('获取直接购买预览失败:', error);
            showNotify({ type: 'warning', message: '计算订单金额失败' });
            return null;
        }
    };

    return {
        // 状态
        cartItems,
        total,
        page,
        limit,
        loading,
        updateQueue,
        lastSyncTime,
        offlineMode,
        hasOfflineChanges,

        // 计算属性
        cartItemCount,
        totalAmount,
        availableItems,
        hasAvailableItems,
        uniqueItemCount,
        syncStatus,

        // 方法
        loadCartList,
        addToCart,
        updateCartItem,
        syncCartBeforeCheckout,
        removeCartItem,
        clearAllCart,
        resetCart,
        syncCartItem,
        previewOrderAmount,
        previewDirectOrderAmount,
        checkNetworkStatus,
        syncOfflineChanges,
        markOfflineChangesForSync,
        saveToStorage
    };
});