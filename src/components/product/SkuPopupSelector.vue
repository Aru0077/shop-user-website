<!-- SkuPopupSelector.vue -->
<template>
      <van-popup v-model:show="show" position="bottom" round :style="{ height: '60%' }" closeable @closed="onClosed">
            <div class="sku-popup-container">
                  <!-- 顶部区域，显示图片和价格 -->
                  <div class="sku-header">
                        <div class="sku-image">
                              <img :src="selectedSku?.image || product.mainImage" alt="Product Image" />
                        </div>
                        <div class="sku-price-info">
                              <!-- 价格显示区域 - 如果有促销价则显示促销价 -->
                              <div class="price-display">
                                    <span class="promotion-price"
                                          v-if="selectedSku?.promotion_price !== undefined && selectedSku?.promotion_price !== null">
                                          ¥{{ formatPrice(totalPrice) }}
                                    </span>
                                    <span class="original-price"
                                          :class="{ 'has-promotion': selectedSku?.promotion_price !== undefined && selectedSku?.promotion_price !== null }">
                                          ¥{{ formatPrice(totalPrice) }}
                                    </span>
                              </div>
                              <!-- 库存显示 -->
                              <div class="stock-info">
                                    Stock: <span>{{ selectedSku?.stock || 0 }}</span>
                              </div>
                              <!-- 已选规格摘要 -->
                              <div class="selected-specs" v-if="selectedSpecs.size > 0">
                                    <span>Selected: </span>
                                    <template v-for="([specId, valueId]) in selectedSpecs" :key="specId">
                                          {{ getSpecName(specId) }}: {{ getSpecValueName(specId, valueId) }}
                                    </template>
                              </div>
                        </div>
                  </div>

                  <!-- 数量选择器 -->
                  <div class="quantity-selector">
                        <div class="quantity-label">Quantity</div>
                        <div class="quantity-control">
                              <div class="quantity-btn decrease" :class="{ 'disabled': quantity <= 1 }"
                                    @click="decreaseQuantity">
                                    <span class="icon">-</span>
                              </div>
                              <input type="number" v-model.number="quantity" class="quantity-input" min="1"
                                    :max="maxQuantity" @input="validateQuantity" />
                              <div class="quantity-btn increase" :class="{ 'disabled': quantity >= maxQuantity }"
                                    @click="increaseQuantity">
                                    <span class="icon">+</span>
                              </div>
                        </div>
                  </div>

                  <!-- 规格选择区域 -->
                  <div class="specs-container">
                        <div v-for="spec in specs" :key="spec.id" class="spec-group">
                              <div class="spec-title">{{ spec.name }}</div>
                              <div class="spec-values">
                                    <div v-for="value in spec.values" :key="value.id" class="spec-value" :class="{
                                          'selected': isSpecValueSelected(spec.id, value.id),
                                          'disabled': !isSpecValueAvailable(spec.id, value.id)
                                    }" @click="selectSpecValue(spec.id, value.id)">
                                          {{ value.value }}
                                    </div>
                              </div>
                        </div>
                  </div>

                  <!-- 底部操作按钮 -->
                  <div class="action-button">
                        <button class="add-to-cart-btn" @click="addToCart">Add to Cart</button>
                  </div>
            </div>
      </van-popup>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { formatPrice } from '@/utils/formatPrice';
import type { Product, Sku, Spec, SpecValue } from '@/types/product.type';
import { useCartStore } from '@/store/cart.store';

// 定义组件属性
const props = defineProps<{
      product: Product;  // 产品信息，包含所有SKU
      initialSkuId?: number; // 可选的初始SKU ID
      visible: boolean; // 控制弹窗显示状态
}>();

// 定义对外暴露的事件
const emit = defineEmits<{
      (e: 'update:visible', visible: boolean): void;
      (e: 'close'): void;
}>();

// 初始化购物车store
const cartStore = useCartStore();

// 同步弹窗显示状态与visible属性
const show = computed({
      get: () => props.visible,
      set: (value) => emit('update:visible', value)
});

// 提取所有规格和规格值
const specs = computed<Spec[]>(() => {
      const result: Spec[] = [];

      // 确保产品和SKU存在
      if (!props.product || !props.product.skus || props.product.skus.length === 0) {
            return result;
      }

      // 收集所有规格
      const specsMap = new Map<number, Spec>();

      // 遍历所有SKU规格
      props.product.skus.forEach(sku => {
            if (sku.sku_specs) {
                  sku.sku_specs.forEach(skuSpec => {
                        // 添加规格
                        if (!specsMap.has(skuSpec.spec.id)) {
                              specsMap.set(skuSpec.spec.id, {
                                    id: skuSpec.spec.id,
                                    name: skuSpec.spec.name,
                                    values: []
                              });
                        }
                  });
            }
      });

      // 将Map转换为数组
      result.push(...Array.from(specsMap.values()));

      // 填充规格值
      result.forEach(spec => {
            const valuesMap = new Map<number, SpecValue>();

            props.product.skus?.forEach(sku => {
                  sku.sku_specs?.forEach(skuSpec => {
                        if (skuSpec.spec.id === spec.id && !valuesMap.has(skuSpec.specValue.id)) {
                              valuesMap.set(skuSpec.specValue.id, skuSpec.specValue);
                        }
                  });
            });

            spec.values = Array.from(valuesMap.values());
      });

      return result;
});

