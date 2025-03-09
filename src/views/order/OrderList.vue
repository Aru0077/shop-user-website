<!-- //订单列表页面 OrderList.vue -->
<template>
    <div class="flex flex-col h-full">
        <!-- 订单列表区 -->
        <div class="flex-1 overflow-y-auto pageContent">
            <!-- 顶部标题 -->
            <div class="px-[5px] mb-2">
                <div class="text-[25px] font-bold leading-4 text-black">My Orders</div>
            </div>

            <!-- 订单过滤器 -->
            <div class="px-[5px] mb-2">
                <div class="flex overflow-x-auto hide-scrollbar">
                    <div v-for="(status, index) in statusFilters" :key="index"
                        class="status-filter px-2 py-0.5 mr-2 rounded-full text-[14px]"
                        :class="{ 'active': currentStatus === status.value }" @click="setStatusFilter(status.value)">
                        {{ status.label }}
                    </div>
                </div>
            </div>

            <!-- 订单列表 -->
            <div class="order-list px-[5px]">
                <OrderItemCard v-for="order in filteredOrders" :key="order.id" :order="order"
                    @view-detail="viewOrderDetail" />

                <!-- 加载状态 -->
                <div v-if="loading" class="py-4 text-center">
                    <van-loading type="spinner" size="24px">加载中...</van-loading>
                </div>

                <!-- 无订单展示 -->
                <div v-if="!loading && filteredOrders.length === 0"
                    class="flex flex-col items-center justify-center py-10">
                    <ShoppingBag :size="64" class="text-gray-300 mb-4" />
                    <div class="text-gray-400">暂无订单</div>
                    <van-button class="mt-4" type="primary" @click="goShopping">去购物</van-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ShoppingBag } from 'lucide-vue-next';
import { useOrderStore } from '@/store/order.store';
import { OrderStatus } from '@/types/order.type';
import OrderItemCard from '@/components/order/OrderItemCard.vue';
import { showNotify } from 'vant';

// 路由实例
const router = useRouter();

// 初始化订单store
const orderStore = useOrderStore();

// 加载状态
const loading = ref(false);

// 当前选中的状态过滤器
const currentStatus = ref<OrderStatus | null>(null);

// 状态过滤器选项
const statusFilters = [
    { label: '全部', value: null },
    { label: '待付款', value: OrderStatus.PENDING_PAYMENT },
    { label: '待发货', value: OrderStatus.PENDING_SHIPMENT },
    { label: '已发货', value: OrderStatus.SHIPPED },
    { label: '已完成', value: OrderStatus.COMPLETED },
    { label: '已取消', value: OrderStatus.CANCELLED }
];

// 根据状态过滤订单
const filteredOrders = computed(() => {
    if (currentStatus.value === null) {
        return orderStore.orders;
    }
    return orderStore.orders.filter(order => order.orderStatus === currentStatus.value);
});

// 设置状态过滤器
const setStatusFilter = (status: OrderStatus | null) => {
    currentStatus.value = status;
};

// 加载订单数据
const loadOrders = async () => {
    loading.value = true;
    try {
        // 检查本地缓存是否有数据
        if (orderStore.orders.length > 0) {
            // 已有本地缓存数据，使用现有数据
            console.log('使用本地缓存的订单数据');

            // 在后台静默更新数据
            setTimeout(() => {
                orderStore.loadOrderList().then(() => {
                    console.log('后台更新订单数据完成');
                }).catch(error => {
                    console.error('后台更新订单数据失败:', error);
                });
            }, 300);
        } else {
            // 本地无数据，从网络获取
            console.log('从网络获取订单数据');
            const result = await orderStore.loadOrderList();

            if (!result) {
                showNotify({ type: 'danger', message: '获取订单数据失败' });
            }
        }
    } catch (error) {
        console.error('加载订单失败:', error);
        showNotify({ type: 'danger', message: '加载订单失败，请稍后重试' });
    } finally {
        loading.value = false;
    }
};

// 查看订单详情
const viewOrderDetail = (orderId: string) => {
    router.push(`/order/detail/${orderId}`);
};

// 去购物
const goShopping = () => {
    router.push('/');
};

// 页面加载时获取订单数据
onMounted(() => {
    loadOrders();
});
</script>

<style scoped>
.pageContent {
    padding-bottom: 20px;
}

.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.status-filter {
    white-space: nowrap;
    background-color: #f5f5f5;
    color: #666;
    cursor: pointer;
}

.status-filter.active {
    background-color: #000;
    color: #fff;
    font-weight: 500;
}
</style>