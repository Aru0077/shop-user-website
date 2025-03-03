<!-- src/components/product/SkuSelector.vue -->
<template>
      <div class="sku-selector">
            <!-- 价格信息展示区 -->
            <div class="price-area mb-4">
                  <div class="text-[22px] font-bold text-red-600">
                        {{ formatPrice(selectedSku ? selectedSku.price : 0) }}
                  </div>
                  <div v-if="selectedSku && selectedSku.promotion_price"
                        class="text-[14px] line-through text-gray-400 ml-2">
                        {{ formatPrice(selectedSku.promotion_price) }}
                  </div>
            </div>

            <!-- 规格选择区域 -->
            <div class="specs-container">
                  <div v-for="spec in specs" :key="spec.id" class="spec-group mb-4">
                        <div class="spec-title-row flex items-center mb-2">
                              <div class="spec-indicator"></div>
                              <div class="spec-title text-[15px] font-medium text-gray-800">{{ spec.name }}</div>
                        </div>

                        <div class="spec-options flex flex-wrap gap-2">
                              <div v-for="value in spec.values" :key="value.id" class="spec-option" :class="{
                                    'selected': isSelected(spec.id, value.id),
                                    'disabled': !isValueAvailable(spec.id, value.id)
                              }" @click="selectSpecValue(spec.id, value.id)">
                                    {{ value.value }}
                              </div>
                        </div>
                  </div>
            </div>

            <!-- 选择状态提示 -->
            <div v-if="!selectedSku && !isSelectionComplete" class="selection-hint">
                  请选择: {{ getUnselectedSpecs() }}
            </div>
            <div v-else-if="!selectedSku" class="selection-error">
                  所选规格组合不可用，请重新选择
            </div>

            <!-- SKU详细信息 -->
            <div v-if="selectedSku" class="sku-details">
                  <div class="stock-info">
                        库存: <span class="font-medium">{{ selectedSku.stock - (selectedSku.lockedStock || 0) }}</span> 件
                  </div>
                  <div v-if="selectedSku.skuCode" class="sku-code">
                        商品编码: <span class="text-gray-500">{{ selectedSku.skuCode }}</span>
                  </div>
            </div>

            <!-- 数量选择器 -->
            <div class="quantity-selector">
                  <div class="quantity-title">购买数量</div>
                  <div class="quantity-controls">
                        <button class="quantity-btn decrease" :disabled="quantity <= 1" @click="decreaseQuantity">
                              <span class="icon">-</span>
                        </button>
                        <div class="quantity-value">{{ quantity }}</div>
                        <button class="quantity-btn increase" :disabled="!selectedSku || quantity >= maxQuantity"
                              @click="increaseQuantity">
                              <span class="icon">+</span>
                        </button>
                  </div>
            </div>
      </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// 接收参数
const props = defineProps({
      specs: {
            type: Array,
            required: true
      },
      skus: {
            type: Array,
            required: true
      },
      initialSelection: {
            type: Object,
            default: () => ({})
      }
});

// 向父组件发送事件
const emit = defineEmits(['update:selection', 'sku-change']);

// 用户选择的规格值
const selectedSpecs = ref({ ...props.initialSelection });

// 计算：当前选择是否完整
const isSelectionComplete = computed(() => {
      return props.specs.every(spec => selectedSpecs.value[spec.id] !== undefined);
});

// 根据当前选择查找匹配的SKU
const selectedSku = computed(() => {
      if (!isSelectionComplete.value) return null;

      return props.skus.find(sku => {
            if (!sku.sku_specs || sku.sku_specs.length === 0) return false;

            // 检查SKU的所有规格是否与用户选择匹配
            return sku.sku_specs.every(spec =>
                  selectedSpecs.value[spec.specId] === spec.specValueId
            );
      });
});

// 检查指定规格值是否被选中
const isSelected = (specId, valueId) => {
      return selectedSpecs.value[specId] === valueId;
};

