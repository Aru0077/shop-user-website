<!-- src/components/product/ListProductView.vue -->
<template>
      <div class="product-list"> 
            <!-- 商品列表 -->
            <div class="space-y-3">
                  <div v-for="item in items" :key="item.id" class="product-item bg-white rounded-lg p-3 flex relative">
                        <!-- 选择框 (仅在编辑模式显示) -->
                        <div v-if="isEditMode" class="mr-2 flex items-center">
                              <van-checkbox v-model="item.selected" shape="square" @change="updateSelection"
                                    class="flex-shrink-0" />
                        </div>

                        <!-- 商品图片 -->
                        <div class="flex-shrink-0 mr-3">
                              <img :src="item.image" :alt="item.name" class="w-10 h-10 object-cover rounded-md"
                                    @click="handleProductClick(item)" />
                        </div>

                        <!-- 商品信息 -->
                        <div class="flex-1 flex flex-col justify-between" @click="handleProductClick(item)">
                              <div>
                                    <div class="flex justify-between items-start">
                                          <h3 class="text-[16px] font-bold mb-1 line-clamp-2">{{ item.brand }}</h3>
                                          <!-- 非编辑模式下显示删除按钮 -->
                                          <van-icon v-if="!isEditMode" name="delete" class="text-gray-400 p-1"
                                                @click.stop="deleteItem(item.id)" />
                                    </div>
                                    <p class="text-[14px] text-gray-500 mb-1 line-clamp-1">{{ item.name }}</p>
                              </div>

                              <div class="flex justify-between items-center">
                                    <span class="text-[16px] font-bold">{{ formatPrice(item.price) }}</span>
                                    <div class="flex items-center" v-if="showQuantity">
                                          <van-stepper v-model="item.quantity" :min="1" :max="99" button-size="22px"
                                                input-width="40px" @change="updateQuantity(item)" @click.stop />
                                    </div>
                              </div>
                        </div>
                  </div>
            </div>

            <!-- 空状态 -->
            <van-empty v-if="items.length === 0" :description="emptyText" />

            <!-- 底部操作区域 (仅在购物车模式显示) -->
            <div v-if="isCartMode && items.length > 0"
                  class="bottom-actions fixed bottom-0 left-0 right-0 bg-white px-4 py-3 border-t border-gray-100 safe-area-bottom">
                  <div class="flex justify-between items-center">
                        <div class="flex items-center">
                              <van-checkbox v-model="isAllSelected" shape="square" @change="toggleSelectAll"
                                    class="text-[14px] mr-2">
                                    全选
                              </van-checkbox>
                              <div class="ml-2">
                                    <p class="text-[14px]">
                                          合计: <span class="text-[18px] font-bold text-red-500">{{
                                                formatPrice(totalPrice) }}</span>
                                    </p>
                                    <p class="text-[12px] text-gray-400">已选 {{ selectedItems.length }} 件商品</p>
                              </div>
                        </div>
                        <van-button type="danger" :disabled="selectedItems.length === 0" size="normal" round
                              @click="checkout">
                              结算({{ selectedItems.length }})
                        </van-button>
                  </div>
            </div>
      </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showDialog, showToast } from 'vant';
import { formatPrice } from '@/utils/formatPrice';

// 定义商品项类型
interface ProductItem {
      id: number | string;
      brand: string;
      name: string;
      price: number;
      image: string;
      quantity: number;
      selected: boolean;
}

// 定义组件属性
const props = defineProps<{
      // 商品列表数据
      items: ProductItem[];
      // 是否为购物车模式（显示底部结算栏）
      isCartMode?: boolean;
      // 是否为编辑模式（显示选择框）
      isEditMode?: boolean;
      // 是否显示数量控制器
      showQuantity?: boolean;
      // 空状态提示文字
      emptyText?: string;
}>();

// 定义事件
const emit = defineEmits<{
      // 商品被点击时触发
      (e: 'item-click', item: ProductItem): void;
      // 商品数量变化时触发
      (e: 'quantity-change', item: ProductItem): void;
      // 删除商品时触发
      (e: 'delete', itemIds: (number | string)[]): void;
      // 结算时触发
      (e: 'checkout', items: ProductItem[]): void;
}>();

const router = useRouter();

// 判断是否全选
const isAllSelected = computed({
      get: () => {
            return props.items.length > 0 && props.items.every(item => item.selected);
      },
      set: (value) => {
            // 由toggleSelectAll方法处理
      }
});

// 计算已选择的商品项
const selectedItems = computed(() => {
      return props.items.filter(item => item.selected);
});

// 计算总价
const totalPrice = computed(() => {
      return selectedItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

// 切换全选/全不选
const toggleSelectAll = (value: boolean) => {
      props.items.forEach(item => {
            item.selected = value;
      });
      updateSelection();
};

// 更新选择状态
const updateSelection = () => {
      // 这里可以添加你的逻辑
};

// 更新商品数量
const updateQuantity = (item: ProductItem) => {
      emit('quantity-change', item);
};

// 处理商品点击
const handleProductClick = (item: ProductItem) => {
      if (props.isEditMode) {
            // 编辑模式下点击切换选择状态
            item.selected = !item.selected;
            updateSelection();
      } else {
            // 非编辑模式下跳转到商品详情
            emit('item-click', item);
            router.push(`/product/detail/${item.id}`);
      }
};

// 删除单个商品
const deleteItem = (itemId: number | string) => {
      showDialog({
            title: '确认删除',
            message: '确定要删除这个商品吗？',
            showCancelButton: true,
      }).then(() => {
            emit('delete', [itemId]);
      }).catch(() => {
            // 取消删除操作
      });
};

// 确认批量删除
const confirmDelete = () => {
      if (selectedItems.value.length === 0) {
            showToast('请先选择要删除的商品');
            return;
      }

      showDialog({
            title: '确认删除',
            message: `确定要删除选中的 ${selectedItems.value.length} 个商品吗？`,
            showCancelButton: true,
      }).then(() => {
            const selectedIds = selectedItems.value.map(item => item.id);
            emit('delete', selectedIds);
      }).catch(() => {
            // 取消删除操作
      });
};

// 结算
const checkout = () => {
      if (selectedItems.value.length === 0) {
            showToast('请先选择要结算的商品');
            return;
      }
      emit('checkout', selectedItems.value);
};
</script>

<style scoped>
.product-item {
      transition: background-color 0.2s;
}

.product-item:active {
      background-color: #f5f5f5;
}

/* 底部安全区域 */
.safe-area-bottom {
      padding-bottom: constant(safe-area-inset-bottom);
      padding-bottom: env(safe-area-inset-bottom);
}

</style>