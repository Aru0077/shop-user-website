// src/store/order.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  createOrder as createOrderApi,
  getOrderList as getOrderListApi,
  getOrderDetail as getOrderDetailApi,
  payOrder as payOrderApi
} from '@/api/order.api';
import { Order, OrderStatus, CreateOrderParams, PayOrderParams } from '@/types/order.type';
import { useUserStore } from './user.store';
import { showNotify, showLoadingToast, closeToast } from 'vant';

export const useOrderStore = defineStore('order', () => {
  // 状态
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const total = ref<number>(0);
  const page = ref<number>(1);
  const limit = ref<number>(10);
  const loading = ref<boolean>(false);

  // 计算属性
  const pendingPaymentOrders = computed(() => {
    return orders.value.filter(order => order.orderStatus === OrderStatus.PENDING_PAYMENT);
  });

  const pendingShipmentOrders = computed(() => {
    return orders.value.filter(order => order.orderStatus === OrderStatus.PENDING_SHIPMENT);
  });

  const shippedOrders = computed(() => {
    return orders.value.filter(order => order.orderStatus === OrderStatus.SHIPPED);
  });

  const completedOrders = computed(() => {
    return orders.value.filter(order => order.orderStatus === OrderStatus.COMPLETED);
  });

  // 创建订单
  const createOrder = async (data: CreateOrderParams) => {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) return null;

    showLoadingToast({
      message: '提交订单中...',
      forbidClick: true,
    });

    try {
      const res = await createOrderApi(data);
      currentOrder.value = res.data;
      closeToast();
      showNotify({ type: 'success', message: '订单创建成功' });
      return res.data;
    } catch (error) {
      closeToast();
      console.error('创建订单失败:', error);
      return null;
    }
  };

  // 加载订单列表
  const loadOrderList = async (params?: { page?: number; limit?: number; status?: number }) => {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) return null;

    loading.value = true;
    try {
      const res = await getOrderListApi(params);
      orders.value = res.data.data;
      total.value = res.data.total;
      page.value = res.data.page;
      limit.value = res.data.limit;
      return res.data;
    } catch (error) {
      console.error('获取订单列表失败:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // 获取订单详情
  const loadOrderDetail = async (id: string) => {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) return null;

    loading.value = true;
    try {
      const res = await getOrderDetailApi(id);
      currentOrder.value = res.data;
      return res.data;
    } catch (error) {
      console.error('获取订单详情失败:', error);
      return null;
    } finally {
      loading.value = false;
    }
  };

  // 支付订单
  const payOrder = async (id: string, data: PayOrderParams) => {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) return false;

    showLoadingToast({
      message: '支付中...',
      forbidClick: true,
    });

    try {
      const res = await payOrderApi(id, data);

      // 更新本地订单状态
      if (currentOrder.value && currentOrder.value.id === id) {
        currentOrder.value.orderStatus = OrderStatus.PENDING_SHIPMENT;
        currentOrder.value.paymentStatus = 1; // PAID
      }

      // 更新订单列表中的订单状态
      orders.value = orders.value.map(order => {
        if (order.id === id) {
          return {
            ...order,
            orderStatus: OrderStatus.PENDING_SHIPMENT,
            paymentStatus: 1 // PAID
          };
        }
        return order;
      });

      closeToast();
      showNotify({ type: 'success', message: '支付成功' });
      return true;
    } catch (error) {
      closeToast();
      console.error('支付订单失败:', error);
      return false;
    }
  };

  // 清除当前订单
  const clearCurrentOrder = () => {
    currentOrder.value = null;
  };

  // 重置订单状态
  const resetOrders = () => {
    orders.value = [];
    currentOrder.value = null;
    total.value = 0;
    page.value = 1;
  };

  return {
    // 状态
    orders,
    currentOrder,
    total,
    page,
    limit,
    loading,

    // 计算属性
    pendingPaymentOrders,
    pendingShipmentOrders,
    shippedOrders,
    completedOrders,

    // 方法
    createOrder,
    loadOrderList,
    loadOrderDetail,
    payOrder,
    clearCurrentOrder,
    resetOrders
  };
}, {
  persist: true
});