// 已选择的规格
const selectedSpecs = ref<Map<number, number>>(new Map());

// 当前选中的SKU
const selectedSku = computed<Sku | null>(() => {
      if (!props.product.skus || props.product.skus.length === 0) {
            return null;
      }

      // 如果没有选择规格或选择的规格数量少于总规格数，返回null
      if (selectedSpecs.value.size === 0 || selectedSpecs.value.size < specs.value.length) {
            return null;
      }

      // 查找匹配的SKU
      return props.product.skus.find(sku => {
            if (!sku.sku_specs || sku.sku_specs.length === 0) {
                  return false;
            }

            // 检查所有选择的规格值是否匹配
            for (const [specId, valueId] of selectedSpecs.value.entries()) {
                  const matchingSpec = sku.sku_specs.find(
                        spec => spec.specId === specId && spec.specValueId === valueId
                  );

                  if (!matchingSpec) {
                        return false;
                  }
            }

            return true;
      }) || null;
});

// 数量选择
const quantity = ref(1);
const maxQuantity = computed(() => (selectedSku.value?.stock || 0) > 0 ? selectedSku.value?.stock || 0 : 0);

// 计算总价
const totalPrice = computed(() => {
      if (!selectedSku.value) {
            return 0;
      }

      const price = selectedSku.value.promotion_price !== null && selectedSku.value.promotion_price !== undefined
            ? selectedSku.value.promotion_price
            : selectedSku.value.price;

      return price * quantity.value;
});

// 检查规格值是否被选中
function isSpecValueSelected(specId: number, valueId: number): boolean {
      return selectedSpecs.value.get(specId) === valueId;
}

// 检查规格值是否可用
function isSpecValueAvailable(specId: number, valueId: number): boolean {
      // 如果没有SKU，所有值都不可用
      if (!props.product.skus || props.product.skus.length === 0) {
            return false;
      }

      // 创建当前选择状态的副本并设置要检查的值
      const tempSelected = new Map(selectedSpecs.value);
      tempSelected.set(specId, valueId);

      // 检查是否有任何SKU满足当前选择
      return props.product.skus.some(sku => {
            if (!sku.sku_specs || sku.sku_specs.length === 0 || sku.stock === 0) {
                  return false;
            }

            // 筛选已选择的规格，不考虑其他规格
            const activeSpecs = Array.from(tempSelected.keys());

            // 检查SKU是否满足当前选择的条件
            for (const specId of activeSpecs) {
                  const valueId = tempSelected.get(specId);
                  const matchingSpec = sku.sku_specs.find(
                        spec => spec.specId === specId && spec.specValueId === valueId
                  );

                  if (!matchingSpec) {
                        return false;
                  }
            }

            return true;
      });
}

// 获取规格名称和规格值名称的辅助函数
function getSpecName(specId: number): string {
      const spec = specs.value.find(s => s.id === specId);
      return spec ? spec.name : '';
}

function getSpecValueName(specId: number, valueId: number): string {
      const spec = specs.value.find(s => s.id === specId);
      if (!spec || !spec.values) return '';

      const value = spec.values.find(v => v.id === valueId);
      return value ? value.value : '';
}

// 选择规格值
function selectSpecValue(specId: number, valueId: number) {
      if (!isSpecValueAvailable(specId, valueId)) {
            return;
      }

      // 已经选择了这个值，不做任何操作
      if (isSpecValueSelected(specId, valueId)) {
            return;
      }

      // 更新选择
      selectedSpecs.value.set(specId, valueId);
      // 创建新的Map以触发响应式更新
      selectedSpecs.value = new Map(selectedSpecs.value);
}

// 增加数量
function increaseQuantity() {
      if (selectedSku.value && quantity.value < maxQuantity.value) {
            quantity.value++;
      }
}

// 减少数量
function decreaseQuantity() {
      if (quantity.value > 1) {
            quantity.value--;
      }
}

// 验证输入数量
function validateQuantity() {
      // 确保数量是整数
      quantity.value = Math.floor(quantity.value);

      // 确保数量在有效范围内
      if (quantity.value < 1) {
            quantity.value = 1;
      } else if (maxQuantity.value > 0 && quantity.value > maxQuantity.value) {
            quantity.value = maxQuantity.value;
      }
}

