<!-- //订单详情页面 OrderDetail.vue -->
<template>
    <div class="flex flex-col h-full">
        <!-- 订单详情区 -->
        <div class="flex-1 overflow-y-auto pageContent">
            <!-- 顶部标题 -->
            <div class="px-[5px] mb-2 flex items-center">
                <div class="text-[25px] font-bold leading-4 text-black">Order Detail</div>
            </div>

            <div v-if="loading" class="flex justify-center items-center h-[200px]">
                <van-loading type="spinner" size="24px">加载中...</van-loading>
            </div>

            <div v-else-if="!orderDetail" class="flex flex-col items-center justify-center py-10">
                <FileX :size="64" class="text-gray-300 mb-4" />
                <div class="text-gray-400">订单不存在或已被删除</div>
                <van-button class="mt-4" type="primary" @click="goOrderList">返回订单列表</van-button>
            </div>

            <template v-else>
                <!-- 订单状态卡片 -->
                <div class="status-card bg-black text-white py-1 px-1 rounded-md mb-2">
                    <div class="flex justify-between items-center">
                        <div class="text-[20px] font-bold">{{ getStatusText(orderDetail.orderStatus) }}</div>
                        <Clock :size="24"
                            v-if="orderDetail.orderStatus === OrderStatus.PENDING_PAYMENT && orderDetail.timeoutSeconds" />
                    </div>
                    <div class="text-[14px] mt-1"
                        v-if="orderDetail.orderStatus === OrderStatus.PENDING_PAYMENT && orderDetail.timeoutSeconds">
                        剩余支付时间: {{ formatRemainingTime(orderDetail.timeoutSeconds) }}
                    </div>
                </div>

                <!-- 收货地址卡片 -->
                <div class="address-card bg-white p-[5px] rounded-md mb-2">
                    <div class="flex items-start">
                        <MapPin class="mr-2 mt-1 flex-shrink-0" :size="18" />
                        <div>
                            <div class="flex items-center">
                                <div class="text-[16px] font-bold">{{ orderDetail.shippingAddress.receiverName }},</div>
                                <div class="text-[14px] ml-1">{{ orderDetail.shippingAddress.receiverPhone }}</div>
                            </div>
                            <div class="text-[14px] text-gray-500 mt-1">
                                {{ formatAddress(orderDetail.shippingAddress) }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 订单商品卡片 -->
                <div class="order-items-card bg-white rounded-md mb-2 p-2">
                    <div class="text-[16px] font-bold mb-2">商品信息</div>

                    <div v-for="(item, index) in orderDetail.orderItems" :key="index" class="order-item flex mb-3">
                        <!-- 商品图片 -->
                        <van-image :src="item.mainImage" fit="cover" width="80" height="80" radius="4px" />

                        <!-- 商品信息 -->
                        <div class="flex-1 ml-2">
                            <div class="text-[16px]">{{ item.productName }}</div>
                            <div class="text-[12px] text-gray-500 mt-1">
                                {{ formatSkuSpecs(item.skuSpecs) }}
                            </div>
                            <div class="flex justify-between mt-2">
                                <div class="text-[16px] font-bold">{{ formatPrice(item.unitPrice) }}</div>
                                <div class="text-[14px] text-gray-500">x{{ item.quantity }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 订单信息卡片 -->
                <div class="order-info-card bg-white p-2 rounded-md mb-2">
                    <div class="text-[16px] font-bold mb-2">订单信息</div>

                    <div class="info-item flex justify-between py-1">
                        <div class="text-[14px] text-gray-500">订单编号</div>
                        <div class="text-[14px]">{{ orderDetail.orderNo }}</div>
                    </div>

                    <div class="info-item flex justify-between py-1">
                        <div class="text-[14px] text-gray-500">创建时间</div>
                        <div class="text-[14px]">{{ formatDate(orderDetail.createdAt) }}</div>
                    </div>

                    <div class="info-item flex justify-between py-1">
                        <div class="text-[14px] text-gray-500">支付状态</div>
                        <div class="text-[14px]">{{ getPaymentStatusText(orderDetail.paymentStatus) }}</div>
                    </div>

                    <div v-if="orderDetail.paymentLogs && orderDetail.paymentLogs.length > 0"
                        class="info-item flex justify-between py-1">
                        <div class="text-[14px] text-gray-500">支付方式</div>
                        <div class="text-[14px]">{{ orderDetail.paymentLogs[0].paymentType }}</div>
                    </div>
                </div>

                <!-- 金额信息卡片 -->
                <div class="amount-card bg-white p-2 rounded-md mb-4">
                    <div class="text-[16px] font-bold mb-2">金额信息</div>

                    <div class="amount-item flex justify-between py-1">
                        <div class="text-[14px] text-gray-500">商品总价</div>
                        <div class="text-[14px]">{{ formatPrice(orderDetail.totalAmount) }}</div>
                    </div>

                    <div class="amount-item flex justify-between py-1">
                        <div class="text-[14px] text-gray-500">实付金额</div>
                        <div class="text-[18px] font-bold text-red-500">{{ formatPrice(orderDetail.paymentAmount) }}
                        </div>
                    </div>
                </div>
            </template>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ChevronLeft, MapPin, Clock, FileX } from 'lucide-vue-next';
import { showToast, showDialog } from 'vant';
import { useOrderStore } from '@/store/order.store';
import { Order, OrderStatus, OrderStatusText, PaymentStatus, PaymentStatusText } from '@/types/order.type';
import formatPrice from '@/utils/formatPrice';

// 路由实例
const route = useRoute();
const router = useRouter();

// 初始化订单store
const orderStore = useOrderStore();

// 订单ID
const orderId = computed(() => route.params.id as string);

// 加载状态
const loading = ref(true);

// 订单详情
const orderDetail = computed(() => orderStore.currentOrder);

// 加载订单详情
const loadOrderDetail = async () => {
    if (!orderId.value) {
        showToast('订单ID不存在');
        return;
    }

    loading.value = true;
    try {
        const result = await orderStore.loadOrderDetail(orderId.value);
        if (!result) {
            showToast('获取订单详情失败');
        }
    } catch (error) {
        console.error('加载订单详情失败:', error);
        showToast('加载订单详情失败，请稍后重试');
    } finally {
        loading.value = false;
    }
};

// 获取订单状态文本
const getStatusText = (status: OrderStatus): string => {
    return OrderStatusText[status];
};

// 获取支付状态文本
const getPaymentStatusText = (status: PaymentStatus): string => {
    return PaymentStatusText[status];
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

// 格式化地址
const formatAddress = (address: {
    province: string;
    city: string;
    detailAddress: string;
}): string => {
    return `${address.province} ${address.city} ${address.detailAddress}`;
};

// 格式化剩余支付时间
const formatRemainingTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
};

// 返回上一页
const goBack = () => {
    router.back();
};

// 返回订单列表
const goOrderList = () => {
    router.push('/order/list');
};

// 取消订单
const cancelOrder = () => {
    showDialog({
        title: '取消订单',
        message: '确定要取消该订单吗？',
        showCancelButton: true,
    }).then((result) => {
        if (result === 'confirm') {
            showToast('取消订单功能暂未实现');
        }
    });
};

// 支付订单
const payOrder = () => {
    if (!orderDetail.value) return;
    router.push(`/order/pay/${orderDetail.value.id}`);
};

// 联系客服
const contactService = () => {
    showToast('联系客服功能暂未实现');
};

// 查看物流
const viewLogistics = () => {
    showToast('查看物流功能暂未实现');
};

// 确认收货
const confirmReceipt = () => {
    showDialog({
        title: '确认收货',
        message: '确认已收到商品吗？',
        showCancelButton: true,
    }).then((result) => {
        if (result === 'confirm') {
            showToast('确认收货功能暂未实现');
        }
    });
};

// 删除订单
const deleteOrder = () => {
    showDialog({
        title: '删除订单',
        message: '确定要删除该订单吗？删除后不可恢复。',
        showCancelButton: true,
    }).then((result) => {
        if (result === 'confirm') {
            showToast('删除订单功能暂未实现');
        }
    });
};

// 再次购买
const buyAgain = () => {
    showToast('再次购买功能暂未实现');
};

// 页面加载时获取订单详情
onMounted(() => {
    // 清除之前的订单详情
    orderStore.clearCurrentOrder();

    loadOrderDetail();
});
</script>

<style scoped>
.pageContent {
    padding-bottom: 60px;
}

.info-item,
.amount-item {
    border-bottom: 1px solid #f5f5f5;
}

.info-item:last-child,
.amount-item:last-child {
    border-bottom: none;
}

.order-item {
    border-bottom: 1px solid #f5f5f5;
    padding-bottom: 12px;
}

.order-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
}
</style>