// src/composables/useDataAccess.ts
import { ref, computed, Ref } from 'vue';
import { useUserStore } from '@/store/user.store';
import { useProductStore } from '@/store/product.store';
import { useCartStore } from '@/store/cart.store';
import { useFavoriteStore } from '@/store/favorite.store';
import { useAddressStore } from '@/store/address.store';
import { useOrderStore } from '@/store/order.store';
import networkService from '@/utils/networkService';
import { ProductSortType } from '@/types/product.type';
import { showNotify } from 'vant';
import { storeToRefs } from 'pinia';

/**
 * 统一数据访问组合式API
 * 整合所有存储的数据访问方法，提供一致的接口和错误处理
 */
export default function useDataAccess() {
      // 获取所有存储
      const userStore = useUserStore();
      const productStore = useProductStore();
      const cartStore = useCartStore();
      const favoriteStore = useFavoriteStore();
      const addressStore = useAddressStore();
      const orderStore = useOrderStore();

      // 通用加载状态
      const loading = ref(false);
      const error = ref<string | null>(null);

      // 网络状态
      const isOnline = computed(() => networkService.isOnline.value);
      const isOfflineMode = computed(() =>
            productStore.offlineMode ||
            cartStore.offlineMode ||
            favoriteStore.offlineMode
      );

      /**
       * 统一错误处理
       */
      const handleError = (err: any, customMessage?: string) => {
            console.error('数据访问错误:', err);

            // 设置错误状态
            error.value = customMessage || (err.message as unknown as string) || '操作失败，请稍后重试';

            // 显示错误通知
            showNotify({
                  type: 'danger',
                  message: error.value
            });

            return null;
      };

      /**
       * 清除错误状态
       */
      const clearError = () => {
            error.value = null;
      };

      /**
       * 包装异步操作，统一处理加载状态和错误
       */
      const wrapAsync = async <T>(
            asyncFn: () => Promise<T>,
            errorMessage = '操作失败，请稍后重试'
      ): Promise<T | null> => {
            clearError();
            loading.value = true;

            try {
                  const result = await asyncFn();
                  return result;
            } catch (err: any) {
                  return handleError(err, errorMessage);
            } finally {
                  loading.value = false;
            }
      };

      // ===== 用户相关操作 =====

      /**
       * 用户登录
       */
      const login = async (username: string, password: string) => {
            return wrapAsync(
                  () => userStore.login({ username, password }),
                  '登录失败，请检查用户名和密码'
            );
      };

      /**
       * 用户注册
       */
      const register = async (username: string, password: string) => {
            return wrapAsync(
                  () => userStore.register({ username, password }),
                  '注册失败，请稍后重试'
            );
      };

      /**
       * 用户登出
       */
      const logout = async () => {
            return wrapAsync(
                  () => userStore.logout(),
                  '登出失败，请稍后重试'
            );
      };

      // ===== 商品相关操作 =====

      /**
       * 加载商品分类
       */
      const loadCategories = async (force = false) => {
            return wrapAsync(
                  () => productStore.loadCategoryTree(force),
                  '加载分类失败'
            );
      };

      /**
       * 加载首页数据
       */
      const loadHomeData = async (force = false) => {
            return wrapAsync(
                  () => productStore.loadHomeData(force),
                  '加载首页数据失败'
            );
      };

      /**
       * 加载商品列表（支持多种类型）
       */
      const loadProducts = async (
            type: string,
            options: {
                  id?: number;
                  keyword?: string;
                  page?: number;
                  limit?: number;
                  sort?: ProductSortType;
                  force?: boolean;
            } = {}
      ) => {
            return wrapAsync(
                  () => productStore.loadProductsByType(type, options),
                  '加载商品列表失败'
            );
      };

      /**
       * 加载商品详情
       */
      const loadProductDetail = async (productId: number) => {
            return wrapAsync(
                  () => productStore.loadProductDetail(productId),
                  '加载商品详情失败'
            );
      };

      /**
       * 搜索商品
       */
      const searchProducts = async (keyword: string, page = 1, limit = 10) => {
            return wrapAsync(
                  () => productStore.searchProducts(keyword, page, limit),
                  '搜索商品失败'
            );
      };

      // ===== 购物车相关操作 =====

      /**
       * 加载购物车
       */
      const loadCart = async () => {
            return wrapAsync(
                  () => cartStore.loadCartList(),
                  '加载购物车失败'
            );
      };

      /**
       * 添加商品到购物车
       */
      const addToCart = async (productId: number, skuId: number, quantity = 1) => {
            return wrapAsync(
                  () => cartStore.addToCart({ productId, skuId, quantity }),
                  '添加到购物车失败'
            );
      };

      /**
       * 更新购物车商品数量
       */
      const updateCartItem = async (itemId: number, quantity: number) => {
            return wrapAsync(
                  () => cartStore.updateCartItem(itemId, { quantity }),
                  '更新购物车失败'
            );
      };

      /**
       * 删除购物车商品
       */
      const removeFromCart = async (itemId: number) => {
            return wrapAsync(
                  () => cartStore.removeCartItem(itemId),
                  '从购物车移除失败'
            );
      };

      /**
       * 清空购物车
       */
      const clearCart = async () => {
            return wrapAsync(
                  () => cartStore.clearAllCart(),
                  '清空购物车失败'
            );
      };

      /**
       * 同步离线购物车
       */
      const syncCart = async () => {
            if (cartStore.hasOfflineChanges) {
                  return wrapAsync(
                        () => cartStore.syncOfflineChanges(),
                        '同步购物车失败'
                  );
            }
            return true;
      };

      // ===== 收藏相关操作 =====

      /**
       * 加载收藏列表
       */
      const loadFavorites = async (page = 1, limit = 10, force = false) => {
            return wrapAsync(
                  () => favoriteStore.loadFavorites(page, limit, force),
                  '加载收藏列表失败'
            );
      };

      /**
       * 加载收藏ID列表
       */
      const loadFavoriteIds = async (force = false) => {
            return wrapAsync(
                  () => favoriteStore.loadFavoriteIds(force),
                  '加载收藏ID列表失败'
            );
      };

      /**
       * 添加收藏
       */
      const addToFavorites = async (productId: number) => {
            return wrapAsync(
                  () => favoriteStore.addToFavorite(productId),
                  '添加收藏失败'
            );
      };

      /**
       * 取消收藏
       */
      const removeFromFavorites = async (productId: number) => {
            return wrapAsync(
                  () => favoriteStore.removeFromFavorite(productId),
                  '取消收藏失败'
            );
      };

      /**
       * 批量取消收藏
       */
      const batchRemoveFromFavorites = async (productIds: number[]) => {
            return wrapAsync(
                  () => favoriteStore.batchRemoveFromFavorites(productIds),
                  '批量取消收藏失败'
            );
      };

      /**
       * 切换收藏状态
       */
      const toggleFavorite = async (productId: number) => {
            return wrapAsync(
                  () => favoriteStore.toggleFavorite(productId),
                  '操作收藏失败'
            );
      };

      /**
       * 同步离线收藏
       */
      const syncFavorites = async () => {
            if (favoriteStore.hasOfflineChanges) {
                  return wrapAsync(
                        () => favoriteStore.syncOfflineChanges(),
                        '同步收藏失败'
                  );
            }
            return true;
      };

      // ===== 地址相关操作 =====

      /**
       * 加载地址列表
       */
      const loadAddresses = async () => {
            return wrapAsync(
                  () => addressStore.loadAddresses(),
                  '加载地址列表失败'
            );
      };

      /**
       * 创建地址
       */
      const createAddress = async (addressData: any) => {
            return wrapAsync(
                  () => addressStore.createAddress(addressData),
                  '创建地址失败'
            );
      };

      /**
       * 更新地址
       */
      const updateAddress = async (id: number, addressData: any) => {
            return wrapAsync(
                  () => addressStore.updateAddress(id, addressData),
                  '更新地址失败'
            );
      };

      /**
       * 删除地址
       */
      const deleteAddress = async (id: number) => {
            return wrapAsync(
                  () => addressStore.deleteAddress(id),
                  '删除地址失败'
            );
      };

      /**
       * 设置默认地址
       */
      const setDefaultAddress = async (id: number) => {
            return wrapAsync(
                  () => addressStore.setDefaultAddress(id),
                  '设置默认地址失败'
            );
      };

      // ===== 订单相关操作 =====

      /**
       * 加载订单列表
       */
      const loadOrders = async (status?: number) => {
            return wrapAsync(
                  () => orderStore.loadOrderList({ status }),
                  '加载订单列表失败'
            );
      };

      /**
       * 加载订单详情
       */
      const loadOrderDetail = async (orderId: string) => {
            return wrapAsync(
                  () => orderStore.loadOrderDetail(orderId),
                  '加载订单详情失败'
            );
      };

      /**
       * 创建订单
       */
      const createOrder = async (orderData: any) => {
            // 先同步购物车
            await cartStore.syncCartBeforeCheckout();

            return wrapAsync(
                  () => orderStore.createOrder(orderData),
                  '创建订单失败'
            );
      };

      /**
       * 支付订单
       */
      const payOrder = async (orderId: string, paymentData: any) => {
            return wrapAsync(
                  () => orderStore.payOrder(orderId, paymentData),
                  '支付订单失败'
            );
      };
      
      /**
       * 快速购买
       */
      const quickBuy = async (
            addressId: number,
            productId: number,
            skuId: number,
            quantity: number,
            remark: string = ''
      ) => {
            return wrapAsync(
                  () => orderStore.createOrder({
                        addressId, productId, skuId, quantity, remark
                  }),
                  '快速购买失败'
            );
      };

      // ===== 网络相关操作 =====

      /**
       * 检查网络状态
       */
      const checkNetwork = async () => {
            return wrapAsync(
                  () => networkService.checkNetworkStatus(),
                  '网络检测失败'
            );
      };

      /**
       * 同步所有离线数据
       */
      const syncAllOfflineData = async () => {
            if (!isOnline.value) {
                  showNotify({
                        type: 'warning',
                        message: '当前处于离线状态，无法同步'
                  });
                  return false;
            }

            loading.value = true;
            clearError();

            try {
                  const results = await Promise.allSettled([
                        cartStore.hasOfflineChanges ? cartStore.syncOfflineChanges() : Promise.resolve(true),
                        favoriteStore.hasOfflineChanges ? favoriteStore.syncOfflineChanges() : Promise.resolve(true)
                  ]);

                  const failures = results.filter(r => r.status === 'rejected').length;

                  if (failures > 0) {
                        showNotify({
                              type: 'warning',
                              message: `同步完成，但有${failures}项失败`
                        });
                  } else {
                        showNotify({
                              type: 'success',
                              message: '所有数据已成功同步'
                        });
                  }

                  return failures === 0;
            } catch (err) {
                  return handleError(err, '同步数据失败');
            } finally {
                  loading.value = false;
            }
      };

      return {
            // 状态
            loading,
            error,
            isOnline,
            isOfflineMode,

            // 工具方法
            clearError,

            // 用户操作
            login,
            register,
            logout,

            // 商品操作
            loadCategories,
            loadHomeData,
            loadProducts,
            loadProductDetail,
            searchProducts,

            // 购物车操作
            loadCart,
            addToCart,
            updateCartItem,
            removeFromCart,
            clearCart,
            syncCart,

            // 收藏操作
            loadFavorites,
            loadFavoriteIds,
            addToFavorites,
            removeFromFavorites,
            batchRemoveFromFavorites,
            toggleFavorite,
            syncFavorites,

            // 地址操作
            loadAddresses,
            createAddress,
            updateAddress,
            deleteAddress,
            setDefaultAddress,

            // 订单操作
            loadOrders,
            loadOrderDetail,
            createOrder,
            payOrder,
            quickBuy,

            // 网络操作
            checkNetwork,
            syncAllOfflineData,

            // 所有store的直接访问
            userStore,
            productStore,
            cartStore,
            favoriteStore,
            addressStore,
            orderStore
      };
}