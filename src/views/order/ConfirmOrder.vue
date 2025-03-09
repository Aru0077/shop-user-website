<!-- src/views/OrderConfirm.vue -->
<template>
      <div class="flex flex-col h-full">

            <!-- 主要内容区 -->
            <div class="flex-1 overflow-y-auto pageContent">
                  <!-- 收货地址 -->
                  <div class="address-card bg-white p-2 mb-2 rounded-md">
                        <div class="flex items-center gap-1">
                              <MapPin class="text-gray-500" :size="20" />
                              <div class="flex-1">
                                    <div class="flex items-center text-[14px]">
                                          <span class="font-medium ">{{ draftData?.address?.receiverName }}</span>
                                          <span class="ml-2">{{ draftData?.address?.receiverPhone }}</span>
                                    </div>
                                    <div class="text-[12px] text-gray-600 mt-0.5">
                                          {{ draftData?.address?.province }}, {{ draftData?.address?.city }},
                                          {{ draftData?.address?.detailAddress }}
                                    </div>
                              </div>
                        </div>
                  </div>

                  <!-- 商品列表 -->
                  <div class="order-items bg-white p-2 mb-2 rounded-md">
                        <div class="text-[20px] font-medium mb-1">商品信息</div>
                        <div v-for="(item, index) in draftData?.cartItems" :key="index" class="flex py-1 items-center">
                              <!-- 商品图片 -->
                              <van-image :src="item.product?.mainImage" fit="cover" width="60" height="60"
                                    radius="4px" />

                              <!-- 商品信息 -->
                              <div class="ml-2 flex-1">
                                    <div class="font-medium text-[14px]">{{ item.product?.name }}</div>
                                    <div class="text-[12px] text-gray-500">{{ formatSkuWithNames(item) }}</div>
                                    <div class="flex justify-between mt-1 text-[12px]">
                                          <span class="text-red-500">{{ getSkuPrice(item) }}</span>
                                          <span>×{{ item.quantity }}</span>
                                    </div>
                              </div>
                        </div>
                  </div>

                  <!-- 订单金额 -->
                  <div class="order-amount bg-white p-2 rounded-md  text-[16px]">
                        <div class="flex justify-between py-1">
                              <div>商品总价</div>
                              <div>{{ formatPrice(draftData?.totalAmount || 0) }}</div>
                        </div>
                        <div class="flex justify-between py-1">
                              <div>运费</div>
                              <div>{{ formatPrice(0) }}</div>
                        </div>
                        <div class="flex justify-between py-1 font-bold">
                              <div>实付金额</div>
                              <div class="text-red-500">{{ formatPrice(draftData?.totalAmount || 0) }}</div>
                        </div>
                  </div>

                  <!-- 订单备注 -->
                  <div class="order-remark bg-white p-2 mt-2 rounded-md">
                        <div class="flex items-center">
                              <div class="mr-2 text-[16px]">订单备注</div>
                              <van-field v-model="remark" placeholder="选填，请填写备注信息" class="flex-1" :border="false" />
                        </div>
                  </div>
            </div>

            <!-- 底部操作区 -->
            <div class="h-[50px] flex justify-between items-center p-2 bg-white border-t">
                  <div class="text-lg font-bold text-red-500">{{ formatPrice(draftData?.totalAmount || 0) }}</div>
                  <van-button type="danger" size="small" :loading="submitting"
                        :disabled="!createdOrderId && !isCreatingOrder" @click="submitOrder">
                        提交订单
                  </van-button>
            </div>
      </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showNotify, showLoadingToast, closeToast } from 'vant';
import { MapPin } from 'lucide-vue-next';
import { useOrderStore } from '@/store/order.store';
import { useCartStore } from '@/store/cart.store';
import formatPrice from '@/utils/formatPrice';
import NavBar from '@/components/common/NavBar.vue';

const router = useRouter();
const orderStore = useOrderStore();
const cartStore = useCartStore();
const submitting = ref(false);
const isCreatingOrder = ref(false);
const createdOrderId = ref('');
const remark = ref('');

// 从store获取订单草稿数据
const draftData = computed(() => orderStore.getOrderDraft());

// 格式化SKU（复用购物车的函数）
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
};

// 获取SKU价格
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
};

// 返回购物车
const onClickLeft = () => {
      router.back();
};

// 初始化
onMounted(async () => {
      // 检查是否有订单草稿数据
      if (!draftData.value) {
            showNotify({ type: 'danger', message: '订单数据不存在' });
            router.replace('/cart');
            return;
      }

      // 后台异步创建真实订单
      createRealOrder();
});

// 后台创建真实订单
const createRealOrder = async () => {
      if (!draftData.value || isCreatingOrder.value) return;

      isCreatingOrder.value = true;

      try {
            showLoadingToast({ message: '准备订单中...', duration: 0 });

            // 调用订单创建API
            const createdOrder = await orderStore.createOrderFromDraft();

            closeToast();

            if (createdOrder) {
                  // 更新订单ID
                  createdOrderId.value = createdOrder.id;
            } else {
                  throw new Error('创建订单失败');
            }
      } catch (error) {
            closeToast();
            showNotify({
                  type: 'warning',
                  message: '订单准备中出现问题，请重试'
            });
      } finally {
            isCreatingOrder.value = false;
      }
};

// 提交订单
const submitOrder = async () => {
      // 如果订单尚未创建，且不在创建过程中，尝试创建
      if (!createdOrderId.value && !isCreatingOrder.value) {
            await createRealOrder();
      }

      if (!createdOrderId.value) {
            showNotify({ type: 'warning', message: '订单尚未准备好，请稍候' });
            return;
      }

      submitting.value = true;
      try {
            // 直接跳转到支付页
            router.push(`/payment/${createdOrderId.value}`);

            // 完成后清空订单草稿
            orderStore.clearOrderDraft();

            // 直接跳转到支付页
            router.push(`/payment/${createdOrderId.value}`);

            // 清空整个购物车（因为没有选择功能，整个购物车都已结算）
            setTimeout(() => {
                  cartStore.clearAllCart(); // 使用清空整个购物车的方法，而不是逐个移除
            }, 300);
            
      } catch (error) {
            showNotify({ type: 'danger', message: '提交订单失败，请重试' });
      } finally {
            submitting.value = false;
      }
};
</script>

<style scoped>
.pageContent {
      padding: 10px;
      background-color: #f5f5f5;
}

:deep(.van-field__control) {
      background-color: transparent;
}
</style>