// 检查指定规格值是否可选（有库存）
const isValueAvailable = (specId, valueId) => {
      // 克隆当前选择
      const hypotheticalSelection = { ...selectedSpecs.value, [specId]: valueId };

      // 检查是否所有规格都已选择
      const isComplete = props.specs.every(spec =>
            hypotheticalSelection[spec.id] !== undefined
      );

      // 如果选择不完整，则该值可选
      if (!isComplete) return true;

      // 寻找与假设选择匹配的SKU
      const matchingSku = props.skus.find(sku => {
            return sku.sku_specs.every(spec =>
                  hypotheticalSelection[spec.specId] === spec.specValueId
            );
      });

      // 如果找到匹配的SKU且有库存，则该值可选
      return matchingSku && matchingSku.stock > (matchingSku.lockedStock || 0);
};

// 选择规格值
const selectSpecValue = (specId, valueId) => {
      // 如果规格值不可用，不做任何操作
      if (!isValueAvailable(specId, valueId)) return;

      // 如果已选择此值，则取消选择
      if (isSelected(specId, valueId)) {
            const newSelection = { ...selectedSpecs.value };
            delete newSelection[specId];
            selectedSpecs.value = newSelection;
      } else {
            // 否则选择此值
            selectedSpecs.value = { ...selectedSpecs.value, [specId]: valueId };
      }

      // 向父组件通知选择变更
      emit('update:selection', selectedSpecs.value);
};

// 获取未选择的规格名称列表
const getUnselectedSpecs = () => {
      const unselectedSpecs = props.specs.filter(spec =>
            selectedSpecs.value[spec.id] === undefined
      );
      return unselectedSpecs.map(spec => spec.name).join('、');
};

// 价格格式化函数
const formatPrice = (price) => {
      return `¥${price.toLocaleString()}`;
};

// 监听选择变化，通知父组件SKU变更
watch(selectedSku, (newSku) => {
      if (newSku) {
            emit('sku-change', newSku);
      }
}, { immediate: true });
</script>

<style scoped>
.sku-selector {
      width: 100%;
      padding: 16px 0;
}

/* 价格区域样式 */
.price-area {
      display: flex;
      align-items: flex-end;
      margin-bottom: 20px;
}

/* 规格选择区域 */
.specs-container {
      margin-bottom: 16px;
}

.spec-title-row {
      margin-bottom: 10px;
      display: flex;
      align-items: center;
}

.spec-indicator {
      width: 4px;
      height: 16px;
      background-color: #333;
      border-radius: 2px;
      margin-right: 8px;
}

.spec-options {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
}

.spec-option {
      padding: 6px 16px;
      font-size: 13px;
      border-radius: 20px;
      border: 1px solid #ddd;
      background-color: #f9f9f9;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
}

.spec-option:active {
      transform: scale(0.97);
}

.spec-option.selected {
      background-color: #000;
      color: #fff;
      border-color: #000;
}

.spec-option.disabled {
      opacity: 0.4;
      cursor: not-allowed;
      border-color: #eee;
}

.spec-option.disabled:active {
      transform: none;
}

/* 选择状态提示 */
.selection-hint {
      color: #f59e0b;
      font-size: 14px;
      margin: 12px 0;
      padding: 8px 12px;
      background-color: #fff7ed;
      border-radius: 8px;
}

.selection-error {
      color: #ef4444;
      font-size: 14px;
      margin: 12px 0;
      padding: 8px 12px;
      background-color: #fef2f2;
      border-radius: 8px;
}

/* SKU详细信息 */
.sku-details {
      margin: 16px 0;
      padding: 12px;
      background-color: #f8f8f8;
      border-radius: 10px;
}

.stock-info {
      font-size: 14px;
      color: #4b5563;
      margin-bottom: 4px;
}

.sku-code {
      font-size: 12px;
      color: #6b7280;
}

/* 数量选择器 */
.quantity-selector {
      margin-top: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background-color: #f8fafc;
      border-radius: 12px;
}

.quantity-title {
      font-size: 15px;
      font-weight: 500;
      color: #333;
}

.quantity-controls {
      display: flex;
      align-items: center;
}

.quantity-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: white;
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
}

.quantity-btn:active {
      transform: scale(0.95);
      background-color: #f3f4f6;
}

.quantity-btn.decrease {
      font-size: 18px;
}

.quantity-btn.increase {
      font-size: 18px;
}

.quantity-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
}

.quantity-btn:disabled:active {
      transform: none;
      background-color: white;
}

.quantity-value {
      width: 50px;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
}

.icon {
      font-size: 16px;
      line-height: 1;
}
</style>