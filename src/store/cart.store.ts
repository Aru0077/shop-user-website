// src/store/cart.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
      addToCart as addToCartApi,
      updateCartItem as updateCartItemApi,
      deleteCartItem as deleteCartItemApi,
      getCartList as getCartListApi,
      clearCart as clearCartApi
} from '@/api/cart.api';
import { CartItem, AddCartItemParams, UpdateCartItemParams } from '@/types/cart.type';
import { useUserStore } from './user.store';
import { showNotify, showLoadingToast, closeToast } from 'vant';

export const useCartStore = defineStore('cart', () => {
      // 状态
      const cartItems = ref<CartItem[]>([]);
      const total = ref<number>(0);
      const page = ref<number>(1);
      const limit = ref<number>(10);
      const loading = ref<boolean>(false);

      // 计算属性
      const cartItemCount = computed(() => {
            return cartItems.value.reduce((count, item) => count + item.quantity, 0);
      });

      const totalAmount = computed(() => {
            return cartItems.value.reduce((amount, item) => {
                  if (item.sku && item.isAvailable) {
                        const price = item.sku.promotion_price || item.sku.price;
                        return amount + price * item.quantity;
                  }
                  return amount;
            }, 0);
      });

      const availableItems = computed(() => {
            return cartItems.value.filter(item => item.isAvailable);
      });

      const hasAvailableItems = computed(() => availableItems.value.length > 0);

      // 加载购物车列表
      const loadCartList = async (pageNum = 1, pageSize = 10) => {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return null;

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
                  return res.data;
            } catch (error) {
                  console.error('获取购物车列表失败:', error);
                  return null;
            } finally {
                  loading.value = false;
            }
      };

      // 添加商品到购物车
      const addToCart = async (data: AddCartItemParams) => {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return false;

            showLoadingToast({
                  message: '添加中...',
                  forbidClick: true,
            });

            try {
                  await addToCartApi(data);
                  // 重新加载购物车列表以获取最新数据
                  await loadCartList();
                  closeToast();
                  showNotify({ type: 'success', message: '添加成功' });
                  return true;
            } catch (error) {
                  closeToast();
                  console.error('添加到购物车失败:', error);
                  return false;
            }
      };

      // 更新购物车商品数量
      const updateCartItem = async (id: number, data: UpdateCartItemParams) => {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return false;

            showLoadingToast({
                  message: '更新中...',
                  forbidClick: true,
            });

            try {
                  await updateCartItemApi(id, data);
                  // 更新本地购物车项
                  cartItems.value = cartItems.value.map(item => {
                        if (item.id === id) {
                              return { ...item, quantity: data.quantity };
                        }
                        return item;
                  });
                  closeToast();
                  return true;
            } catch (error) {
                  closeToast();
                  console.error('更新购物车失败:', error);
                  return false;
            }
      };

      // 删除购物车商品
      const removeCartItem = async (id: number) => {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return false;

            showLoadingToast({
                  message: '删除中...',
                  forbidClick: true,
            });

            try {
                  await deleteCartItemApi(id);
                  // 从本地购物车中移除
                  cartItems.value = cartItems.value.filter(item => item.id !== id);
                  total.value -= 1;
                  closeToast();
                  showNotify({ type: 'success', message: '删除成功' });
                  return true;
            } catch (error) {
                  closeToast();
                  console.error('删除购物车商品失败:', error);
                  return false;
            }
      };

      // 清空购物车
      const clearAllCart = async () => {
            const userStore = useUserStore();
            if (!userStore.isLoggedIn) return false;

            showLoadingToast({
                  message: '清空中...',
                  forbidClick: true,
            });

            try {
                  await clearCartApi();
                  // 清空本地购物车
                  cartItems.value = [];
                  total.value = 0;
                  closeToast();
                  showNotify({ type: 'success', message: '购物车已清空' });
                  return true;
            } catch (error) {
                  closeToast();
                  console.error('清空购物车失败:', error);
                  return false;
            }
      };

      // 重置购物车状态
      const resetCart = () => {
            cartItems.value = [];
            total.value = 0;
            page.value = 1;
      };

      return {
            // 状态
            cartItems,
            total,
            page,
            limit,
            loading,

            // 计算属性
            cartItemCount,
            totalAmount,
            availableItems,
            hasAvailableItems,

            // 方法
            loadCartList,
            addToCart,
            updateCartItem,
            removeCartItem,
            clearAllCart,
            resetCart
      };
}, {
      persist: true // 添加持久化配置
});