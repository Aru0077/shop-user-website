<!-- //购物车页面 cart.vue -->
<template>
    <div class="flex flex-col h-full">

        <!-- 商品列表区 -->
        <div class="flex-1 overflow-y-auto pageContent">
            <!-- 顶部标题 -->
            <div class="px-[5px]">
                <div class="text-[25px] font-bold leading-4 text-black">My Cart</div>
            </div>

            <!-- 单个商品 -->
            <div class="cartItem flex gap-1 py-2 w-full h-[90px]" v-for="(item, index) in cartItems" :key="index">
                <!-- 左侧图片 -->
                <van-image :src="item.product?.mainImage" fit="cover" radius="20px" />

                <!-- 右侧内容 -->
                <div class="flex-1">
                    <div class="flex justify-between">
                        <!-- 商品名称 sku 等数据 -->
                        <div class="flex flex-col justify-between">
                            <div>
                                <div class="text-[16px] font-bold">{{ item.product?.name }}</div>
                                <div class="text-[10px] mt-1">{{ formatSkuWithNames(item) }}</div>
                                <div class="text-[10px] mt-0.5">Stock: {{ item.sku?.stock }}</div>
                            </div>
                            <div class="text-[14px]"> {{ getSkuPrice(item) }} </div>

                        </div>

                        <!-- 操作区 -->
                        <div class="flex flex-col items-end justify-between  h-[90px]">
                            <Trash2 @click="removeItem(item)" />
                            <div class="flex items-center quantity-control">
                                <van-button class="quantity-btn flex items-center justify-center"
                                    @click="updateQuantity(item, -1)">
                                    <div class="minus-icon">-</div>
                                </van-button>

                                <van-field v-model="item.quantity" type="digit" class="quantity-input"
                                    :input-align="'center'" :border="false" :show-word-limit="false" />

                                <van-button class="quantity-btn flex items-center justify-center"
                                    @click="updateQuantity(item, 1)">
                                    <div class="plus-icon">+</div>
                                </van-button>
                            </div>


                        </div>
                    </div>

                </div>

            </div>
        </div>


        <!-- 底部操作区 -->
        <div class="h-[120px] flex flex-col  box-border">
            <!-- 使用地址选择器组件 -->
            <AddressSelector v-model="selectedAddress" />

            <div class=" bg-black w-full h-full flex justify-between items-center px-2 box-border">
                <div class=" text-white text-[25px]">{{ formatPrice(cartStore.totalAmount) }}</div>
                <div class="text-black bg-white w-1/2 h-4/5 rounded flex justify-center items-center">
                    <CreditCard />
                    <div class="text-[20px] font-bold ml-1" @click="handleCreateOrder">Buy Now</div>
                </div>
            </div>
        </div>


    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Trash2, CreditCard, MapPin } from 'lucide-vue-next'
import { useCartStore } from '@/store/cart.store';
import { useOrderStore } from '@/store/order.store';
import formatPrice from '@/utils/formatPrice';
import AddressSelector from '@/components/common/AddressSelector.vue';
import { Address } from '@/types/address.type';
import { showNotify } from 'vant';

// 路由实例
const router = useRouter();

// 选中的地址
const selectedAddress = ref<Address | null>(null);

// 初始化购物车store
const cartStore = useCartStore();
const orderStore = useOrderStore();
// 获取购物车商品列表
const cartItems = computed(() => cartStore.cartItems);


// 格式化sku
const formatSkuWithNames = (item: any): string => {
    if (!item?.sku?.sku_specs || !Array.isArray(item.sku.sku_specs) || item.sku.sku_specs.length === 0) {
        return '';
    }
    const specPairs = item.sku.sku_specs.map((spec: any) => {
        const name = spec.spec?.name || '';
        const value = spec.specValue?.value || '';
        return name && value ? `${name}: ${value}` : '';
    });

    return specPairs.filter(Boolean).join(', ');
}

// 获取sku价格
const getSkuPrice = (
    item: any,
    options: {
        showSymbol?: boolean;
        symbol?: string;
        fallback?: string;
    } = {}
): string => {
    // 检查商品和SKU是否存在
    if (!item?.sku) {
        return formatPrice(0, options);
    }

    // 使用促销价（如果有），否则使用常规价格
    const price = item.sku.promotion_price !== null ? item.sku.promotion_price : item.sku.price;

    // 使用formatPrice函数格式化价格
    return formatPrice(price, options);
}

/**
 * 更新购物车商品数量
 * @param item - 购物车商品项
 * @param change - 数量变化值（+1 或 -1）
 */
const updateQuantity = (item: any, change: number) => {
    // 获取当前数量
    let currentQuantity = Number(item.quantity) || 0;

    // 计算新数量（确保不小于1）
    const newQuantity = Math.max(1, currentQuantity + change);

    // 检查是否与当前数量相同
    if (newQuantity === currentQuantity) return;

    // 调用购物车store中的更新方法（现在支持防抖）
    cartStore.updateCartItem(item.id, { quantity: newQuantity });
}


/**
 * 删除购物车商品
 * @param item - 购物车商品项
 */
const removeItem = (item: any) => {
    cartStore.removeCartItem(item.id);
}

// 处理结算流程 - 创建订单
const handleCreateOrder = async () => {
    // 检查是否选择了地址
    if (!selectedAddress.value) {
        showNotify({ type: 'warning', message: '请选择收货地址' });
        return;
    }

    // 检查购物车是否有商品
    if (cartItems.value.length === 0) {
        showNotify({ type: 'warning', message: '购物车为空' });
        return;
    }

    // 同步购物车数据（这步可以保留）
    const syncSuccess = await cartStore.syncCartBeforeCheckout();
    if (!syncSuccess) return;

    // 收集需要的数据
    const orderDraft = {
        cartItems: cartItems.value,
        address: selectedAddress.value,
        totalAmount: cartStore.totalAmount,
        cartItemIds: cartItems.value.map(item => item.id)
    };

    // 使用store方法保存草稿 - 替代localStorage
    orderStore.setOrderDraft(orderDraft);

    // 立即跳转到订单确认页
    router.push('/order/comfirm');
}

</script>

<style scoped>
.cartItem {
    border-bottom: 1px solid #f5f5f5;
}

.quantity-control {
    height: 22px;
    background-color: #f5f5f5;
    border-radius: 11px;
    padding: 0 2px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.quantity-btn {
    width: 20px;
    height: 20px;
    min-width: 20px;
    padding: 0;
    margin: 0;
    border: none;
    background-color: transparent !important;
}

.minus-icon,
.plus-icon {
    font-size: 12px;
    font-weight: 600;
    color: #333;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.quantity-input {
    width: 24px !important;
    padding: 0 !important;
    margin: 0 2px;
    background-color: transparent;
}

/* 自定义输入框样式 */
:deep(.van-field__control) {
    height: 22px;
    min-height: 22px;
    font-size: 12px;
    padding: 0;
    text-align: center;
    background-color: transparent;
}
</style>