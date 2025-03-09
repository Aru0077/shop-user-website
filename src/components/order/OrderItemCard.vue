<!-- //订单项卡片组件 OrderItemCard.vue -->
<template>
      <div class="order-card bg-white mb-2 rounded">
            <!-- 订单头部 -->
            <div class="order-header flex justify-between items-center px-2 py-1 border-b border-gray-100">
                  <div class="flex items-center">
                        <div class="text-[14px] font-bold">订单号: {{ order.orderNo }}</div>
                  </div>
                  <div class="order-status px-2 py-0.5 rounded-full text-[12px]"
                        :class="getStatusClass(order.orderStatus)">
                        {{ getStatusText(order.orderStatus) }}
                  </div>
            </div>

            <!-- 订单商品列表 -->
            <div class="order-items px-2 py-1" @click="$emit('view-detail', order.id)">
                  <div v-for="(item, index) in order.orderItems.slice(0, 2)" :key="index" class="order-item flex mb-2">
                        <!-- 商品图片 -->
                        <van-image :src="item.mainImage" fit="cover" width="60" height="60" radius="4px" />

                        <!-- 商品信息 -->
                        <div class="flex-1 ml-2">
                              <div class="text-[14px] truncate">{{ item.productName }}</div>
                              <div class="text-[12px] text-gray-500 mt-1">
                                    {{ formatSkuSpecs(item.skuSpecs) }}
                              </div>
                              <div class="flex justify-between mt-1">
                                    <div class="text-[14px]">{{ formatPrice(item.unitPrice) }}</div>
                                    <div class="text-[12px] text-gray-500">x{{ item.quantity }}</div>
                              </div>
                        </div>
                  </div>

                  <!-- 显示更多商品提示 -->
                  <div v-if="order.orderItems.length > 2" class="text-center text-[12px] text-gray-400 mt-1">
                        共{{ order.orderItems.length }}件商品 >
                  </div>
            </div>

            <!-- 订单金额信息 -->
            <div class="order-total flex justify-between items-center px-2     py-1 border-t border-gray-100">
                  <div class="text-[12px] text-gray-500">
                        {{ formatDate(order.createdAt) }}
                  </div>
                  <div class="text-[14px]">
                        合计: <span class="font-bold">{{ formatPrice(order.totalAmount) }}</span>
                  </div>
            </div>

            <!-- 订单操作按钮 -->
            <div class="order-actions flex justify-end px-2 py-1 border-t border-gray-100">
                  <template v-if="order.orderStatus === OrderStatus.PENDING_PAYMENT">
                        <van-button class="mr-2" size="small" @click="cancelOrder(order.id)">取消订单</van-button>
                        <van-button type="primary" size="small" @click="payOrder(order.id)">去支付</van-button>
                  </template>
                  <template v-else-if="order.orderStatus === OrderStatus.PENDING_SHIPMENT">
                        <van-button size="small" @click="viewOrderDetail(order.id)">查看详情</van-button>
                  </template>
                  <template v-else-if="order.orderStatus === OrderStatus.SHIPPED">
                        <van-button class="mr-2" size="small" @click="viewLogistics(order.id)">查看物流</van-button>
                        <van-button type="primary" size="small" @click="confirmReceipt(order.id)">确认收货</van-button>
                  </template>
                  <template v-else-if="order.orderStatus === OrderStatus.COMPLETED">
                        <van-button size="small" @click="viewOrderDetail(order.id)">查看详情</van-button>
                  </template>
                  <template v-else>
                        <van-button size="small" @click="viewOrderDetail(order.id)">查看详情</van-button>
                  </template>
            </div>
      </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import { Order, OrderStatus, OrderStatusText } from '@/types/order.type';
import formatPrice from '@/utils/formatPrice';
import { showToast } from 'vant';

// 定义属性
const props = defineProps<{
      order: Order
}>();

// 定义事件
const emit = defineEmits<{
      (e: 'view-detail', orderId: string): void
}>();

// 路由实例
const router = useRouter();

// 获取订单状态文本
const getStatusText = (status: OrderStatus): string => {
      return OrderStatusText[status];
};

// 获取订单状态样式类
const getStatusClass = (status: OrderStatus): string => {
      switch (status) {
            case OrderStatus.PENDING_PAYMENT:
                  return 'bg-red-50 text-red-500';
            case OrderStatus.PENDING_SHIPMENT:
                  return 'bg-orange-50 text-orange-500';
            case OrderStatus.SHIPPED:
                  return 'bg-blue-50 text-blue-500';
            case OrderStatus.COMPLETED:
                  return 'bg-green-50 text-green-500';
            case OrderStatus.CANCELLED:
                  return 'bg-gray-50 text-gray-500';
            default:
                  return 'bg-gray-50 text-gray-500';
      }
};

// 格式化SKU规格
const formatSkuSpecs = (specs: { specName: string; specValue: string }[]): string => {
      if (!specs || specs.length === 0) return '';
      return specs.map(spec => `${spec.specName}: ${spec.specValue}`).join(', ');
};

// 格式化日期
const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 查看订单详情
const viewOrderDetail = (orderId: string) => {
      emit('view-detail', orderId);
};

// 取消订单
const cancelOrder = (orderId: string) => {
      // 实际项目中这里需要调用取消订单的API
      showToast('取消订单功能暂未实现');
};

// 支付订单
const payOrder = (orderId: string) => {
      router.push(`/order/pay/${orderId}`);
};

// 查看物流
const viewLogistics = (orderId: string) => {
      // 实际项目中这里需要跳转到物流页面
      showToast('查看物流功能暂未实现');
};

// 确认收货
const confirmReceipt = (orderId: string) => {
      // 实际项目中这里需要调用确认收货的API
      showToast('确认收货功能暂未实现');
};
</script>

<style scoped>
.order-card {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.order-status {
      font-weight: 500;
}

.order-item:last-child {
      margin-bottom: 0;
}
</style>