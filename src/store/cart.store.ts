// src/store/cart.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
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

// 定义更新队列类型
interface UpdateQueueItem {
      quantity: number;
      pending: boolean;
      timer?: number;
}

// 定义防抖延迟常量
const DEBOUNCE_DELAY = 800; // 800毫秒

export const useCartStore = defineStore('cart', () => {
      // 状态
      const cartItems = ref<CartItem[]>([]);
      const total = ref<number>(0);
      const page = ref<number>(1);
      const limit = ref<number>(10);
      const loading = ref<boolean>(false);
      // 添加队列处理更新请求
      const updateQueue = ref<Record<number, UpdateQueueItem>>({});


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

            // 生成临时ID（使用负数避免与服务器ID冲突）
            const tempId = -Date.now();

            // 创建临时购物车项
            const tempItem: CartItem = {
                  id: tempId,
                  userId: userStore.userInfo?.id || '',
                  productId: data.productId,
                  skuId: data.skuId,
                  quantity: data.quantity || 1,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  isAvailable: true
            };

            // 立即更新本地购物车状态
            cartItems.value.unshift(tempItem);
            total.value += 1;

            // 立即显示轻量级成功提示
            showNotify({ type: 'success', message: '已加入购物车' });


            try {
                  await addToCartApi(data);
                  // 重新加载购物车列表以获取最新数据
                  setTimeout(() => {
                        loadCartList().catch(err => {
                              console.error('静默更新购物车失败:', err);
                        });
                  }, 300);

                  return true;
            } catch (error) {
                  console.error('添加到购物车失败:', error);

                  // 请求失败时回滚本地状态
                  cartItems.value = cartItems.value.filter(item => item.id !== tempId);
                  total.value -= 1;

                  // 仅在网络错误时显示失败通知（避免多余的错误提示）
                  showNotify({ type: 'danger', message: '添加失败，请重试' });
                  return false;
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

            // 标记为正在处理
            updateQueue.value[id].pending = true;

            try {
                  // 发送最新数量到服务器
                  await updateCartItemApi(id, { quantity: updateQueue.value[id].quantity });

                  // 同步完成，从队列中移除
                  delete updateQueue.value[id];
            } catch (error) {
                  console.error('购物车同步失败:', error);

                  // 失败后设置短暂延迟重试
                  updateQueue.value[id].pending = false;
                  updateQueue.value[id].timer = window.setTimeout(() => {
                        syncCartItem(id);
                  }, 2000); // 失败后2秒重试
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

            try {
                  // 后台静默发送删除请求
                  await deleteCartItemApi(id);
                  return true;
            } catch (error) {
                  console.error('删除购物车商品失败:', error);

                  // 显示错误提示
                  showNotify({ type: 'danger', message: '删除失败，已恢复商品' });

                  // 回滚本地状态
                  if (removedItem && originalIndex >= 0) {
                        // 还原到原来的位置
                        const newItems = [...cartItems.value];
                        newItems.splice(originalIndex, 0, removedItem);
                        cartItems.value = newItems;
                        total.value += 1;
                  }

                  return false;
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

            try {
                  // 后台静默发送清空请求
                  await clearCartApi();
                  return true;
            } catch (error) {
                  console.error('清空购物车失败:', error);

                  // 显示错误提示
                  showNotify({ type: 'danger', message: '操作失败，已恢复购物车' });

                  // 回滚本地状态
                  cartItems.value = originalItems;
                  total.value = originalTotal;

                  return false;
            }
      };
      // 重置购物车状态
      const resetCart = () => {
            cartItems.value = [];
            total.value = 0;
            page.value = 1;
      };

      // 在订单创建前同步购物车
      const syncCartBeforeCheckout = async () => {
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
                        cartItems: []
                  };
            }
      
            // 显示加载状态
            showLoadingToast({ message: '计算中...' });
      
            try {
                  // 先同步购物车以确保数据最新
                  await syncCartBeforeCheckout();
      
                  // 调用预览API
                  const res = await previewOrderAmountApi(cartItemIds);
                  closeToast();
                  return res.data;
            } catch (error) {
                  closeToast();
                  console.error('获取订单预览失败:', error);
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

            // 计算属性
            cartItemCount,
            totalAmount,
            availableItems,
            hasAvailableItems,
            uniqueItemCount,

            // 方法
            loadCartList,
            addToCart,
            updateCartItem,
            syncCartBeforeCheckout,
            removeCartItem,
            clearAllCart,
            resetCart,
            syncCartItem,
            previewOrderAmount
      };
}, {
      persist: true // 添加持久化配置
});