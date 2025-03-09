// src/store/order.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  createOrderApi,
  getOrderListApi,
  getOrderDetailApi,
  payOrderApi
} from '@/api/order.api';
import { Order, OrderStatus, CreateOrderParams, PayOrderParams } from '@/types/order.type';
import { CartItem } from '@/types/cart.type';
import { Address } from '@/types/address.type';
import { useUserStore } from './user.store';
import { showNotify, showLoadingToast, closeToast } from 'vant';


// 添加订单草稿接口
interface OrderDraft {
  cartItems: CartItem[];
  address: Address;
  totalAmount: number;
  cartItemIds: number[];
  createdAt: number; // 添加时间戳以便实现过期逻辑
}


export const useOrderStore = defineStore('order', () => {
  // 状态
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const total = ref<number>(0);
  const page = ref<number>(1);
  const limit = ref<number>(10);
  const loading = ref<boolean>(false);
  // 添加订单草稿状态
  const draftOrder = ref<OrderDraft | null>(null);


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

  // 设置订单草稿
  function setOrderDraft(draft: Omit<OrderDraft, 'createdAt'>) {
    draftOrder.value = {
      ...draft,
      createdAt: Date.now()
    };
  };

  // 获取订单草稿
  function getOrderDraft() {
    // 可以在这里添加过期检查逻辑
    if (draftOrder.value && Date.now() - draftOrder.value.createdAt > 30 * 60 * 1000) {
      // 如果草稿超过30分钟，清除它
      clearOrderDraft();
      return null;
    }
    return draftOrder.value;
  };

  // 清除订单草稿
  function clearOrderDraft() {
    draftOrder.value = null;
  };

  // 从草稿创建订单
  async function createOrderFromDraft() {
    const userStore = useUserStore();
    if (!userStore.isLoggedIn) return null;

    // 检查草稿是否存在
    const draft = getOrderDraft();
    if (!draft) return null;

    try {
      // 创建订单参数
      const params: CreateOrderParams = {
        addressId: draft.address.id,
        cartItemIds: draft.cartItemIds,
        remark: ''
      };

      // 调用创建订单API
      const res = await createOrderApi(params);
      currentOrder.value = res.data;
      return res.data;
    } catch (error) {
      console.error('从草稿创建订单失败:', error);
      return null;
    }
  };


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
    draftOrder,

    // 计算属性
    pendingPaymentOrders,
    pendingShipmentOrders,
    shippedOrders,
    completedOrders,

    // 方法
    setOrderDraft,
    getOrderDraft,
    clearOrderDraft,
    createOrderFromDraft,
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