// 处理弹窗关闭
function onClosed() {
      emit('close');
}

// 添加到购物车
async function addToCart() {
      if (!selectedSku.value) {
            return;
      }
      
      show.value = false;

      // 使用购物车store直接添加商品
      const result = await cartStore.addToCart({
            productId: props.product.id,
            skuId: selectedSku.value.id,
            quantity: quantity.value
      });

      // if (result) {
      //       // 添加成功后关闭弹窗
      //       show.value = false;
      // }
}

// 初始化：如果提供了初始SKU ID，自动选择相应的规格组合
onMounted(() => {
      if (props.product.skus && props.product.skus.length > 0) {
            let skuToSelect: Sku | undefined;

            // 如果提供了初始SKU ID，查找相应的SKU
            if (props.initialSkuId) {
                  skuToSelect = props.product.skus.find(sku => sku.id === props.initialSkuId);
            }

            // 如果没有指定初始SKU或找不到指定的SKU，选择第一个有库存的SKU
            if (!skuToSelect) {
                  skuToSelect = props.product.skus.find(sku => sku.stock && sku.stock > 0);
            }

            // 如果找到可用的SKU，选择其规格
            if (skuToSelect && skuToSelect.sku_specs) {
                  skuToSelect.sku_specs.forEach(spec => {
                        selectedSpecs.value.set(spec.specId, spec.specValueId);
                  });
                  // 创建新的Map以触发响应式更新
                  selectedSpecs.value = new Map(selectedSpecs.value);
            }
      }
});
</script>

<style scoped>
.sku-popup-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px;
      box-sizing: border-box;
}

.sku-header {
      display: flex;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f5f5f5;
}

.sku-image {
      width: 100px;
      height: 100px;
      border-radius: 4px;
      overflow: hidden;
      margin-right: 16px;
}

.sku-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
}

.sku-price-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
}

.price-display {
      margin-bottom: 8px;
}

.promotion-price {
      font-size: 22px;
      font-weight: bold;
      color: #ff6000;
      margin-right: 8px;
}

.original-price {
      font-size: 18px;
      color: #333;
}

.original-price.has-promotion {
      font-size: 14px;
      color: #999;
      text-decoration: line-through;
}

.stock-info {
      font-size: 13px;
      color: #666;
      margin-bottom: 8px;
}

.stock-info span {
      color: #333;
      font-weight: 500;
}

.selected-specs {
      font-size: 13px;
      color: #666;
}

.quantity-selector {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
}

.quantity-label {
      font-size: 15px;
      font-weight: 500;
      color: #333;
}

.quantity-control {
      display: flex;
      align-items: center;
      border-radius: 4px;
      overflow: hidden;
}

.quantity-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f5f5f5;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;
}

.quantity-btn .icon {
      font-size: 18px;
      line-height: 1;
}

.quantity-btn.decrease {
      border-top-left-radius: 16px;
      border-bottom-left-radius: 16px;
}

.quantity-btn.increase {
      border-top-right-radius: 16px;
      border-bottom-right-radius: 16px;
}

.quantity-btn:active {
      background-color: #e0e0e0;
}

.quantity-btn.disabled {
      color: #ccc;
      background-color: #f8f8f8;
      cursor: not-allowed;
}

.quantity-input {
      width: 50px;
      height: 32px;
      border: none;
      border-top: 1px solid #f0f0f0;
      border-bottom: 1px solid #f0f0f0;
      text-align: center;
      font-size: 14px;
      background-color: #fff;
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
}

.specs-container {
      flex: 1;
      overflow-y: auto;
}

.spec-group {
      margin-bottom: 20px;
}

.spec-title {
      font-size: 15px;
      font-weight: 500;
      margin-bottom: 12px;
      color: #333;
}

.spec-values {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
}

.spec-value {
      height: 32px;
      padding: 0 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 16px;
      border: 1px solid #e8e8e8;
      background-color: #fff;
      font-size: 13px;
      transition: all 0.2s ease;
      cursor: pointer;
}

.spec-value.selected {
      color: #fff;
      background-color: #333;
      border-color: #333;
      font-weight: 500;
}

.spec-value.disabled {
      color: #ccc;
      border-color: #f0f0f0;
      background-color: #f8f8f8;
      cursor: not-allowed;
}

.action-button {
      margin-top: 20px;
      padding-top: 15px;
}

.add-to-cart-btn {
      width: 100%;
      height: 44px;
      font-size: 16px;
      font-weight: 500;
      color: #fff;
      background-color: #ff6000;
      border: none;
      border-radius: 22px;
      cursor: pointer;
}
</style>